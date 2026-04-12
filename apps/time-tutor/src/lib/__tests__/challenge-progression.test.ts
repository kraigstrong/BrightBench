import {
  calculateChallengeStars,
  createEmptyChallengeModeProgress,
  getDefaultChallengeDifficulty,
  getChallengeIntervalForDifficulty,
  isChallengeModeMastered,
  shouldUpdateBestStars,
  totalStarsForMode,
} from '@/lib/challenge-progression';
import {
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

  it('uses the same challenge thresholds across all modes and difficulties', () => {
    expect(challengeThresholds['digital-to-analog'].easy).toEqual({
      scoreThresholdOne: 5,
      scoreThresholdTwo: 8,
      accuracyThreshold: 80,
    });
    expect(challengeThresholds['digital-to-analog'].medium).toEqual({
      scoreThresholdOne: 5,
      scoreThresholdTwo: 8,
      accuracyThreshold: 80,
    });
    expect(challengeThresholds['digital-to-analog'].hard).toEqual({
      scoreThresholdOne: 5,
      scoreThresholdTwo: 8,
      accuracyThreshold: 80,
    });
    expect(challengeThresholds['analog-to-digital'].easy).toEqual({
      scoreThresholdOne: 5,
      scoreThresholdTwo: 8,
      accuracyThreshold: 80,
    });
    expect(challengeThresholds['elapsed-time'].hard).toEqual({
      scoreThresholdOne: 5,
      scoreThresholdTwo: 8,
      accuracyThreshold: 80,
    });
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
