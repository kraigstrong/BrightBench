import {
  defaultSettings,
  modeProgressSummary,
  normalizeProgressSnapshot,
  normalizeSettingsSnapshot,
  overallAccuracy,
  sessionProgressSummary,
  totalRoundsPlayed,
} from '@/state/app-state';

describe('app state normalization', () => {
  it('drops legacy difficulty from older settings snapshots', () => {
    expect(
      normalizeSettingsSnapshot({
        soundEnabled: true,
        reducedMotion: false,
        difficultyLevel: 'hard',
      } as any)
    ).toEqual({
      ...defaultSettings,
      soundEnabled: true,
      reducedMotion: false,
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
    expect(progress.sessionStats.find.practice.played).toBe(4);
    expect(progress.challengeProgress.find.bestStars.easy).toBe(0);
    expect(progress.modeStats.compare.played).toBe(0);
    expect(progress.modeStats.line.played).toBe(0);
  });

  it('normalizes stored challenge stars and practice stats separately', () => {
    const progress = normalizeProgressSnapshot({
      modeStats: {
        find: {
          played: 4,
          correct: 3,
          bestStreak: 2,
          currentStreak: 1,
        },
      },
      sessionStats: {
        find: {
          practice: {
            played: 5,
            correct: 4,
            bestStreak: 3,
            currentStreak: 2,
          },
        },
      },
      challengeProgress: {
        find: {
          bestStars: {
            easy: 2,
            medium: 3,
          },
          lastSelectedDifficulty: 'medium',
        },
      },
    });

    expect(progress.sessionStats.find.practice.played).toBe(5);
    expect(progress.challengeProgress.find.bestStars.easy).toBe(2);
    expect(progress.challengeProgress.find.bestStars.medium).toBe(3);
    expect(progress.challengeProgress.find.bestStars.hard).toBe(0);
    expect(progress.challengeProgress.find.lastSelectedDifficulty).toBe('medium');
    expect(progress.modeStats.find.played).toBe(4);
    expect(progress.modeStats.find.correct).toBe(3);
  });

  it('builds separate practice and challenge summaries for find', () => {
    const progress = normalizeProgressSnapshot({
      sessionStats: {
        find: {
          practice: {
          played: 4,
          correct: 3,
          bestStreak: 2,
          currentStreak: 1,
        },
        },
      },
      challengeProgress: {
        find: {
          bestStars: {
            easy: 2,
            medium: 1,
            hard: 0,
          },
          lastSelectedDifficulty: 'medium',
        },
      },
    });

    expect(sessionProgressSummary(progress, 'find', 'practice')).toEqual({
      emptyText: 'Ready for your first round.',
      hasProgress: true,
      metrics: [
        { label: 'Played', value: '4' },
        { label: 'Best Streak', value: '2' },
      ],
    });
    expect(sessionProgressSummary(progress, 'find', 'challenge')).toEqual({
      emptyText: 'Pick a challenge to start earning stars.',
      hasProgress: true,
      metrics: [{ label: 'Total Stars', value: '3' }],
    });
    expect(modeProgressSummary(progress, 'line').hasProgress).toBe(false);
  });

  it('computes overall totals across every mode', () => {
    const progress = normalizeProgressSnapshot({
      sessionStats: {
        find: {
          practice: {
            played: 4,
            correct: 3,
            bestStreak: 2,
            currentStreak: 1,
          },
        },
      },
      challengeProgress: {
        find: {
          bestStars: {
            easy: 2,
            medium: 1,
            hard: 0,
          },
        },
      },
      modeStats: {
        find: {
          played: 7,
          correct: 4,
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

    expect(totalRoundsPlayed(progress)).toBe(9);
    expect(overallAccuracy(progress)).toBe(56);
  });
});
