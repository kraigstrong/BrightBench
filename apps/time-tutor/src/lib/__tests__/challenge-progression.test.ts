import {
  calculateChallengeStars,
  countMasteredModes,
  createDefaultChallengeProgress,
  createEmptyChallengeModeProgress,
  getDefaultChallengeDifficulty,
  getChallengeIntervalForDifficulty,
  isChallengeModeMastered,
  PLAYABLE_MODES,
  shouldUpdateBestStars,
  totalStarsForMode,
} from '@/lib/challenge-progression';
import {
  CHALLENGE_DIFFICULTIES,
  challengeThresholds,
  formatChallengeLaunchIntervalLabel,
} from '@/config/challenge-thresholds';

describe('challenge progression helpers', () => {
  it('maps challenge difficulties to the intended intervals', () => {
    expect(getChallengeIntervalForDifficulty('easy')).toBe('15-minute');
    expect(getChallengeIntervalForDifficulty('medium')).toBe('5-minute');
    expect(getChallengeIntervalForDifficulty('hard')).toBe('1-minute');
  });

  it('formats challenge launch intervals with interval copy', () => {
    expect(formatChallengeLaunchIntervalLabel('15-minute')).toBe('15 min. intervals');
    expect(formatChallengeLaunchIntervalLabel('5-minute')).toBe('5 min. intervals');
    expect(formatChallengeLaunchIntervalLabel('1-minute')).toBe('1 min. intervals');
  });

  it('scales the star thresholds by mode and difficulty', () => {
    expect(challengeThresholds).toEqual({
      'digital-to-analog': {
        easy: { scoreThresholdOne: 4, scoreThresholdTwo: 7, accuracyThreshold: 80 },
        medium: { scoreThresholdOne: 4, scoreThresholdTwo: 6, accuracyThreshold: 75 },
        hard: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 70 },
      },
      'analog-to-digital': {
        easy: { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
        medium: { scoreThresholdOne: 4, scoreThresholdTwo: 7, accuracyThreshold: 80 },
        hard: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 75 },
      },
      'elapsed-time': {
        easy: { scoreThresholdOne: 3, scoreThresholdTwo: 5, accuracyThreshold: 75 },
        medium: { scoreThresholdOne: 3, scoreThresholdTwo: 4, accuracyThreshold: 70 },
        hard: { scoreThresholdOne: 2, scoreThresholdTwo: 4, accuracyThreshold: 70 },
      },
    });
  });

  // The third star needs both score bars, so the second must sit strictly above
  // the first or the two score stars would land on the same answer.
  it('keeps the second score bar above the first in every cell', () => {
    for (const mode of PLAYABLE_MODES) {
      for (const difficulty of CHALLENGE_DIFFICULTIES) {
        const cell = challengeThresholds[mode][difficulty];

        expect(cell.scoreThresholdTwo).toBeGreaterThan(cell.scoreThresholdOne);
      }
    }
  });

  // Stars already earned are persisted and never recomputed, so loosening a
  // threshold cannot strip them. Tightening one could still make a previously
  // earned star unreachable on a replay, which would read as a regression.
  it('never sets a bar above the original 5 / 8 / 80 for any cell', () => {
    for (const mode of PLAYABLE_MODES) {
      for (const difficulty of CHALLENGE_DIFFICULTIES) {
        const cell = challengeThresholds[mode][difficulty];

        expect(cell.scoreThresholdOne).toBeLessThanOrEqual(5);
        expect(cell.scoreThresholdTwo).toBeLessThanOrEqual(8);
        expect(cell.accuracyThreshold).toBeLessThanOrEqual(80);
      }
    }
  });

  // Elapsed Time at 1-minute granularity is the hardest cell in the app and the
  // one that prompted this rebalance. Two stars has to stay reachable for a
  // child who answers only a couple of questions but gets them right.
  it('keeps two stars reachable in the hardest cell', () => {
    const hardest = challengeThresholds['elapsed-time'].hard;

    // Two right out of two: first score bar plus accuracy.
    expect(calculateChallengeStars({ score: 2, accuracy: 100 }, hardest)).toBe(2);

    // Two right out of four: the score bar only.
    expect(calculateChallengeStars({ score: 2, accuracy: 50 }, hardest)).toBe(1);

    // Four right out of five: both score bars plus accuracy.
    expect(calculateChallengeStars({ score: 4, accuracy: 80 }, hardest)).toBe(3);
  });

  it('calculates stars from 80 percent accuracy, score 5, and score 8', () => {
    expect(
      calculateChallengeStars(
        { score: 5, accuracy: 60 },
        { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
      ),
    ).toBe(1);

    expect(
      calculateChallengeStars(
        { score: 4, accuracy: 80 },
        { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
      ),
    ).toBe(1);

    expect(
      calculateChallengeStars(
        { score: 8, accuracy: 60 },
        { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
      ),
    ).toBe(2);

    expect(
      calculateChallengeStars(
        { score: 8, accuracy: 80 },
        { scoreThresholdOne: 5, scoreThresholdTwo: 8, accuracyThreshold: 80 },
      ),
    ).toBe(3);
  });

  it('detects mastery and best-star updates correctly', () => {
    const progress = createEmptyChallengeModeProgress();

    expect(isChallengeModeMastered(progress)).toBe(false);
    expect(totalStarsForMode(progress)).toBe(0);
    expect(shouldUpdateBestStars(2, 2)).toBe(false);
    expect(shouldUpdateBestStars(2, 3)).toBe(true);

    progress.bestStars.easy = 3;
    progress.bestStars.medium = 3;
    progress.bestStars.hard = 3;

    expect(totalStarsForMode(progress)).toBe(9);
    expect(isChallengeModeMastered(progress)).toBe(true);
  });

  it('counts mastered modes across zero, partial, and full mastery states', () => {
    const zeroStars = createDefaultChallengeProgress();

    expect(countMasteredModes(zeroStars)).toBe(0);

    const partial = createDefaultChallengeProgress();
    partial['digital-to-analog'].bestStars = { easy: 3, medium: 3, hard: 3 };
    partial['analog-to-digital'].bestStars = { easy: 3, medium: 2, hard: 0 };

    expect(countMasteredModes(partial)).toBe(1);

    const full = createDefaultChallengeProgress();
    full['digital-to-analog'].bestStars = { easy: 3, medium: 3, hard: 3 };
    full['analog-to-digital'].bestStars = { easy: 3, medium: 3, hard: 3 };
    full['elapsed-time'].bestStars = { easy: 3, medium: 3, hard: 3 };

    expect(countMasteredModes(full)).toBe(3);
  });

  it('defaults challenge difficulty based on progression', () => {
    const empty = createEmptyChallengeModeProgress();
    expect(getDefaultChallengeDifficulty(empty)).toBe('easy');

    const progressed = createEmptyChallengeModeProgress();
    progressed.bestStars.easy = 2;
    expect(getDefaultChallengeDifficulty(progressed)).toBe('easy');

    progressed.bestStars.easy = 3;
    expect(getDefaultChallengeDifficulty(progressed)).toBe('medium');

    progressed.bestStars.medium = 2;
    expect(getDefaultChallengeDifficulty(progressed)).toBe('medium');

    progressed.bestStars.medium = 3;
    expect(getDefaultChallengeDifficulty(progressed)).toBe('hard');
  });
});
