import {
  calculateChallengeAccuracy,
  calculateChallengeStars,
  challengeThresholds,
  createDefaultChallengeProgress,
  isChallengeModeMastered,
} from '@/features/game/challenge-stars';

describe('challenge stars', () => {
  it('creates three empty difficulty tiers for every mode', () => {
    expect(createDefaultChallengeProgress()).toEqual({
      match: { bestStars: { easy: 0, medium: 0, hard: 0 } },
      case: { bestStars: { easy: 0, medium: 0, hard: 0 } },
      tap: { bestStars: { easy: 0, medium: 0, hard: 0 } },
      sound: { bestStars: { easy: 0, medium: 0, hard: 0 } },
    });
  });

  it('awards up to three stars from score and accuracy', () => {
    expect(
      calculateChallengeStars(
        { score: 12, accuracy: 80 },
        challengeThresholds.easy
      )
    ).toBe(3);
    expect(
      calculateChallengeStars(
        { score: 5, accuracy: 50 },
        challengeThresholds.easy
      )
    ).toBe(1);
  });

  it('calculates accuracy and mastery', () => {
    expect(calculateChallengeAccuracy(4, 5)).toBe(80);
    expect(
      isChallengeModeMastered({
        bestStars: { easy: 3, medium: 3, hard: 3 },
      })
    ).toBe(true);
  });
});
