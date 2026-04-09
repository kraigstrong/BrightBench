import React from 'react';
import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import ModesScreen from '@/app/modes';
import ProgressScreen from '@/app/progress';
import ResultsScreen from '@/app/results';
import SettingsScreen from '@/app/settings';
import { useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/state/app-state', () => ({
  accuracyForMode: jest.fn(() => 75),
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);

describe('app screens', () => {
  beforeEach(() => {
    useAppStateMock.mockReturnValue({
      hydrated: true,
      progress: {
        modeStats: {
          find: { played: 4, correct: 3, bestStreak: 2, currentStreak: 1 },
          build: { played: 2, correct: 1, bestStreak: 1, currentStreak: 0 },
          compare: { played: 1, correct: 1, bestStreak: 1, currentStreak: 1 },
          estimate: { played: 3, correct: 2, bestStreak: 2, currentStreak: 0 },
          pour: { played: 5, correct: 4, bestStreak: 3, currentStreak: 2 },
          line: { played: 2, correct: 1, bestStreak: 1, currentStreak: 0 },
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
    expect(screen.getByLabelText('Open settings')).toBeTruthy();
  });

  it('renders the settings screen with shared selectable controls', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Difficulty')).toBeTruthy();
    expect(screen.getByText('Preferred visuals')).toBeTruthy();
    expect(screen.getByText('Settings save automatically on this device.')).toBeTruthy();
  });

  it('renders the progress screen summary cards', () => {
    render(<ProgressScreen />);

    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('Rounds played')).toBeTruthy();
    expect(screen.getByText('Best streak')).toBeTruthy();
    expect(screen.getByText('Find the Fraction')).toBeTruthy();
  });

  it('renders the results screen actions', () => {
    render(<ResultsScreen />);

    expect(screen.getByText('Latest Result')).toBeTruthy();
    expect(screen.getByText('Nice work!')).toBeTruthy();
    expect(screen.getByText('View progress')).toBeTruthy();
  });
});
