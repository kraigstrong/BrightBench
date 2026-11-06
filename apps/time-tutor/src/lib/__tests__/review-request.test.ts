import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { AppState } from 'react-native';

import {
  REVIEW_REQUEST_STORAGE_KEY,
  REVIEW_RETRY_INTERVAL_MS,
  applyDidRequest,
  applyFinishedRound,
  createDefaultReviewRequestState,
  loadReviewRequestState,
  normalizeReviewRequestState,
  recordFinishedRound,
  recordReviewRequested,
  requestReviewIfDue,
  shouldRequestReview,
  type ReviewRequestState,
} from '@/lib/review-request';

const getItemMock = AsyncStorage.getItem as jest.Mock;
const setItemMock = AsyncStorage.setItem as jest.Mock;
const isAvailableAsyncMock = StoreReview.isAvailableAsync as jest.Mock;
const requestReviewMock = StoreReview.requestReview as jest.Mock;

const PENDING_REVIEW = JSON.stringify({
  lastRequestAt: null,
  pending: true,
  requestCount: 0,
});

function setAppState(value: unknown) {
  Object.defineProperty(AppState, 'currentState', { configurable: true, value });
}

const NOW = Date.UTC(2026, 10, 6);
const DAY_MS = 24 * 60 * 60 * 1000;

function state(overrides: Partial<ReviewRequestState> = {}): ReviewRequestState {
  return { ...createDefaultReviewRequestState(), ...overrides };
}

describe('review request timing', () => {
  it('marks a review pending after a round with a star once the learner has a crown', () => {
    const next = applyFinishedRound(state(), { earnedStars: 1, hasCrown: true }, NOW);

    expect(next.pending).toBe(true);
    expect(shouldRequestReview(next, NOW)).toBe(true);
  });

  it('does not mark a review pending without a crown', () => {
    const next = applyFinishedRound(state(), { earnedStars: 3, hasCrown: false }, NOW);

    expect(next.pending).toBe(false);
    expect(shouldRequestReview(next, NOW)).toBe(false);
  });

  it('does not mark a review pending for a round with no stars', () => {
    const next = applyFinishedRound(state(), { earnedStars: 0, hasCrown: true }, NOW);

    expect(next.pending).toBe(false);
  });

  it('records a request by clearing pending and counting it', () => {
    const pending = applyFinishedRound(state(), { earnedStars: 2, hasCrown: true }, NOW);
    const next = applyDidRequest(pending, NOW);

    expect(next).toEqual({ lastRequestAt: NOW, pending: false, requestCount: 1 });
    expect(shouldRequestReview(next, NOW)).toBe(false);
  });

  it('does not record a request when none is due', () => {
    const idle = state();

    expect(applyDidRequest(idle, NOW)).toBe(idle);
  });

  it('waits 90 days after a request before queueing another', () => {
    const afterFirst = state({ lastRequestAt: NOW, requestCount: 1 });
    const justBefore = NOW + REVIEW_RETRY_INTERVAL_MS - 1;
    const atNinetyDays = NOW + 90 * DAY_MS;

    expect(
      applyFinishedRound(afterFirst, { earnedStars: 3, hasCrown: true }, justBefore).pending,
    ).toBe(false);

    const queued = applyFinishedRound(
      afterFirst,
      { earnedStars: 3, hasCrown: true },
      atNinetyDays,
    );

    expect(queued.pending).toBe(true);
    expect(shouldRequestReview(queued, atNinetyDays)).toBe(true);
    expect(shouldRequestReview(queued, justBefore)).toBe(false);
  });

  it('never asks a third time', () => {
    let current = state();
    let now = NOW;

    for (let request = 0; request < 2; request += 1) {
      current = applyFinishedRound(current, { earnedStars: 3, hasCrown: true }, now);
      current = applyDidRequest(current, now);
      now += REVIEW_RETRY_INTERVAL_MS;
    }

    expect(current.requestCount).toBe(2);

    const later = now + 365 * DAY_MS;
    const afterRound = applyFinishedRound(current, { earnedStars: 3, hasCrown: true }, later);

    expect(afterRound.pending).toBe(false);
    expect(shouldRequestReview({ ...afterRound, pending: true }, later)).toBe(false);
    expect(applyDidRequest({ ...afterRound, pending: true }, later).requestCount).toBe(2);
  });

  it('normalizes missing, garbage, and partial stored values to safe defaults', () => {
    const defaults = createDefaultReviewRequestState();

    expect(normalizeReviewRequestState(null)).toEqual(defaults);
    expect(normalizeReviewRequestState(undefined)).toEqual(defaults);
    expect(normalizeReviewRequestState('pending')).toEqual(defaults);
    expect(normalizeReviewRequestState(42)).toEqual(defaults);
    expect(normalizeReviewRequestState([true, 1])).toEqual(defaults);
    expect(
      normalizeReviewRequestState({
        lastRequestAt: 'yesterday',
        pending: 'yes',
        requestCount: -3,
      }),
    ).toEqual(defaults);
    expect(normalizeReviewRequestState({ requestCount: Number.NaN })).toEqual(defaults);
    expect(normalizeReviewRequestState({ pending: true })).toEqual({
      ...defaults,
      pending: true,
    });
    expect(
      normalizeReviewRequestState({ lastRequestAt: NOW, pending: false, requestCount: 1 }),
    ).toEqual({ lastRequestAt: NOW, pending: false, requestCount: 1 });
  });
});

