import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import PourLabScreen from '@/app/lab/pour/[concept]';
import ModeDetailScreen from '@/app/mode/[mode]';
import { defaultProgress, defaultSettings, useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Redirect: () => null,
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ concept: 'peek' })),
}));

jest.mock('@/state/app-state', () => ({
  ...jest.requireActual('@/state/app-state'),
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);
const expoRouterMock = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
  useLocalSearchParams: jest.Mock;
};

const writers = {
  recordRound: jest.fn(),
  setChallengeBestStars: jest.fn(),
  setLastSelectedChallengeDifficulty: jest.fn(),
  setLastSelectedPracticeDifficulty: jest.fn(),
  updateSettings: jest.fn(),
  clearLastResult: jest.fn(),
};

// Lets the short tilt and reveal tweens finish inside act().
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

function tap(label: string, times = 1) {
  const target = screen.queryByLabelText(label) ?? screen.getByRole('button', { name: label });
  for (let index = 0; index < times; index += 1) {
    fireEvent(target, 'pressIn');
    fireEvent(target, 'pressOut');
  }
}

describe('Pour Lab prototype', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Medium Pour pool starts with 1/2, so every round targets 1/2 (24 splashes = 1 glass).
    jest.spyOn(Math, 'random').mockReturnValue(0);
    useAppStateMock.mockReturnValue({
      hydrated: true,
      progress: defaultProgress,
      settings: defaultSettings,
      lastResult: null,
      ...writers,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    for (const writer of Object.values(writers)) {
      expect(writer).not.toHaveBeenCalled();
    }
  });

  it('Pour & Peek: pours by taps, reveals equal parts on a miss, and solves after a fix', async () => {
    expoRouterMock.useLocalSearchParams.mockReturnValue({ concept: 'peek' });
    render(<PourLabScreen />);

    expect(await screen.findByText('of the glass')).toBeTruthy();
    expect(screen.getByText('1/2')).toBeTruthy();
    expect(screen.getByText('Hold the pitcher to pour. Tap it for a splash.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();

    tap('Pitcher', 14);
    fireEvent.press(screen.getByRole('button', { name: 'Check' }));
    await settle();

    expect(screen.getByText('A little over 1/2.')).toBeTruthy();
    expect(screen.getByText('The lines split the glass into 2 equal parts.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();

    tap('Pour out', 2);
    expect(screen.getByText('Use the equal parts to fix it.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Check' }));
    await settle();

    expect(screen.getByText("That's 1/2!")).toBeTruthy();
    expect(screen.getByText('1 of 2 equal parts.')).toBeTruthy();
    expect(screen.getByLabelText('Pitcher')).toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Next glass' }));
    await settle();
    expect(screen.getByText('Glass 2')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
  });

  it('Split the Glass: pours across, pours back, and names the part left behind', async () => {
    expoRouterMock.useLocalSearchParams.mockReturnValue({ concept: 'split' });
    render(<PourLabScreen />);

    expect(await screen.findByText('of the water into the empty glass')).toBeTruthy();

    tap('Left glass', 15);
    fireEvent.press(screen.getByRole('button', { name: 'Check' }));
    await settle();
    expect(screen.getByText('A little more than 1/2.')).toBeTruthy();
    expect(screen.getByText('The lines split each glass into 2 equal parts.')).toBeTruthy();

    tap('Right glass', 3);
    fireEvent.press(screen.getByRole('button', { name: 'Check' }));
    await settle();

    expect(screen.getByText('1/2 poured, 1/2 left.')).toBeTruthy();
    expect(screen.getByText('Together they make 1 whole.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next round' })).toBeTruthy();
  });

  it('switches concepts and restarts with an empty glass when the level changes', async () => {
    expoRouterMock.useLocalSearchParams.mockReturnValue({ concept: 'peek' });
    render(<PourLabScreen />);
    await screen.findByText('Glass 1');

    // Water poured on round 1 must not carry into the new level's round 1.
    tap('Pitcher', 6);
    expect(screen.getByRole('button', { name: 'Check' })).toBeEnabled();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Easy' }));
    });
    expect(await screen.findByText('Glass 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pour out' })).toBeDisabled();

    fireEvent.press(screen.getByRole('tab', { name: 'B · Split the Glass' }));
    await settle();
    expect(await screen.findByText('of the water into the empty glass')).toBeTruthy();

    tap('Left glass', 12);
    fireEvent.press(screen.getByRole('button', { name: 'Check' }));
    await settle();
    fireEvent.press(screen.getByRole('button', { name: 'Next round' }));
    await settle();
    expect(screen.getByText('Round 2')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
  });

  it('shows the development-only entry on the Pour mode screen only', () => {
    expoRouterMock.useLocalSearchParams.mockReturnValue({ mode: 'pour' });
    const { unmount } = render(<ModeDetailScreen />);

    fireEvent.press(screen.getByText('Pour Lab'));
    expect(expoRouterMock.router.push).toHaveBeenCalledWith('/lab/pour/peek');
    unmount();

    expoRouterMock.useLocalSearchParams.mockReturnValue({ mode: 'find' });
    render(<ModeDetailScreen />);
    expect(screen.queryByText('Pour Lab')).toBeNull();
  });

  it('hides the entry in release builds', () => {
    const globals = globalThis as { __DEV__?: boolean };
    const previous = globals.__DEV__;
    globals.__DEV__ = false;

    try {
      expoRouterMock.useLocalSearchParams.mockReturnValue({ mode: 'pour' });
      render(<ModeDetailScreen />);
      expect(screen.getByText('Practice')).toBeTruthy();
      expect(screen.queryByText('Pour Lab')).toBeNull();
    } finally {
      globals.__DEV__ = previous;
    }
  });
});
