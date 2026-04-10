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
    easy: { scoreThreshold: 6, accuracyThreshold: 70 },
    medium: { scoreThreshold: 10, accuracyThreshold: 80 },
    hard: { scoreThreshold: 14, accuracyThreshold: 90 },
  },
  'analog-to-digital': {
    easy: { scoreThreshold: 6, accuracyThreshold: 70 },
    medium: { scoreThreshold: 10, accuracyThreshold: 80 },
    hard: { scoreThreshold: 14, accuracyThreshold: 90 },
  },
  'elapsed-time': {
    easy: { scoreThreshold: 4, accuracyThreshold: 70 },
    medium: { scoreThreshold: 7, accuracyThreshold: 80 },
    hard: { scoreThreshold: 10, accuracyThreshold: 90 },
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
