import {
  ACTIVE_GAME_MODES,
  ChallengeBestStars,
  ChallengeModeKey,
  ChallengeModeProgress,
  ChallengeProgressSnapshot,
  DifficultyLevel,
  StarCount,
} from '@/features/game/types';

export const CHALLENGE_DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard'];

export const CHALLENGE_DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const CHALLENGE_DIFFICULTY_META: Record<DifficultyLevel, string> = {
  easy: 'Lowercase letters',
  medium: 'Uppercase letters',
  hard: 'Mixed case letters',
};

export type ChallengeRoundSummary = {
  accuracy: number;
  score: number;
};

type ChallengeThresholds = {
  accuracyThreshold: number;
  scoreThresholdOne: number;
  scoreThresholdTwo: number;
};

export const challengeThresholds: Record<DifficultyLevel, ChallengeThresholds> = {
  easy: { scoreThresholdOne: 5, scoreThresholdTwo: 12, accuracyThreshold: 80 },
  medium: { scoreThresholdOne: 6, scoreThresholdTwo: 14, accuracyThreshold: 80 },
  hard: { scoreThresholdOne: 7, scoreThresholdTwo: 16, accuracyThreshold: 80 },
};

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
  return ACTIVE_GAME_MODES.reduce((acc, mode) => {
    acc[mode] = createEmptyChallengeModeProgress();
    return acc;
  }, {} as ChallengeProgressSnapshot);
}

export function normalizeChallengeProgress(
  value?: Partial<
    Record<
      ChallengeModeKey,
      {
        bestStars?: Partial<ChallengeBestStars>;
        lastSelectedDifficulty?: DifficultyLevel;
        lastSelectedPracticeDifficulty?: DifficultyLevel;
      }
    >
  > | null
): ChallengeProgressSnapshot {
  const normalized = createDefaultChallengeProgress();

  for (const mode of ACTIVE_GAME_MODES) {
    const storedProgress = value?.[mode];
    const storedStars = storedProgress?.bestStars ?? {};

    normalized[mode] = {
      bestStars: {
        easy: clampStarCount(storedStars.easy ?? 0),
        medium: clampStarCount(storedStars.medium ?? 0),
        hard: clampStarCount(storedStars.hard ?? 0),
      },
      lastSelectedDifficulty: storedProgress?.lastSelectedDifficulty,
      lastSelectedPracticeDifficulty: storedProgress?.lastSelectedPracticeDifficulty,
    };
  }

  return normalized;
}

export function getDefaultPracticeDifficulty(progress: ChallengeModeProgress): DifficultyLevel {
  return progress.lastSelectedPracticeDifficulty ?? 'easy';
}

export function calculateChallengeStars(
  result: ChallengeRoundSummary,
  thresholds: ChallengeThresholds
): StarCount {
  let stars = 0;

  if (result.score >= thresholds.scoreThresholdOne) {
    stars += 1;
  }

  if (result.accuracy >= thresholds.accuracyThreshold) {
    stars += 1;
  }

  if (result.score >= thresholds.scoreThresholdTwo) {
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

export function getDefaultChallengeDifficulty(progress: ChallengeModeProgress): DifficultyLevel {
  const completedAll = CHALLENGE_DIFFICULTIES.every(
    (difficulty) => progress.bestStars[difficulty] === 3
  );

  if (completedAll) {
    return 'hard';
  }

  let highestStarted: DifficultyLevel | null = null;

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
    return CHALLENGE_DIFFICULTIES[nextIndex] as DifficultyLevel;
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
