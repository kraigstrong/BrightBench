import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { FindChallengeScene } from '@/features/game/find-challenge-scene';
import { evaluateFindRound, generateFindRound } from '@/features/game/modes/find';
import { useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/state/app-state', () => ({
  ...jest.requireActual('@/state/app-state'),
  useAppState: jest.fn(),
}));

jest.mock('@/features/game/modes/find', () => ({
  generateFindRound: jest.fn(),
  evaluateFindRound: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);
const generateFindRoundMock = jest.mocked(generateFindRound);
const evaluateFindRoundMock = jest.mocked(evaluateFindRound);

describe('FindChallengeScene', () => {
  const recordRound = jest.fn();
  const startSession = jest.fn();
  const completeSession = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();

    useAppStateMock.mockReturnValue({
      hydrated: true,
      progress: {
        modeStats: {
          find: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
          build: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
          compare: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
          estimate: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
          pour: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
          line: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
        },
        sessionStats: {
          find: {
            practice: { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 },
            challenge: { played: 0, correct: 0, attempts: 0, highScore: 3 },
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
      lastResult: null,
      recordRound,
      startSession,
      completeSession,
      updateSettings: jest.fn(),
      clearLastResult: jest.fn(),
    });

    generateFindRoundMock.mockReturnValue({
      id: 'find-round',
      mode: 'find',
      prompt: 'Which fraction matches this picture?',
      targetFractionId: '1-2',
      representation: 'bar',
      difficultyLevel: 'easy',
      options: ['1-2', '1-4', '3-4'],
    });
    evaluateFindRoundMock.mockImplementation((_round, answerId) => ({
      isCorrect: answerId === '1-2',
      scoreBand: answerId === '1-2' ? 'exact' : 'almost',
      feedbackKey: answerId === '1-2' ? 'find-correct' : 'find-try-again',
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('starts a run, scores correct answers, and completes when time ends', () => {
    render(<FindChallengeScene />);

    fireEvent.press(screen.getByText('Start challenge'));

    expect(startSession).toHaveBeenCalledWith({ mode: 'find', sessionType: 'challenge' });
    expect(screen.getByTestId('find-challenge-time-remaining')).toHaveTextContent('1:00');

    fireEvent.press(screen.getByText('1/2'));

    expect(recordRound).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'find',
        sessionType: 'challenge',
        wasCorrect: true,
      })
    );
    expect(screen.getByTestId('find-challenge-score')).toHaveTextContent('1');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('find-challenge-time-remaining')).toHaveTextContent('0:59');

    act(() => {
      jest.advanceTimersByTime(59000);
    });

    expect(completeSession).toHaveBeenCalledWith({
      mode: 'find',
      score: 1,
      sessionType: 'challenge',
    });
    expect(screen.getByText("Time's up!")).toBeTruthy();
  });
});
