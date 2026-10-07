import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CelebrationOverlay } from '@education/ui';
import { ChallengeScene } from '@/features/game/challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { generateLineRound } from '@/features/game/modes/line';
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

// Real evaluation; only the target is pinned (3/4 unless a test says otherwise).
jest.mock('@/features/game/modes/line', () => ({
  ...jest.requireActual('@/features/game/modes/line'),
  generateLineRound: jest.fn(),
}));

jest.mock('@education/ui', () => ({
  ...jest.requireActual('@education/ui'),
  CelebrationOverlay: jest.fn(() => null),
}));

const useAppStateMock = jest.mocked(useAppState);
const generateLineRoundMock = jest.mocked(generateLineRound);
const celebrationMock = jest.mocked(CelebrationOverlay);
const recordRound = jest.fn();

let target = { id: '3-4', label: '3/4', lineMax: 1 };

async function renderSettled(ui: React.ReactElement) {
  render(ui);
  await act(async () => {});
}

const HOP_SIZES = ['1 whole', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7', '1/8'];

function hopSizeTo(parts: number) {
  for (let guard = 0; guard < 10; guard += 1) {
    const current = HOP_SIZES.findIndex((label) => screen.queryByText(label)) + 1;
    if (current === parts) {
      return;
    }
    fireEvent.press(screen.getByLabelText(current < parts ? 'Smaller hops' : 'Bigger hops'));
  }
  throw new Error(`could not set hop size to 1/${parts}`);
}

function hop(times: number) {
  for (let index = 0; index < times; index += 1) {
    fireEvent.press(screen.getByLabelText('Hop forward'));
  }
}

function checkButton() {
  return screen.getByRole('button', { name: 'Check' });
}

function advance(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

describe('Number Line mode (Hop It)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    target = { id: '3-4', label: '3/4', lineMax: 1 };
    let count = 0;
    generateLineRoundMock.mockImplementation(({ difficultyLevel }: { difficultyLevel: DifficultyLevel }) => {
      count += 1;
      return {
        id: `line-${count}`,
        mode: 'line',
        prompt: `Hop the frog to ${target.label}.`,
        targetFractionId: target.id,
        representation: 'line',
        difficultyLevel,
        lineMax: target.lineMax,
      };
    });
    useAppStateMock.mockReturnValue({
      hydrated: true,
      progress: defaultProgress,
      settings: defaultSettings,
      lastResult: null,
      recordRound,
      setChallengeBestStars: jest.fn(),
      setLastSelectedChallengeDifficulty: jest.fn(),
      setLastSelectedPracticeDifficulty: jest.fn(),
      updateSettings: jest.fn(),
      clearLastResult: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('practice: starts at 0, explains a hop size that cannot work, and accepts an equivalent landing', async () => {
    await renderSettled(<ModePlayScene mode="line" sessionType="practice" difficultyLevel="medium" />);

    expect(screen.getByText('Hop the frog to 3/4.')).toBeTruthy();
    expect(screen.getByText('1 whole')).toBeTruthy();
    expect(screen.getByText('At 0')).toBeTruthy();
    expect(checkButton()).toBeDisabled();
    expect(screen.getByLabelText('Hop back')).toBeDisabled();

    hopSizeTo(3);
    hop(2);
    expect(screen.getByText('2 hops')).toBeTruthy();
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'line', targetFractionId: '3-4', wasCorrect: false })
    );
    expect(screen.getByText("Thirds can't land exactly on 3/4.")).toBeTruthy();
    // The shared retry callout is replaced by the message under the line.
    expect(screen.queryByText('Keep going')).toBeNull();
    expect(checkButton()).toBeDisabled();

    // A new hop size sends the frog back to 0.
    hopSizeTo(8);
    expect(screen.getByText('At 0')).toBeTruthy();
    expect(screen.getByText('Hop to the flag.')).toBeTruthy();
    hop(7);
    fireEvent.press(screen.getByLabelText('Hop back'));
    expect(screen.getByText('6 hops')).toBeTruthy();
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: true }));
    expect(screen.getByText('6 eighths is the same as 3/4!')).toBeTruthy();
    expect(screen.getByLabelText('Hop forward')).toBeDisabled();
    expect(screen.getByLabelText('Smaller hops')).toBeDisabled();
    expect(celebrationMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ visible: true, showMessage: false })
    );

    advance(1200);
    expect(screen.getByText('At 0')).toBeTruthy();
    expect(screen.getByText('1 whole')).toBeTruthy();
    expect(checkButton()).toBeDisabled();
  });

  it('practice: says when a workable hop size falls short', async () => {
    await renderSettled(<ModePlayScene mode="line" sessionType="practice" difficultyLevel="medium" />);

    hopSizeTo(4);
    hop(2);
    fireEvent.press(checkButton());
    expect(screen.getByText('Not quite to 3/4.')).toBeTruthy();
    expect(screen.getByText('The flag shows where 3/4 is.')).toBeTruthy();

    hop(1);
    fireEvent.press(checkButton());
    expect(screen.getByText("That's 3/4!")).toBeTruthy();
    expect(screen.getByText('3 hops of 1/4.')).toBeTruthy();
  });

  it('practice: tapping the frog hops it, and Hard keeps hopping past 1', async () => {
    target = { id: '5-4', label: '5/4', lineMax: 2 };
    await renderSettled(<ModePlayScene mode="line" sessionType="practice" difficultyLevel="hard" />);

    hopSizeTo(4);
    for (let tap = 0; tap < 5; tap += 1) {
      fireEvent.press(screen.getByTestId('frog'));
    }
    expect(screen.getByText('5 hops')).toBeTruthy();

    // The line runs to 2, so 8 quarter-hops is as far as the frog can go.
    hop(3);
    expect(screen.getByText('8 hops')).toBeTruthy();
    expect(screen.getByLabelText('Hop forward')).toBeDisabled();

    fireEvent.press(screen.getByLabelText('Hop back'));
    fireEvent.press(screen.getByLabelText('Hop back'));
    fireEvent.press(screen.getByLabelText('Hop back'));
    fireEvent.press(checkButton());
    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: true }));
    expect(screen.getByText("That's 5/4!")).toBeTruthy();
  });

  it('challenge: scores hops and advances on the existing timings', async () => {
    await renderSettled(<ChallengeScene mode="line" difficultyLevel="easy" />);
    advance(4000);

    hopSizeTo(4);
    hop(3);
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'line', sessionType: 'challenge', wasCorrect: true })
    );
    const rounds = generateLineRoundMock.mock.calls.length;
    advance(700);
    expect(generateLineRoundMock).toHaveBeenCalledTimes(rounds + 1);
    expect(screen.getByText('At 0')).toBeTruthy();
  });
});
