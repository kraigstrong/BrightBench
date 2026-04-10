import {
  calculateChallengeStars,
  createEmptyChallengeModeProgress,
  getDefaultChallengeDifficulty,
  getChallengeIntervalForDifficulty,
  isChallengeModeMastered,
  shouldUpdateBestStars,
  totalStarsForMode,
} from '@/lib/challenge-progression';

describe('challenge progression helpers', () => {
  it('maps challenge difficulties to the intended intervals', () => {
    expect(getChallengeIntervalForDifficulty('easy')).toBe('15-minute');
    expect(getChallengeIntervalForDifficulty('medium')).toBe('5-minute');
    expect(getChallengeIntervalForDifficulty('hard')).toBe('1-minute');
  });

  it('calculates stars from score, accuracy, and perfect accuracy', () => {
    expect(
      calculateChallengeStars(
        { score: 6, accuracy: 60 },
        { scoreThreshold: 6, accuracyThreshold: 70 },
      ),
    ).toBe(1);

    expect(
      calculateChallengeStars(
        { score: 6, accuracy: 70 },
        { scoreThreshold: 6, accuracyThreshold: 70 },
      ),
    ).toBe(2);

    expect(
      calculateChallengeStars(
        { score: 3, accuracy: 100 },
        { scoreThreshold: 6, accuracyThreshold: 70 },
      ),
    ).toBe(2);

    expect(
      calculateChallengeStars(
        { score: 6, accuracy: 100 },
        { scoreThreshold: 6, accuracyThreshold: 70 },
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
