import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import ChallengeLaunchScreen from '@/app/challenge/[mode]';
import HomeScreen from '@/app/index';
import ModeDetailScreen from '@/app/mode/[mode]';
import ModesScreen from '@/app/modes';
import SettingsScreen from '@/app/settings';
import { useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  Redirect: () => null,
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: jest.fn(() => ({ mode: 'find' })),
}));

jest.mock('@/state/app-state', () => ({
  ...jest.requireActual('@/state/app-state'),
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);
const routerMock = jest.requireMock('expo-router').router as {
  back: jest.Mock;
  push: jest.Mock;
  replace: jest.Mock;
};

describe('app screens', () => {
  function buildAppState() {
    return {
      hydrated: true,
      progress: {
        modeStats: {
          find: { played: 6, correct: 4, bestStreak: 2, currentStreak: 1 },
          build: { played: 2, correct: 1, bestStreak: 1, currentStreak: 0 },
          compare: { played: 1, correct: 1, bestStreak: 1, currentStreak: 1 },
          estimate: { played: 3, correct: 2, bestStreak: 2, currentStreak: 0 },
          pour: { played: 5, correct: 4, bestStreak: 3, currentStreak: 2 },
          line: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
        },
        sessionStats: {
          find: {
            practice: { played: 4, correct: 3, bestStreak: 2, currentStreak: 1 },
          },
        },
        challengeProgress: {
          find: {
            bestStars: {
              easy: 2 as const,
              medium: 1 as const,
              hard: 0 as const,
            },
            lastSelectedDifficulty: 'easy' as const,
          },
        },
        recentResults: [],
      },
      settings: {
        soundEnabled: false,
        reducedMotion: false,
        difficultyLevel: 'easy' as const,
      },
      lastResult: {
        mode: 'find' as const,
        targetFractionId: '1-2',
        scoreBand: 'exact' as const,
        wasCorrect: true,
        feedbackKey: 'Nice work!',
        createdAt: '2026-04-07T00:00:00.000Z',
      },
      recordRound: jest.fn(),
      setChallengeBestStars: jest.fn(),
      setLastSelectedChallengeDifficulty: jest.fn(),
      updateSettings: jest.fn(),
      clearLastResult: jest.fn(),
    };
  }

  beforeEach(() => {
    useAppStateMock.mockReturnValue(buildAppState());
  });

  afterEach(() => {
    routerMock.back.mockReset();
    routerMock.push.mockReset();
    routerMock.replace.mockReset();
  });

  it('renders the home screen', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Choose a Mode')).toBeTruthy();
    expect(screen.getByText('Find the Fraction')).toBeTruthy();
    expect(screen.getByLabelText('Open settings')).toBeTruthy();
  });

  it('renders the modes screen', () => {
    render(<ModesScreen />);

    expect(screen.getByText('Choose a Mode')).toBeTruthy();
    expect(screen.getByText('Find the Fraction')).toBeTruthy();
    expect(screen.getByText('Number Line')).toBeTruthy();
    expect(screen.queryByText('Played')).toBeNull();
    expect(screen.queryByText('High score')).toBeNull();
    expect(screen.getByText('Match a picture to the right fraction.')).toBeTruthy();
    expect(screen.getByText('Drag the marker to match the fraction.')).toBeTruthy();
    expect(screen.queryByText('Choose the fraction that is larger.')).toBeNull();
    expect(screen.getByLabelText('Open settings')).toBeTruthy();
  });

  it('renders the find mode detail screen with practice and challenge cards', () => {
    render(<ModeDetailScreen />);

    expect(screen.getByText('Choose how you want to play.')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
    expect(screen.queryByText('Best Streak')).toBeNull();
    expect(screen.queryByText('High Score')).toBeNull();
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
  });

  it('opens the challenge launch route from the challenge card', () => {
    render(<ModeDetailScreen />);

    fireEvent.press(screen.getByText('1-Minute Challenge'));

    expect(routerMock.push).toHaveBeenCalledWith('/challenge/find');
  });

  it('renders the challenge launcher screen and routes to the chosen difficulty', () => {
    const setLastSelectedChallengeDifficulty = jest.fn();
    useAppStateMock.mockReturnValue({
      ...buildAppState(),
      lastResult: null,
      setLastSelectedChallengeDifficulty,
    });

    render(<ChallengeLaunchScreen />);

    expect(screen.getByText('Choose your difficulty')).toBeTruthy();
    expect(screen.getByText('Friendly benchmark fractions')).toBeTruthy();
    expect(screen.getByText('Adds thirds, sixths, and eighths')).toBeTruthy();
    expect(screen.getByText('Full mixed fraction pool')).toBeTruthy();

    fireEvent.press(screen.getByTestId('challenge-tier-medium'));

    expect(setLastSelectedChallengeDifficulty).toHaveBeenCalledWith('find', 'medium');
    expect(routerMock.replace).toHaveBeenCalledWith('/session/find/challenge?difficulty=medium');
  });

  it('renders the settings screen with shared selectable controls', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Difficulty')).toBeTruthy();
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('Rounds played')).toBeTruthy();
    expect(screen.getByText('16')).toBeTruthy();
    expect(screen.getByText('Total accuracy')).toBeTruthy();
    expect(screen.getByText('69%')).toBeTruthy();
    expect(screen.getAllByText('Practice').length).toBeGreaterThan(0);
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
    expect(screen.getByText('Settings save automatically on this device.')).toBeTruthy();
    expect(screen.queryByText('Compare Fractions')).toBeNull();
  });
});