describe('review request storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItemMock.mockImplementation(() => Promise.resolve(null));
    setItemMock.mockImplementation(() => Promise.resolve());
  });

  afterAll(() => {
    getItemMock.mockImplementation(() => Promise.resolve(null));
    setItemMock.mockImplementation(() => Promise.resolve());
  });

  it('falls back to defaults when stored JSON is unreadable or storage throws', async () => {
    getItemMock.mockResolvedValueOnce('{not json');
    await expect(loadReviewRequestState()).resolves.toEqual(
      createDefaultReviewRequestState(),
    );

    getItemMock.mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(loadReviewRequestState()).resolves.toEqual(
      createDefaultReviewRequestState(),
    );
  });

  it('saves a pending review under its own key after a qualifying round', async () => {
    await recordFinishedRound({ earnedStars: 1, hasCrown: true }, NOW);

    expect(getItemMock).toHaveBeenCalledWith(REVIEW_REQUEST_STORAGE_KEY);
    expect(setItemMock).toHaveBeenCalledTimes(1);
    expect(setItemMock).toHaveBeenCalledWith(
      REVIEW_REQUEST_STORAGE_KEY,
      JSON.stringify({ lastRequestAt: null, pending: true, requestCount: 0 }),
    );
  });

  it('writes nothing after a round that does not qualify', async () => {
    await recordFinishedRound({ earnedStars: 0, hasCrown: true }, NOW);

    expect(setItemMock).not.toHaveBeenCalled();
  });

  it('swallows a failed write', async () => {
    setItemMock.mockRejectedValueOnce(new Error('disk full'));

    await expect(
      recordFinishedRound({ earnedStars: 2, hasCrown: true }, NOW),
    ).resolves.toBeUndefined();
  });

  it('records a request only when one is due', async () => {
    await expect(recordReviewRequested(NOW)).resolves.toBe(false);
    expect(setItemMock).not.toHaveBeenCalled();

    getItemMock.mockResolvedValueOnce(
      JSON.stringify({ lastRequestAt: null, pending: true, requestCount: 0 }),
    );

    await expect(recordReviewRequested(NOW)).resolves.toBe(true);
    expect(setItemMock).toHaveBeenCalledWith(
      REVIEW_REQUEST_STORAGE_KEY,
      JSON.stringify({ lastRequestAt: NOW, pending: false, requestCount: 1 }),
    );
  });
});

describe('requesting a review', () => {
  const originalAppState = AppState.currentState;

  beforeEach(() => {
    jest.clearAllMocks();
    getItemMock.mockImplementation((key: string) =>
      Promise.resolve(key === REVIEW_REQUEST_STORAGE_KEY ? PENDING_REVIEW : null),
    );
    setItemMock.mockImplementation(() => Promise.resolve());
    isAvailableAsyncMock.mockResolvedValue(true);
    setAppState('active');
  });

  afterAll(() => {
    setAppState(originalAppState);
    getItemMock.mockImplementation(() => Promise.resolve(null));
    setItemMock.mockImplementation(() => Promise.resolve());
  });

  it('asks StoreKit once the request is recorded', async () => {
    await expect(requestReviewIfDue(() => false)).resolves.toBe(true);

    expect(setItemMock).toHaveBeenCalledWith(
      REVIEW_REQUEST_STORAGE_KEY,
      expect.stringContaining('"requestCount":1'),
    );
    expect(requestReviewMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Settings closes', { cancel: true, appState: 'active' }],
    ['the app leaves the foreground', { cancel: false, appState: 'background' }],
  ])(
    'does not show the sheet when %s while the request is being recorded',
    async (_trigger, { cancel, appState }) => {
      let cancelled = false;
      setItemMock.mockImplementation(() => {
        cancelled = cancel;
        setAppState(appState);
        return Promise.resolve();
      });

      await expect(requestReviewIfDue(() => cancelled)).resolves.toBe(false);

      // The ask is spent (recorded) but never shown: failing safe.
      expect(setItemMock).toHaveBeenCalledWith(
        REVIEW_REQUEST_STORAGE_KEY,
        expect.stringContaining('"requestCount":1'),
      );
      expect(requestReviewMock).not.toHaveBeenCalled();
    },
  );

  it('does not ask when the request cannot be saved', async () => {
    setItemMock.mockRejectedValue(new Error('disk full'));

    await expect(recordReviewRequested(NOW)).resolves.toBe(false);
    await expect(requestReviewIfDue(() => false)).resolves.toBe(false);

    expect(setItemMock).toHaveBeenCalled();
    expect(requestReviewMock).not.toHaveBeenCalled();
  });
});
