import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ExploreScreen from '@/app/explore';
import HomeScreen from '@/app/index';
import SettingsScreen from '@/app/settings';
import { ElapsedTimeChallengeScreen } from '@/components/elapsed-time-challenge-screen';
import { ElapsedTimePracticeScreen } from '@/components/elapsed-time-practice-screen';
import { ReadClockPracticeScreen } from '@/components/read-clock-practice-screen';
import { SetClockPracticeScreen } from '@/components/set-clock-practice-screen';
import { TimedChallengeScreen } from '@/components/timed-challenge-screen';
import { AppStateProvider } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('time tutor screens', () => {
  it('renders the home screen', () => {
    render(
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Time Tutor')).toBeTruthy();
    expect(screen.getByText('Choose a mode')).toBeTruthy();
    expect(screen.getByText('Explore Time')).toBeTruthy();
    expect(screen.getByText('Set the Clock')).toBeTruthy();
    expect(screen.getByText('Read the Clock')).toBeTruthy();
  });

  it('renders the settings screen', async () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider skipHydration>
          <SettingsScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByText('Settings save automatically on this device.'),
      ).toBeTruthy(),
    );

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Practice interval')).toBeTruthy();
    expect(screen.getByText('Time format')).toBeTruthy();
    expect(screen.getByText('Help')).toBeTruthy();
    expect(screen.getByText('Support')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
    expect(screen.getByText('5 minutes')).toBeTruthy();
    expect(screen.getByText('Version 1.0.0')).toBeTruthy();
  });

  it('renders the explore screen', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider skipHydration>
          <ExploreScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Explore Time')).toBeTruthy();
    expect(screen.getByText('Analog clock')).toBeTruthy();
    expect(screen.getByText('Digital time')).toBeTruthy();
  });

  it('renders the set clock practice screen', () => {
    render(
      <SafeAreaProvider>
        <SetClockPracticeScreen
          practiceInterval="5-minute"
          timeFormat="12-hour"
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Set the Clock')).toBeTruthy();
    expect(screen.getByText('Match this digital time')).toBeTruthy();
    expect(screen.getByText('Your answer')).toBeTruthy();
    expect(screen.getByText('Check Answer')).toBeTruthy();
  });

  it('renders the read clock practice screen', () => {
    render(
      <SafeAreaProvider>
        <ReadClockPracticeScreen
          practiceInterval="5-minute"
          timeFormat="12-hour"
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Read the Clock')).toBeTruthy();
    expect(screen.getByText('Read this analog clock')).toBeTruthy();
    expect(screen.getByText('Your answer')).toBeTruthy();
    expect(screen.getByText('Check Answer')).toBeTruthy();
  });

  it('renders the elapsed time practice screen', () => {
    render(
      <SafeAreaProvider>
        <ElapsedTimePracticeScreen
          practiceInterval="5-minute"
          timeFormat="12-hour"
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Elapsed Time')).toBeTruthy();
    expect(screen.getByText('How much time passes?')).toBeTruthy();
    expect(screen.getByText('Elapsed time')).toBeTruthy();
    expect(screen.getByText('Check Answer')).toBeTruthy();
  });

  it('renders the timed challenge screen', () => {
    render(
      <SafeAreaProvider>
        <TimedChallengeScreen
          mode="digital-to-analog"
          practiceInterval="5-minute"
          timeFormat="12-hour"
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Challenge Mode')).toBeTruthy();
    expect(screen.getByText('Time left')).toBeTruthy();
    expect(screen.getByText('Score')).toBeTruthy();
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('renders the elapsed time challenge screen', () => {
    render(
      <SafeAreaProvider>
        <ElapsedTimeChallengeScreen
          practiceInterval="5-minute"
          timeFormat="12-hour"
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Challenge Mode')).toBeTruthy();
    expect(screen.getByText('How much time passes?')).toBeTruthy();
    expect(screen.getByText('Elapsed time')).toBeTruthy();
    expect(screen.getByText('Start')).toBeTruthy();
  });
});
