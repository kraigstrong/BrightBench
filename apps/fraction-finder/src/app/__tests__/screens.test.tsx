import React from 'react';
import { render, screen } from '@testing-library/react-native';

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
  },
  useLocalSearchParams: jest.fn(() => ({ mode: 'find' })),
}));

jest.mock('@/state/app-state', () => ({
  ...jest.requireActual('@/state/app-state'),
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);

describe('app screens', () => {
  beforeEach(() => {
    useAppStateMock.mockReturnValue({
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
            challenge: { played: 2, correct: 1, attempts: 2, highScore: 3 },
          },
        },
        recentResults: [],
      },
      settings: {
        soundEnabled: false,
        reducedMotion: false,
        difficultyLevel: 'easy',
        preferredRepresentation: 'mixed',
      },
      lastResult: {
        mode: 'find',
        targetFractionId: '1-2',
        scoreBand: 'exact',
        wasCorrect: true,
        feedbackKey: 'Nice work!',
        createdAt: '2026-04-07T00:00:00.000Z',
      },
      recordRound: jest.fn(),
      startSession: jest.fn(),
      completeSession: jest.fn(),
      updateSettings: jest.fn(),
      clearLastResult: jest.fn(),
    });
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
    expect(screen.getByText('Place on the Number Line')).toBeTruthy();
    expect(screen.getAllByText('Played').length).toBeGreaterThan(0);
    expect(screen.getAllByText('High score').length).toBeGreaterThan(0);
    expect(screen.getByText('Ready for your first round.')).toBeTruthy();
    expect(screen.getByLabelText('Open settings')).toBeTruthy();
  });

  it('renders the find mode detail screen with practice and challenge cards', () => {
    render(<ModeDetailScreen />);

    expect(screen.getByText('Choose how you want to play.')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
    expect(screen.getByText('Best Streak')).toBeTruthy();
    expect(screen.getByText('High Score')).toBeTruthy();
  });

  it('renders the settings screen with shared selectable controls', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Difficulty')).toBeTruthy();
    expect(screen.getByText('Preferred visuals')).toBeTruthy();
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('Rounds played')).toBeTruthy();
    expect(screen.getByText('17')).toBeTruthy();
    expect(screen.getByText('Total accuracy')).toBeTruthy();
    expect(screen.getByText('71%')).toBeTruthy();
    expect(screen.getAllByText('Practice').length).toBeGreaterThan(0);
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
    expect(screen.getByText('Settings save automatically on this device.')).toBeTruthy();
  });
});
