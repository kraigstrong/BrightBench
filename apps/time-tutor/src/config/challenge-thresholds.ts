import type {
  ChallengeDifficulty,
  PlayableMode,
  PracticeInterval,
} from '@/types/time';

export const CHALLENGE_DIFFICULTIES: ChallengeDifficulty[] = [
  'easy',
  'medium',
  'hard',
];

export const CHALLENGE_DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const CHALLENGE_DIFFICULTY_TO_INTERVAL: Record<
  ChallengeDifficulty,
  PracticeInterval
> = {
  easy: '15-minute',
  medium: '5-minute',
  hard: '1-minute',
};

export const PERFECT_ACCURACY = 100;

export const challengeThresholds: Record<
  PlayableMode,
  Record<
    ChallengeDifficulty,
    {
      accuracyThreshold: number;
      scoreThreshold: number;
    }
  >
> = {
  'digital-to-analog': {
    easy: { scoreThreshold: 10, accuracyThreshold: 80 },
    medium: { scoreThreshold: 10, accuracyThreshold: 80 },
    hard: { scoreThreshold: 10, accuracyThreshold: 80 },
  },
  'analog-to-digital': {
    easy: { scoreThreshold: 10, accuracyThreshold: 80 },
    medium: { scoreThreshold: 10, accuracyThreshold: 80 },
    hard: { scoreThreshold: 10, accuracyThreshold: 80 },
  },
  'elapsed-time': {
    easy: { scoreThreshold: 10, accuracyThreshold: 80 },
    medium: { scoreThreshold: 10, accuracyThreshold: 80 },
    hard: { scoreThreshold: 10, accuracyThreshold: 80 },
  },
};

export function formatChallengeIntervalLabel(interval: PracticeInterval) {
  switch (interval) {
    case '15-minute':
      return '15 min';
    case '5-minute':
      return '5 min';
    case '1-minute':
      return '1 min';
    case 'hours-only':
      return 'Hours only';
    default:
      return interval;
  }
}

export function formatChallengeLaunchIntervalLabel(interval: PracticeInterval) {
  switch (interval) {
    case '15-minute':
      return '15 min. intervals';
    case '5-minute':
      return '5 min. intervals';
    case '1-minute':
      return '1 min. intervals';
    case 'hours-only':
      return 'Hours only';
    default:
      return interval;
  }
}
