import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_TO_INTERVAL,
  PERFECT_ACCURACY,
} from '@/config/challenge-thresholds';
import type {
  ChallengeBestStars,
  ChallengeDifficulty,
  ChallengeModeProgress,
  ChallengeProgressSnapshot,
  PlayableMode,
  PracticeInterval,
  StarCount,
} from '@/types/time';

export type ChallengeRoundSummary = {
  accuracy: number;
  score: number;
};

type ChallengeThresholds = {
  accuracyThreshold: number;
  scoreThreshold: number;
};

const PLAYABLE_MODES: PlayableMode[] = [
  'digital-to-analog',
  'analog-to-digital',
  'elapsed-time',
];

export function createEmptyChallengeBestStars(): ChallengeBestStars {
  return {
    easy: 0,
    medium: 0,
    hard: 0,
  };
}

export function createEmptyChallengeModeProgress(): ChallengeModeProgress {
  return {
    bestStars: createEmptyChallengeBestStars(),
  };
}

export function createDefaultChallengeProgress(): ChallengeProgressSnapshot {
  return {
    'digital-to-analog': createEmptyChallengeModeProgress(),
    'analog-to-digital': createEmptyChallengeModeProgress(),
    'elapsed-time': createEmptyChallengeModeProgress(),
  };
}

export function normalizeChallengeProgress(
  value?: Partial<
    Record<
      PlayableMode,
      {
        bestStars?: Partial<ChallengeBestStars>;
        lastSelectedDifficulty?: ChallengeDifficulty;
      }
    >
  > | null
): ChallengeProgressSnapshot {
  const normalized = createDefaultChallengeProgress();

  for (const mode of PLAYABLE_MODES) {
    normalized[mode] = {
      bestStars: {
        ...createEmptyChallengeBestStars(),
        ...(value?.[mode]?.bestStars ?? {}),
      },
      lastSelectedDifficulty: value?.[mode]?.lastSelectedDifficulty,
    };
  }

  return normalized;
}

export function getChallengeIntervalForDifficulty(
  difficulty: ChallengeDifficulty
): PracticeInterval {
  return CHALLENGE_DIFFICULTY_TO_INTERVAL[difficulty];
}

export function calculateChallengeStars(
  result: ChallengeRoundSummary,
  thresholds: ChallengeThresholds
): StarCount {
  let stars = 0;

  if (result.score >= thresholds.scoreThreshold) {
    stars += 1;
  }

  if (result.accuracy >= thresholds.accuracyThreshold) {
    stars += 1;
  }

  if (result.accuracy === PERFECT_ACCURACY) {
    stars += 1;
  }

  return clampStarCount(stars);
}

export function calculateChallengeAccuracy(correct: number, attempts: number) {
  if (!attempts) {
    return 0;
  }

  return Math.round((correct / attempts) * 100);
}

export function totalStarsForMode(progress: ChallengeModeProgress): number {
  return CHALLENGE_DIFFICULTIES.reduce(
    (sum, difficulty) => sum + progress.bestStars[difficulty],
    0
  );
}

export function isChallengeModeMastered(progress: ChallengeModeProgress) {
  return totalStarsForMode(progress) === CHALLENGE_DIFFICULTIES.length * 3;
}

export function shouldUpdateBestStars(previous: StarCount, next: StarCount) {
  return next > previous;
}

export function getDefaultChallengeDifficulty(
  progress: ChallengeModeProgress
): ChallengeDifficulty {
  const completedAll = CHALLENGE_DIFFICULTIES.every(
    (difficulty) => progress.bestStars[difficulty] === 3
  );

  if (completedAll) {
    return 'hard';
  }

  let highestStarted: ChallengeDifficulty | null = null;

  for (const difficulty of CHALLENGE_DIFFICULTIES) {
    if (progress.bestStars[difficulty] > 0) {
      highestStarted = difficulty;
    }
  }

  if (!highestStarted) {
    return 'easy';
  }

  if (progress.bestStars[highestStarted] < 3) {
    return highestStarted;
  }

  const nextIndex = CHALLENGE_DIFFICULTIES.indexOf(highestStarted) + 1;

  if (nextIndex < CHALLENGE_DIFFICULTIES.length) {
    return CHALLENGE_DIFFICULTIES[nextIndex] as ChallengeDifficulty;
  }

  return highestStarted;
}

function clampStarCount(value: number): StarCount {
  if (value <= 0) {
    return 0;
  }

  if (value >= 3) {
    return 3;
  }

  return value as StarCount;
}
