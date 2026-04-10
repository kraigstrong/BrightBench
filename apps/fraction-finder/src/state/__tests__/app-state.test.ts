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
    expect(progress.sessionStats.find.practice.played).toBe(4);
    expect(progress.sessionStats.find.challenge.highScore).toBe(0);
    expect(progress.modeStats.compare.played).toBe(0);
    expect(progress.modeStats.line.played).toBe(0);
  });

  it('prefers stored session stats over legacy find mode stats', () => {
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
          challenge: {
            played: 2,
            correct: 3,
            attempts: 4,
            highScore: 3,
          },
        },
      },
    });

    expect(progress.sessionStats.find.practice.played).toBe(5);
    expect(progress.sessionStats.find.challenge.highScore).toBe(3);
    expect(progress.modeStats.find.played).toBe(9);
    expect(progress.modeStats.find.correct).toBe(7);
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
          challenge: {
            played: 2,
            correct: 3,
            attempts: 4,
            highScore: 3,
          },
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
      emptyText: 'Ready for your first challenge.',
      hasProgress: true,
      metrics: [
        { label: 'Played', value: '2' },
        { label: 'Accuracy', value: '75%' },
        { label: 'High Score', value: '3' },
      ],
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
          challenge: {
            played: 2,
            correct: 1,
            attempts: 3,
            highScore: 2,
          },
        },
      },
      modeStats: {
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
