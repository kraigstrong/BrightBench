import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TimedChallengeScreen } from '@/components/timed-challenge-screen';
import { recordFinishedRound } from '@/lib/review-request';
import { AppStateProvider } from '@/state/app-state';
import type { ChallengeProgressSnapshot } from '@/types/time';

// A player whose seekTo resolves, so the reveal's audio path doesn't reject.
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

jest.mock('@/lib/review-request', () => ({
  ...jest.requireActual('@/lib/review-request'),
  recordFinishedRound: jest.fn(() => Promise.resolve()),
}));

const recordFinishedRoundMock = recordFinishedRound as jest.Mock;

// Same stepping as the reveal-audio tests: the finished status is set inside a
// setTimeRemaining updater, which one bulk advance does not flush.
async function runChallengeToCompletion() {
  act(() => {
    jest.advanceTimersByTime(2500);
  });

  for (let tick = 0; tick < 65; tick += 1) {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  }

  await act(async () => {
    await Promise.resolve();
  });
}

function renderChallenge(initialChallengeProgress?: Partial<ChallengeProgressSnapshot>) {
  return render(
    <SafeAreaProvider>
      <AppStateProvider initialChallengeProgress={initialChallengeProgress} skipHydration>
        <TimedChallengeScreen
          difficulty="medium"
          mode="digital-to-analog"
          timeFormat="12-hour"
        />
      </AppStateProvider>
    </SafeAreaProvider>,
  );
}

describe('challenge round review timing', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('reports each finished round once, counting a crown from any mode', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    renderChallenge({
      'analog-to-digital': { bestStars: { easy: 3, medium: 3, hard: 3 } },
    });

    await runChallengeToCompletion();

    expect(screen.getByText("Time's up!")).toBeTruthy();

    // Let the reveal play out; nothing about it should report the round again.
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(recordFinishedRoundMock).toHaveBeenCalledTimes(1);
    expect(recordFinishedRoundMock).toHaveBeenCalledWith({
      earnedStars: 0,
      hasCrown: true,
    });
  });

  it('reports no crown when the learner has none', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    renderChallenge();

    await runChallengeToCompletion();

    expect(recordFinishedRoundMock).toHaveBeenCalledTimes(1);
    expect(recordFinishedRoundMock).toHaveBeenCalledWith({
      earnedStars: 0,
      hasCrown: false,
    });
  });

  it('does nothing off iOS', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    renderChallenge({
      'analog-to-digital': { bestStars: { easy: 3, medium: 3, hard: 3 } },
    });

    await runChallengeToCompletion();

    expect(screen.getByText("Time's up!")).toBeTruthy();
    expect(recordFinishedRoundMock).not.toHaveBeenCalled();
  });
});
