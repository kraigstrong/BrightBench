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
  const setChallengeBestStars = jest.fn();

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
          },
        },
        challengeProgress: {
          find: {
            bestStars: {
              easy: 0,
              medium: 0,
              hard: 0,
            },
            lastSelectedDifficulty: 'easy',
          },
        },
        recentResults: [],
      },
      settings: {
        soundEnabled: false,
        reducedMotion: false,
        difficultyLevel: 'easy',
      },
      lastResult: null,
      recordRound,
      setChallengeBestStars,
      setLastSelectedChallengeDifficulty: jest.fn(),
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

  it('starts with a countdown, scores correct answers, and shows the results overlay', () => {
    render(<FindChallengeScene difficultyLevel="easy" />);

    expect(screen.getByTestId('challenge-countdown-value')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByTestId('challenge-timer-bar')).toBeTruthy();
    expect(screen.getByTestId('challenge-timer-bar-fill')).toBeTruthy();

    fireEvent.press(screen.getByText('1/2'));

    expect(recordRound).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'find',
        sessionType: 'challenge',
        difficultyLevel: 'easy',
        wasCorrect: true,
      })
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.advanceTimersByTime(59000);
    });

    expect(screen.getByText("Time's up!")).toBeTruthy();
    expect(screen.getByText('Revealing your stars...')).toBeTruthy();

    act(() => {
      jest.runAllTimers();
    });

    expect(setChallengeBestStars).toHaveBeenCalledWith('find', 'easy', 1);
    expect(screen.getByText('1 star earned')).toBeTruthy();
  });

  it('auto-advances after a wrong answer', () => {
    render(<FindChallengeScene difficultyLevel="easy" />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    fireEvent.press(screen.getByText('1/4'));

    expect(recordRound).toHaveBeenCalledWith(
      expect.objectContaining({
        difficultyLevel: 'easy',
        wasCorrect: false,
      })
    );

    expect(generateFindRoundMock).toHaveBeenCalledTimes(3);

    act(() => {
      jest.advanceTimersByTime(520);
    });

    expect(generateFindRoundMock).toHaveBeenCalledTimes(4);
  });
});
