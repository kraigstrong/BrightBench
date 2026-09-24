import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { REWARD_SOUNDS } from '@education/audio';

import { TimedChallengeScreen } from '@/components/timed-challenge-screen';
import { AppStateProvider } from '@/state/app-state';

// The shared jest setup hands back a player whose seekTo() returns undefined,
// which is enough for render tests but makes the playback path reject here.
// These tests need a player that resolves so the roll actually starts.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    loop: false,
    pause: jest.fn(),
    play: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ mode: 'digital-to-analog' }),
}));

const createAudioPlayerMock = createAudioPlayer as unknown as jest.Mock;

type MockPlayer = { pause: jest.Mock; play: jest.Mock; seekTo: jest.Mock };

// @education/audio caches one player per sound at module level, so only the
// first test in this file causes createAudioPlayer to be called for the roll.
// Later tests reuse that same object; jest.clearAllMocks() in beforeEach resets
// its own play/pause records, so assertions stay per-test.
let cachedRollPlayer: MockPlayer | undefined;

function rollPlayer(): MockPlayer | undefined {
  const found = createAudioPlayerMock.mock.calls
    .map((call, index) => ({
      asset: call[0],
      player: createAudioPlayerMock.mock.results[index]?.value as MockPlayer,
    }))
    .find((candidate) => candidate.asset === REWARD_SOUNDS.suspenseRoll)?.player;

  if (found) {
    cachedRollPlayer = found;
  }

  return cachedRollPlayer;
}

// The run's timer sets the finished status from inside a setTimeRemaining
// updater, which a single bulk advanceTimersByTime does not flush. Stepping one
// tick at a time is what actually drives the run to completion.
async function runChallengeToCompletion() {
  act(() => {
    jest.advanceTimersByTime(2500);
  });

  for (let tick = 0; tick < 65; tick += 1) {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  }

  // startSuspenseLoop awaits the audio-mode setup before it creates a player,
  // so the roll does not exist until the promise chain has been flushed.
  await act(async () => {
    await Promise.resolve();
  });
}

function renderChallenge() {
  return render(
    <SafeAreaProvider>
      <AppStateProvider skipHydration>
        <TimedChallengeScreen
          difficulty="medium"
          mode="digital-to-analog"
          timeFormat="12-hour"
        />
      </AppStateProvider>
    </SafeAreaProvider>,
  );
}

// onRevealComplete fires 3520ms after the reveal starts.
const PAST_REVEAL_COMPLETE_MS = 4000;

describe('challenge reveal audio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // The crash lands on the score bar completing and then rings out over the
  // finished card. Stopping the roll at reveal-complete is what cut the cymbal
  // off mid-decay and made the ending sound abrupt. Since nothing in the normal
  // path stops it any more, leaving the reveal has to, or the roll follows the
  // player to the next screen.
  it('rings out past the reveal and stops only when the reveal is left', async () => {
    const view = renderChallenge();

    await runChallengeToCompletion();

    expect(screen.getByText("Time's up!")).toBeTruthy();

    const player = rollPlayer();

    expect(player).toBeDefined();
    expect((player as MockPlayer).play).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(PAST_REVEAL_COMPLETE_MS);
    });

    expect((player as MockPlayer).pause).not.toHaveBeenCalled();

    view.unmount();

    expect((player as MockPlayer).pause).toHaveBeenCalled();
  });

  // Skipping jumps the bars to their end and fires onRevealComplete without
  // leaving the results screen, so the cleanup effect never runs. The moment
  // the crash exists to punctuate has already passed, so it must not fire
  // seconds later over a static card.
  it('stops the roll when the reveal is skipped', async () => {
    renderChallenge();
    await runChallengeToCompletion();

    const player = rollPlayer();

    expect(player).toBeDefined();
    expect((player as MockPlayer).pause).not.toHaveBeenCalled();

    act(() => {
      fireEvent.press(screen.getByTestId('challenge-results-skip-overlay'));
    });

    expect((player as MockPlayer).pause).toHaveBeenCalled();
  });
});
