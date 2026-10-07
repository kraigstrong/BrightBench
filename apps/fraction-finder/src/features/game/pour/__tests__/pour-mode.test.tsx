import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CelebrationOverlay } from '@education/ui';
import { ChallengeScene } from '@/features/game/challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { generatePourRound } from '@/features/game/modes/pour';
import { DifficultyLevel } from '@/features/game/types';
import { defaultProgress, defaultSettings, useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/state/app-state', () => ({
  ...jest.requireActual('@/state/app-state'),
  useAppState: jest.fn(),
}));

// Real evaluation and tolerance; only the target is pinned to 1/2 (12 splashes).
jest.mock('@/features/game/modes/pour', () => ({
  ...jest.requireActual('@/features/game/modes/pour'),
  generatePourRound: jest.fn(),
}));

jest.mock('@education/ui', () => ({
  ...jest.requireActual('@education/ui'),
  CelebrationOverlay: jest.fn(() => null),
}));

const useAppStateMock = jest.mocked(useAppState);
const generatePourRoundMock = jest.mocked(generatePourRound);
const celebrationMock = jest.mocked(CelebrationOverlay);
const recordRound = jest.fn();

function useState({ reducedMotion = false } = {}) {
  useAppStateMock.mockReturnValue({
    hydrated: true,
    progress: defaultProgress,
    settings: { ...defaultSettings, reducedMotion },
    lastResult: null,
    recordRound,
    setChallengeBestStars: jest.fn(),
    setLastSelectedChallengeDifficulty: jest.fn(),
    setLastSelectedPracticeDifficulty: jest.fn(),
    updateSettings: jest.fn(),
    clearLastResult: jest.fn(),
  });
}

function tap(label: string, times = 1) {
  const target = screen.queryByLabelText(label) ?? screen.getByRole('button', { name: label });
  for (let index = 0; index < times; index += 1) {
    fireEvent(target, 'pressIn');
    fireEvent(target, 'pressOut');
  }
}

// Lets the OS reduced-motion lookup settle inside act().
async function renderSettled(ui: React.ReactElement) {
  render(ui);
  await act(async () => {});
}

function checkButton() {
  return screen.getByRole('button', { name: 'Check' });
}

function advance(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

function lastCelebration() {
  return celebrationMock.mock.calls.at(-1)?.[0];
}

describe('Pour mode (Pour & Peek)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    let count = 0;
    generatePourRoundMock.mockImplementation(({ difficultyLevel }: { difficultyLevel: DifficultyLevel }) => {
      count += 1;
      return {
        id: `pour-${count}`,
        mode: 'pour',
        prompt: 'Fill to about 1/2.',
        targetFractionId: '1-2',
        representation: 'container',
        difficultyLevel,
        tolerance: 0.08,
      };
    });
    useState();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('practice: reveals equal parts on a miss, records each check, and auto-advances after a solve', async () => {
    await renderSettled(<ModePlayScene mode="pour" sessionType="practice" difficultyLevel="medium" />);

    expect(screen.getByText('Fill to about 1/2.')).toBeTruthy();
    expect(screen.getByText('Hold the pitcher to pour. Tap it for a splash.')).toBeTruthy();
    expect(checkButton()).toBeDisabled();

    tap('Pitcher', 14);
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'pour', targetFractionId: '1-2', wasCorrect: false })
    );
    expect(screen.getByText('A little over 1/2.')).toBeTruthy();
    expect(screen.getByText('The lines split the glass into 2 equal parts.')).toBeTruthy();
    // The shared retry callout would cover the top of the glass; Pour explains misses below it.
    expect(screen.queryByText('Keep pouring')).toBeNull();
    expect(checkButton()).toBeDisabled();

    tap('Pour out', 2);
    expect(screen.getByText('Use the equal parts to fix it.')).toBeTruthy();
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: true }));
    expect(recordRound).toHaveBeenCalledTimes(2);
    expect(screen.getByText("That's 1/2!")).toBeTruthy();
    expect(screen.getByText('1 of 2 equal parts.')).toBeTruthy();
    expect(screen.getByLabelText('Pitcher')).toBeDisabled();
    expect(lastCelebration()).toEqual(expect.objectContaining({ visible: true, showMessage: false }));

    const roundsBefore = generatePourRoundMock.mock.calls.length;
    advance(1200);

    expect(generatePourRoundMock).toHaveBeenCalledTimes(roundsBefore + 1);
    expect(screen.queryByText("That's 1/2!")).toBeNull();
    expect(screen.queryByText('Use the equal parts to fix it.')).toBeNull();
    expect(checkButton()).toBeDisabled();
  });

  it('practice: skips the confetti when Reduced motion is on', async () => {
    useState({ reducedMotion: true });
    await renderSettled(<ModePlayScene mode="pour" sessionType="practice" difficultyLevel="medium" />);

    tap('Pitcher', 12);
    fireEvent.press(checkButton());

    expect(screen.getByText("That's 1/2!")).toBeTruthy();
    expect(celebrationMock).not.toHaveBeenCalled();
  });

  it('challenge: scores pours and advances on the existing timings', async () => {
    await renderSettled(<ChallengeScene mode="pour" difficultyLevel="easy" />);
    advance(4000);

    tap('Pitcher', 12);
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: 'pour',
        sessionType: 'challenge',
        difficultyLevel: 'easy',
        wasCorrect: true,
      })
    );
    // The glass label carries the answer; the challenge drops the message line to fit short phones.
    expect(screen.queryByText("That's 1/2!")).toBeNull();
    expect(lastCelebration()).toEqual(expect.objectContaining({ visible: true, showMessage: false }));

    const roundsAfterSolve = generatePourRoundMock.mock.calls.length;
    advance(700);
    expect(generatePourRoundMock).toHaveBeenCalledTimes(roundsAfterSolve + 1);

    tap('Pitcher', 3);
    fireEvent.press(checkButton());
    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: false }));
    advance(520);
    expect(generatePourRoundMock).toHaveBeenCalledTimes(roundsAfterSolve + 2);

    // Still holding the pitcher when time runs out must not keep pouring or allow a check.
    fireEvent(screen.getByLabelText('Pitcher'), 'pressIn');
    advance(60000);

    expect(screen.getByText("Time's up!")).toBeTruthy();
    expect(checkButton()).toBeDisabled();
  });
});
