import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { AppState } from 'react-native';

// App Store review timing, ported from Math Reef's ReefReview.
//
// It lives on this device under its own key, apart from settings and progress.
// A finished round with at least one star queues a request once the learner
// holds a mastery crown; the request itself is only made behind the parent
// check in Settings, so a grown-up sees it, never a child mid-play. StoreKit
// doesn't say whether its sheet appeared or a review was left, so this counts
// requests, not reviews.

export const REVIEW_REQUEST_STORAGE_KEY = 'time-tutor-review-v1';
export const MAX_REVIEW_REQUESTS = 2;
export const REVIEW_RETRY_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000;

export type ReviewRequestState = {
  lastRequestAt: number | null;
  pending: boolean;
  requestCount: number;
};

export type FinishedRound = {
  earnedStars: number;
  hasCrown: boolean;
};

export function createDefaultReviewRequestState(): ReviewRequestState {
  return {
    lastRequestAt: null,
    pending: false,
    requestCount: 0,
  };
}

export function normalizeReviewRequestState(value: unknown): ReviewRequestState {
  const defaults = createDefaultReviewRequestState();

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults;
  }

  const stored = value as Record<string, unknown>;

  return {
    lastRequestAt: isFiniteNumber(stored.lastRequestAt)
      ? stored.lastRequestAt
      : defaults.lastRequestAt,
    pending: stored.pending === true,
    requestCount:
      isFiniteNumber(stored.requestCount) && stored.requestCount > 0
        ? Math.floor(stored.requestCount)
        : defaults.requestCount,
  };
}

export function isEligibleForReview(state: ReviewRequestState, now: number) {
  if (state.requestCount >= MAX_REVIEW_REQUESTS) {
    return false;
  }

  if (state.lastRequestAt === null) {
    return true;
  }

  return now - state.lastRequestAt >= REVIEW_RETRY_INTERVAL_MS;
}

/** Existing crowns qualify too, including ones earned before this shipped. */
export function applyFinishedRound(
  state: ReviewRequestState,
  round: FinishedRound,
  now: number,
): ReviewRequestState {
  if (
    state.pending ||
    round.earnedStars < 1 ||
    !round.hasCrown ||
    !isEligibleForReview(state, now)
  ) {
    return state;
  }

  return { ...state, pending: true };
}

export function shouldRequestReview(state: ReviewRequestState, now: number) {
  return state.pending && isEligibleForReview(state, now);
}

/** Apply only when actually handing a request to StoreKit. */
export function applyDidRequest(
  state: ReviewRequestState,
  now: number,
): ReviewRequestState {
  if (!shouldRequestReview(state, now)) {
    return state;
  }

  return {
    lastRequestAt: now,
    pending: false,
    requestCount: state.requestCount + 1,
  };
}

export async function loadReviewRequestState(): Promise<ReviewRequestState> {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_REQUEST_STORAGE_KEY);

    return normalizeReviewRequestState(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultReviewRequestState();
  }
}

async function saveReviewRequestState(state: ReviewRequestState) {
  try {
    await AsyncStorage.setItem(REVIEW_REQUEST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Review timing is best-effort; a failed write just means no prompt.
  }
}

export async function recordFinishedRound(
  round: FinishedRound,
  now: number = Date.now(),
) {
  const state = await loadReviewRequestState();
  const next = applyFinishedRound(state, round, now);

  if (next !== state) {
    await saveReviewRequestState(next);
  }
}

export async function isReviewRequestDue(now: number = Date.now()) {
  return shouldRequestReview(await loadReviewRequestState(), now);
}

/** Returns whether a request was recorded (and so should be made). */
export async function recordReviewRequested(now: number = Date.now()) {
  const state = await loadReviewRequestState();
  const next = applyDidRequest(state, now);

  if (next === state) {
    return false;
  }

  await saveReviewRequestState(next);
  return true;
}

/**
 * Asks StoreKit for its rating sheet when a review is due. Call it only once a
 * grown-up has passed the parent check and the check's modal is fully gone.
 * `isCancelled` is checked after every wait so leaving Settings stops it.
 */
export async function requestReviewIfDue(isCancelled: () => boolean) {
  try {
    if (!(await isReviewRequestDue())) {
      return false;
    }

    if (isCancelled() || AppState.currentState !== 'active') {
      return false;
    }

    if (!(await StoreReview.isAvailableAsync())) {
      return false;
    }

    if (isCancelled() || AppState.currentState !== 'active') {
      return false;
    }

    if (!(await recordReviewRequested())) {
      return false;
    }

    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
