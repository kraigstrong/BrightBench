import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ExploreScreen from '@/app/explore';
import HomeScreen from '@/app/index';
import ChallengeLaunchScreen from '@/app/challenge/[mode]';
import ModeScreen from '@/app/mode/[mode]';
import SettingsScreen from '@/app/settings';
import { ElapsedTimeChallengeScreen } from '@/components/elapsed-time-challenge-screen';
import { ElapsedTimePracticeScreen } from '@/components/elapsed-time-practice-screen';
import { ReadClockPracticeScreen } from '@/components/read-clock-practice-screen';
import { SetClockPracticeScreen } from '@/components/set-clock-practice-screen';
import { TimedChallengeScreen } from '@/components/timed-challenge-screen';
import { AppStateProvider } from '@/state/app-state';

const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

describe('time tutor screens', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ mode: 'digital-to-analog' });
  });

  it('renders the home screen', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider skipHydration>
          <HomeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Time Tutor')).toBeTruthy();
    expect(screen.getByText('Choose a mode')).toBeTruthy();
    expect(screen.getByText('Explore Time')).toBeTruthy();
    expect(screen.getByText('Set the Clock')).toBeTruthy();
    expect(screen.getByText('Read the Clock')).toBeTruthy();
  });

  it('shows a crown on the home mode card when that mode challenge is mastered', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider
          initialChallengeProgress={{
            'digital-to-analog': {
              bestStars: {
                easy: 3,
                medium: 3,
                hard: 3,
              },
            },
          }}
          skipHydration>
          <HomeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getAllByLabelText('Mastered').length).toBeGreaterThan(0);
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

  it('renders challenge stars on the mode screen', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider
          initialChallengeProgress={{
            'digital-to-analog': {
              bestStars: {
                easy: 2,
                medium: 3,
                hard: 1,
              },
            },
          }}
          skipHydration>
          <ModeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Choose how you want to play.')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
  });

  it('clears challenge progress for the current mode from the dev button', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider
          initialChallengeProgress={{
            'digital-to-analog': {
              bestStars: {
                easy: 3,
                medium: 3,
                hard: 3,
              },
            },
          }}
          skipHydration>
          <ModeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
    expect(screen.getByLabelText('Mastered')).toBeTruthy();

    fireEvent.press(screen.getByTestId('challenge-clear-progress-button'));

    expect(screen.queryByLabelText('Mastered')).toBeNull();
  });

  it('renders the challenge launch popup', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider
          initialChallengeProgress={{
            'digital-to-analog': {
              bestStars: {
                easy: 1,
                medium: 2,
                hard: 0,
              },
            },
          }}
          skipHydration>
          <ChallengeLaunchScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Choose your difficulty')).toBeTruthy();
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
    expect(screen.getByText('15 min. intervals')).toBeTruthy();
    expect(screen.getByText('5 min. intervals')).toBeTruthy();
    expect(screen.getByText('1 min. intervals')).toBeTruthy();
    expect(screen.getByText('1 / 3')).toBeTruthy();
    expect(screen.getByText('2 / 3')).toBeTruthy();
  });

  it('shows a mastery crown when a challenge mode has all 9 stars', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider
          initialChallengeProgress={{
            'digital-to-analog': {
              bestStars: {
                easy: 3,
                medium: 3,
                hard: 3,
              },
            },
          }}
          skipHydration>
          <ModeScreen />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByLabelText('Mastered')).toBeTruthy();
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
        <AppStateProvider skipHydration>
          <TimedChallengeScreen
            difficulty="medium"
            mode="digital-to-analog"
            timeFormat="12-hour"
          />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Challenge Mode')).toBeTruthy();
    expect(screen.getByText('Medium · 5 min')).toBeTruthy();
    expect(screen.getByTestId('challenge-timer-bar')).toBeTruthy();
    expect(screen.getByTestId('challenge-start-button')).toBeTruthy();
  });

  it('renders the elapsed time challenge screen', () => {
    render(
      <SafeAreaProvider>
        <AppStateProvider skipHydration>
          <ElapsedTimeChallengeScreen difficulty="easy" timeFormat="12-hour" />
        </AppStateProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Challenge Mode')).toBeTruthy();
    expect(screen.getByText('How much time passes?')).toBeTruthy();
    expect(screen.getByText('Elapsed time')).toBeTruthy();
    expect(screen.getByText('Easy · 15 min')).toBeTruthy();
    expect(screen.getByTestId('challenge-timer-bar')).toBeTruthy();
    expect(screen.getByTestId('challenge-start-button')).toBeTruthy();
  });
});
