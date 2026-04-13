import {
  defaultSettings,
  normalizeSettingsSnapshot,
  normalizeStoredSnapshot,
} from '@/state/app-state';

describe('time tutor app state normalization', () => {
  it('fills in missing settings values', () => {
    expect(
      normalizeSettingsSnapshot({
        practiceInterval: '15-minute',
      }),
    ).toEqual({
      ...defaultSettings,
      practiceInterval: '15-minute',
    });
  });

  it('hydrates legacy settings-only storage into the new snapshot shape', () => {
    const snapshot = normalizeStoredSnapshot({
      practiceInterval: '1-minute',
      timeFormat: '24-hour',
    });

    expect(snapshot.settings).toEqual({
      practiceInterval: '1-minute',
      timeFormat: '24-hour',
    });
    expect(snapshot.challengeProgress['digital-to-analog'].bestStars.easy).toBe(0);
    expect(snapshot.challengeProgress['analog-to-digital'].bestStars.medium).toBe(0);
    expect(snapshot.challengeProgress['elapsed-time'].bestStars.hard).toBe(0);
  });

  it('preserves stored challenge progress values', () => {
    const snapshot = normalizeStoredSnapshot({
      challengeProgress: {
        'digital-to-analog': {
          bestStars: {
            easy: 2,
            medium: 3,
          },
          lastSelectedDifficulty: 'medium',
        },
      },
      settings: {
        practiceInterval: '5-minute',
        timeFormat: '12-hour',
      },
    });
    expect(snapshot.challengeProgress['digital-to-analog'].bestStars.easy).toBe(2);
    expect(snapshot.challengeProgress['digital-to-analog'].bestStars.medium).toBe(3);
    expect(snapshot.challengeProgress['digital-to-analog'].bestStars.hard).toBe(0);
    expect(snapshot.challengeProgress['digital-to-analog'].lastSelectedDifficulty).toBe(
      'medium',
    );
  });
});
