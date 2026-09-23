import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ChallengeLaunchScreen from '@/app/challenge/[mode]';
import ModeScreen from '@/app/mode/[mode]';
import PracticeLaunchScreen from '@/app/practice/[mode]';
import { playModeTapSound } from '@/lib/answer-feedback';
import { AppStateProvider } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ mode: 'digital-to-analog' }),
}));

// Only the tap is stubbed; the rest of the module stays real so nothing else
// about feedback behaviour is quietly replaced.
jest.mock('@/lib/answer-feedback', () => ({
  ...jest.requireActual('@/lib/answer-feedback'),
  playModeTapSound: jest.fn(),
}));

const playModeTapSoundMock = playModeTapSound as jest.Mock;

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <AppStateProvider skipHydration>{ui}</AppStateProvider>
    </SafeAreaProvider>,
  );
}

describe('mode tap wiring', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    playModeTapSoundMock.mockClear();
    (router.push as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('clicks when choosing Practice', () => {
    renderScreen(<ModeScreen />);

    fireEvent.press(screen.getByTestId('practice-session-card'));

    expect(playModeTapSoundMock).toHaveBeenCalledWith(true);
  });

  it('clicks when choosing Challenge', () => {
    renderScreen(<ModeScreen />);

    fireEvent.press(screen.getByTestId('challenge-session-card'));

    expect(playModeTapSoundMock).toHaveBeenCalledWith(true);
  });

  // Challenge is gated on web, where the card renders disabled and therefore
  // never fires onPress at all — so this does not exercise the guard inside
  // goToSession, which stays as defence in depth. What it does protect is the
  // user-visible behaviour: if the card is ever made pressable while locked (to
  // show a "coming soon" message, say), a click that goes nowhere would have to
  // be dealt with deliberately rather than shipping by accident.
  it('neither clicks nor navigates when the Challenge card is locked', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    renderScreen(<ModeScreen />);

    fireEvent.press(screen.getByTestId('challenge-session-card'));

    expect(playModeTapSoundMock).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('clicks when choosing a practice interval', () => {
    renderScreen(<PracticeLaunchScreen />);

    fireEvent.press(screen.getByTestId('practice-interval-hours-only'));

    expect(playModeTapSoundMock).toHaveBeenCalledWith(true);
  });

  it('clicks when choosing a challenge difficulty', () => {
    renderScreen(<ChallengeLaunchScreen />);

    fireEvent.press(screen.getByTestId('challenge-tier-easy'));

    expect(playModeTapSoundMock).toHaveBeenCalledWith(true);
  });

  it('passes the sound setting through rather than assuming it is on', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider initialSoundEffectsEnabled={false} skipHydration>
          <ModeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('practice-session-card'));

    expect(playModeTapSoundMock).toHaveBeenCalledWith(false);
  });
});
