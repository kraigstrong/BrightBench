import {
  defaultSettings,
  modeProgressSummary,
  normalizeProgressSnapshot,
  normalizeSettingsSnapshot,
  overallAccuracy,
  totalRoundsPlayed,
} from '@/state/app-state';

describe('app state normalization', () => {
  it('fills in missing difficulty for older settings snapshots', () => {
    expect(
      normalizeSettingsSnapshot({
        soundEnabled: true,
        reducedMotion: false,
        preferredRepresentation: 'bar',
      })
    ).toEqual({
      ...defaultSettings,
      soundEnabled: true,
      reducedMotion: false,
      preferredRepresentation: 'bar',
      difficultyLevel: 'easy',
    });
  });

  it('fills in missing mode stats while preserving stored progress', () => {
    const progress = normalizeProgressSnapshot({
      modeStats: {
        find: {
          played: 4,
          correct: 3,
          bestStreak: 2,
          currentStreak: 1,
        },
      },
      recentResults: [],
    });

    expect(progress.modeStats.find.played).toBe(4);
    expect(progress.modeStats.find.correct).toBe(3);
    expect(progress.modeStats.compare.played).toBe(0);
    expect(progress.modeStats.line.played).toBe(0);
  });

  it('builds a mode progress summary with a placeholder high score', () => {
    const progress = normalizeProgressSnapshot({
      modeStats: {
        find: {
          played: 4,
          correct: 3,
          bestStreak: 2,
          currentStreak: 1,
        },
      },
    });

    expect(modeProgressSummary(progress, 'find')).toEqual({
      played: 4,
      bestStreak: 2,
      accuracy: 75,
      highScore: 0,
      hasProgress: true,
    });
    expect(modeProgressSummary(progress, 'line').hasProgress).toBe(false);
  });

  it('computes overall totals across every mode', () => {
    const progress = normalizeProgressSnapshot({
      modeStats: {
        find: {
          played: 4,
          correct: 3,
          bestStreak: 2,
          currentStreak: 1,
        },
        pour: {
          played: 2,
          correct: 1,
          bestStreak: 1,
          currentStreak: 0,
        },
      },
    });

    expect(totalRoundsPlayed(progress)).toBe(6);
    expect(overallAccuracy(progress)).toBe(67);
  });
});
