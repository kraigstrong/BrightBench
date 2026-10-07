import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CelebrationOverlay } from '@education/ui';
import { ChallengeScene } from '@/features/game/challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { generateBuildRound } from '@/features/game/modes/build';
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

// Real evaluation; only the target is pinned to 3/4.
jest.mock('@/features/game/modes/build', () => ({
  ...jest.requireActual('@/features/game/modes/build'),
  generateBuildRound: jest.fn(),
}));

jest.mock('@education/ui', () => ({
  ...jest.requireActual('@education/ui'),
  CelebrationOverlay: jest.fn(() => null),
}));

const useAppStateMock = jest.mocked(useAppState);
const generateBuildRoundMock = jest.mocked(generateBuildRound);
const celebrationMock = jest.mocked(CelebrationOverlay);
const recordRound = jest.fn();

async function renderSettled(ui: React.ReactElement) {
  render(ui);
  await act(async () => {});
}

function cutTo(pieces: number) {
  const fewer = screen.getByLabelText('Fewer pieces');
  const more = screen.getByLabelText('Cut into more pieces');
  for (let guard = 0; guard < 10; guard += 1) {
    const current = screen.queryByText(/^(\d+) pieces$/)?.props.children;
    const count = typeof current === 'string' ? Number(current.split(' ')[0]) : 1;
    if (count === pieces) {
      return;
    }
    fireEvent.press(count < pieces ? more : fewer);
  }
  throw new Error(`could not cut to ${pieces}`);
}

function fill(count: number, pieces: number) {
  for (let index = 1; index <= count; index += 1) {
    fireEvent.press(screen.getByLabelText(`Piece ${index} of ${pieces}`));
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

describe('Build mode (Cut & Fill)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    let count = 0;
    generateBuildRoundMock.mockImplementation(({ difficultyLevel }: { difficultyLevel: DifficultyLevel }) => {
      count += 1;
      return {
        id: `build-${count}`,
        mode: 'build',
        prompt: 'Make 3/4.',
        targetFractionId: '3-4',
        representation: 'bar',
        difficultyLevel,
        partitions: 4,
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

  it('practice: starts uncut, explains a cut that cannot work, and accepts an equivalent build', async () => {
    await renderSettled(<ModePlayScene mode="build" sessionType="practice" difficultyLevel="medium" />);

    expect(screen.getByText('Make 3/4.')).toBeTruthy();
    expect(screen.getByText('Not cut yet')).toBeTruthy();
    expect(checkButton()).toBeDisabled();

    cutTo(3);
    fill(2, 3);
    expect(screen.getByText('2 of 3 filled')).toBeTruthy();
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'build', targetFractionId: '3-4', wasCorrect: false })
    );
    expect(screen.getByText("Thirds can't make exactly 3/4.")).toBeTruthy();
    // The shared retry callout is replaced by the message under the bar.
    expect(screen.queryByText('Keep adjusting')).toBeNull();

    cutTo(8);
    expect(screen.getByText('0 of 8 filled')).toBeTruthy();
    expect(screen.getByText('Use the dashed lines to fix it.')).toBeTruthy();
    fill(6, 8);
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: true }));
    expect(screen.getByText('6 eighths is the same as 3/4!')).toBeTruthy();
    expect(screen.getByLabelText('Cut into more pieces')).toBeDisabled();
    expect(celebrationMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ visible: true, showMessage: false })
    );

    advance(1200);
    expect(screen.getByText('Not cut yet')).toBeTruthy();
    expect(checkButton()).toBeDisabled();
  });

  it("practice: names the target's own parts on success", async () => {
    await renderSettled(<ModePlayScene mode="build" sessionType="practice" difficultyLevel="medium" />);

    cutTo(4);
    fill(3, 4);
    fireEvent.press(checkButton());

    expect(screen.getByText("That's 3/4!")).toBeTruthy();
    expect(screen.getByText('3 of 4 equal parts.')).toBeTruthy();
  });

  it('fills and empties pieces with the big buttons as well as taps', async () => {
    await renderSettled(<ModePlayScene mode="build" sessionType="practice" difficultyLevel="medium" />);

    const fillOne = screen.getByLabelText('Fill one more piece');
    const emptyOne = screen.getByLabelText('Empty one piece');
    expect(emptyOne).toBeDisabled();

    cutTo(8);
    for (let press = 0; press < 7; press += 1) {
      fireEvent.press(fillOne);
    }
    expect(screen.getByText('7 of 8 filled')).toBeTruthy();
    expect(screen.getByLabelText('Piece 7 of 8')).toBeChecked();
    expect(screen.getByLabelText('Piece 8 of 8')).not.toBeChecked();

    // Empty one takes back the rightmost filled piece, even one filled by a tap.
    fireEvent.press(screen.getByLabelText('Piece 8 of 8'));
    fireEvent.press(emptyOne);
    expect(screen.getByLabelText('Piece 8 of 8')).not.toBeChecked();
    expect(screen.getByLabelText('Piece 7 of 8')).toBeChecked();
    fireEvent.press(emptyOne);
    expect(screen.getByText('6 of 8 filled')).toBeTruthy();

    fireEvent.press(checkButton());
    expect(recordRound).toHaveBeenLastCalledWith(expect.objectContaining({ wasCorrect: true }));
    expect(screen.getByLabelText('Fill one more piece')).toBeDisabled();
    expect(screen.getByLabelText('Empty one piece')).toBeDisabled();
  });

  it('challenge: scores builds and advances on the existing timings', async () => {
    await renderSettled(<ChallengeScene mode="build" difficultyLevel="easy" />);
    advance(4000);

    cutTo(4);
    fill(3, 4);
    fireEvent.press(checkButton());

    expect(recordRound).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'build', sessionType: 'challenge', wasCorrect: true })
    );
    const rounds = generateBuildRoundMock.mock.calls.length;
    advance(700);
    expect(generateBuildRoundMock).toHaveBeenCalledTimes(rounds + 1);
    expect(screen.getByText('Not cut yet')).toBeTruthy();
  });
});
