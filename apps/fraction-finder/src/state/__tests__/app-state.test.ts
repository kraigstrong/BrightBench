import {
  defaultSettings,
  normalizeProgressSnapshot,
  normalizeSettingsSnapshot,
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
  });
});
