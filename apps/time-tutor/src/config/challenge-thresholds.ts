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

// A round is 60 seconds and a correct answer costs a 700ms advance delay, so a
// score threshold of N implies (60 - 0.7N) / N seconds per question — for
// reading the prompt, working out the answer, entering it, and pressing Check.
//
//   N = 3 -> 19.3s    N = 5 -> 11.3s    N = 7 -> 7.9s
//   N = 4 -> 14.3s    N = 6 -> 9.3s     N = 8 -> 6.8s
//
// Every cell used to be 5 / 8 / 80, so the third star demanded a correct answer
// every 6.8s whether the task was placing an hour hand at quarter-past or
// computing elapsed minutes to the minute. Difficulty changed the interval;
// the bar never moved. These values scale the bar with the work instead:
// reading a clock is quicker than setting one, computing elapsed time is
// slower than either, and finer granularity costs time in every mode.
//
// The accuracy bar drops alongside the score bars in the harder cells. It has
// to: with a small number of attempts, 80% rounds up to "perfect" (3 of 4 is
// 75% and fails), so holding it at 80 would turn the middle star into a
// perfection requirement exactly where we are trying to be kinder.
//
// These are estimates of how fast a child answers, not measurements — there is
// no telemetry. The bias is deliberately generous: an unreachable third star
// reads as broken, an easy one only reads as encouraging.
export const challengeThresholds: Record<
  PlayableMode,
  Record<
    ChallengeDifficulty,
    {
      accuracyThreshold: number;
      scoreThresholdOne: number;
      scoreThresholdTwo: number;
    }
  >
> = {
  // Set the Clock: read a digital time, drag the hands to match. Slower than
  // reading, and slowest of all at 1-minute granularity where the minute hand
  // has to land on an exact tick.
  'digital-to-analog': {
    easy: { scoreThresholdOne: 4, scoreThresholdTwo: 7, accuracyThreshold: 80 },
    medium: { scoreThresholdOne: 4, scoreThresholdTwo: 6, accuracyThreshold: 75 },
    hard: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 70 },
  },
  // Read the Clock: read an analog face, enter the digits. The quickest of the
  // three, so easy keeps the original 5 / 8 / 80.
  'analog-to-digital': {
    easy: { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
    medium: { scoreThresholdOne: 4, scoreThresholdTwo: 7, accuracyThreshold: 80 },
    hard: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 75 },
  },
  // Elapsed Time: a two-step computation before any answer can be entered, so
  // it is the slowest mode at every interval.
  'elapsed-time': {
    easy: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 75 },
    medium: { scoreThresholdOne: 3, scoreThresholdTwo: 4, accuracyThreshold: 70 },
    hard: { scoreThresholdOne: 2, scoreThresholdTwo: 4, accuracyThreshold: 70 },
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
