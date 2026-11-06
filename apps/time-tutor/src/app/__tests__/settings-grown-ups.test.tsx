import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as StoreReview from 'expo-store-review';
import React from 'react';
import { AppState, Linking, Modal, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SettingsScreen from '@/app/settings';
import { REVIEW_REQUEST_STORAGE_KEY } from '@/lib/review-request';
import { getSiteUrl, getTimeTutorWriteReviewUrl } from '@/lib/site-links';
import { AppStateProvider } from '@/state/app-state';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

const getItemMock = AsyncStorage.getItem as jest.Mock;
const setItemMock = AsyncStorage.setItem as jest.Mock;
const isAvailableAsyncMock = StoreReview.isAvailableAsync as jest.Mock;
const requestReviewMock = StoreReview.requestReview as jest.Mock;

const PENDING_REVIEW = JSON.stringify({
  lastRequestAt: null,
  pending: true,
  requestCount: 0,
});

function renderSettings() {
  return render(
    <SafeAreaProvider>
      <AppStateProvider skipHydration>
        <SettingsScreen />
      </AppStateProvider>
    </SafeAreaProvider>,
  );
}

function setPlatform(os: string) {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

function storeReviewState(raw: string | null) {
  getItemMock.mockImplementation((key: string) =>
    Promise.resolve(key === REVIEW_REQUEST_STORAGE_KEY ? raw : null),
  );
}

// The prompt is random: "What is A + B?", "What is A - B?", or "What is A × B + C?".
function solveGateQuestion(question: string) {
  const sum = question.match(/^What is (\d+) \+ (\d+)\?$/);
  if (sum) {
    return Number(sum[1]) + Number(sum[2]);
  }

  const difference = question.match(/^What is (\d+) - (\d+)\?$/);
  if (difference) {
    return Number(difference[1]) - Number(difference[2]);
  }

  const product = question.match(/^What is (\d+) × (\d+) \+ (\d+)\?$/);
  if (product) {
    return Number(product[1]) * Number(product[2]) + Number(product[3]);
  }

  throw new Error(`Unrecognized parental gate question: ${question}`);
}

function currentGateAnswer() {
  const question = screen.getByTestId('parental-gate-question').props.children as string;

  return solveGateQuestion(question);
}

function answerGate(answer: number) {
  fireEvent.changeText(screen.getByTestId('parental-gate-input'), String(answer));
  fireEvent.press(screen.getByTestId('parental-gate-continue'));
}

function passGate() {
  fireEvent.press(screen.getByTestId('settings-grown-ups-unlock'));
  answerGate(currentGateAnswer());
}

// The jest Modal mock never dismisses natively, so fire iOS's onDismiss by hand.
function finishGateDismissal() {
  const modal = screen.UNSAFE_getByType(Modal);

  act(() => {
    modal.props.onDismiss?.();
  });
}

async function flushPromises() {
  for (let i = 0; i < 10; i += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

describe('settings grown-up links', () => {
  const originalPlatform = Platform.OS;
  const originalAppState = AppState.currentState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    storeReviewState(null);
    setItemMock.mockImplementation(() => Promise.resolve());
    isAvailableAsyncMock.mockResolvedValue(true);
    Object.defineProperty(AppState, 'currentState', {
      configurable: true,
      value: 'active',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    setPlatform(originalPlatform);
    Object.defineProperty(AppState, 'currentState', {
      configurable: true,
      value: originalAppState,
    });
    getItemMock.mockImplementation(() => Promise.resolve(null));
  });

  describe('on iOS', () => {
    beforeEach(() => {
      setPlatform('ios');
    });

    it('hides the grown-up links behind a single parent-check row', () => {
      renderSettings();

      expect(screen.getByText('For grown-ups')).toBeTruthy();
      expect(screen.queryByText('Help')).toBeNull();
      expect(screen.getByTestId('settings-grown-ups-unlock')).toBeTruthy();
      expect(screen.getByText('Show grown-up links')).toBeTruthy();
      expect(screen.queryByTestId('settings-rate-link')).toBeNull();
      expect(screen.queryByTestId('settings-support-link')).toBeNull();
      expect(screen.queryByTestId('settings-privacy-link')).toBeNull();
    });

    it('opens the parent check from the grown-up row', () => {
      renderSettings();

      fireEvent.press(screen.getByTestId('settings-grown-ups-unlock'));

      expect(screen.getByText('Parent Check')).toBeTruthy();
      expect(
        screen.getByText('Ask a parent to answer this to see the grown-up links.'),
      ).toBeTruthy();
      expect(screen.getByTestId('parental-gate-question')).toBeTruthy();
    });

    it('keeps the links hidden and shows the try-again error after a wrong answer', () => {
      renderSettings();

      fireEvent.press(screen.getByTestId('settings-grown-ups-unlock'));
      answerGate(currentGateAnswer() + 1);

      expect(screen.getByTestId('parental-gate-error')).toHaveTextContent(
        'Please ask a parent to try again.',
      );
      expect(screen.getByTestId('parental-gate-input').props.value).toBe('');
      expect(screen.queryByTestId('settings-rate-link')).toBeNull();
      expect(screen.queryByTestId('settings-support-link')).toBeNull();
      expect(screen.queryByTestId('settings-privacy-link')).toBeNull();
    });

    it('reveals Rate, Support, and Privacy after a correct answer', () => {
      renderSettings();

      passGate();

      expect(screen.queryByTestId('parental-gate-question')).toBeNull();
      expect(screen.queryByTestId('settings-grown-ups-unlock')).toBeNull();
      expect(screen.getByTestId('settings-rate-link')).toHaveTextContent(/Rate Time Tutor/);
      expect(screen.getByTestId('settings-support-link')).toHaveTextContent(/Support/);
      expect(screen.getByTestId('settings-privacy-link')).toHaveTextContent(
        /Privacy Policy/,
      );
    });

    it('opens the links directly once the parent check has been passed', () => {
      renderSettings();

      passGate();

      fireEvent.press(screen.getByTestId('settings-rate-link'));
      expect(Linking.openURL).toHaveBeenLastCalledWith(getTimeTutorWriteReviewUrl());
      expect(getTimeTutorWriteReviewUrl()).toContain('action=write-review');

      fireEvent.press(screen.getByTestId('settings-support-link'));
      expect(Linking.openURL).toHaveBeenLastCalledWith(getSiteUrl('/support'));

      fireEvent.press(screen.getByTestId('settings-privacy-link'));
      expect(Linking.openURL).toHaveBeenLastCalledWith(getSiteUrl('/privacy'));

      expect(screen.queryByTestId('parental-gate-question')).toBeNull();
    });

    it('asks for a rating once the parent check has dismissed when a review is due', async () => {
      jest.useFakeTimers();
      storeReviewState(PENDING_REVIEW);
      renderSettings();

      passGate();

      // Nothing before the modal has finished dismissing.
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await flushPromises();
      expect(requestReviewMock).not.toHaveBeenCalled();

      finishGateDismissal();

      act(() => {
        jest.advanceTimersByTime(499);
      });
      await flushPromises();
      expect(requestReviewMock).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      await flushPromises();

      expect(isAvailableAsyncMock).toHaveBeenCalled();
      expect(requestReviewMock).toHaveBeenCalledTimes(1);

      const savedReview = setItemMock.mock.calls.find(
        ([key]) => key === REVIEW_REQUEST_STORAGE_KEY,
      );
      expect(savedReview).toBeDefined();
      expect(JSON.parse(savedReview?.[1] as string)).toEqual({
        lastRequestAt: expect.any(Number),
        pending: false,
        requestCount: 1,
      });
    });

    it('does not ask for a rating when nothing is pending', async () => {
      jest.useFakeTimers();
      renderSettings();

      passGate();
      finishGateDismissal();

      act(() => {
        jest.advanceTimersByTime(500);
      });
      await flushPromises();

      expect(getItemMock).toHaveBeenCalledWith(REVIEW_REQUEST_STORAGE_KEY);
      expect(requestReviewMock).not.toHaveBeenCalled();
      expect(setItemMock).not.toHaveBeenCalledWith(
        REVIEW_REQUEST_STORAGE_KEY,
        expect.anything(),
      );
    });

    it('does not ask or record a request when StoreKit is unavailable', async () => {
      jest.useFakeTimers();
      storeReviewState(PENDING_REVIEW);
      isAvailableAsyncMock.mockResolvedValue(false);
      renderSettings();

      passGate();
      finishGateDismissal();

      act(() => {
        jest.advanceTimersByTime(500);
      });
      await flushPromises();

      expect(isAvailableAsyncMock).toHaveBeenCalled();
      expect(requestReviewMock).not.toHaveBeenCalled();
      expect(setItemMock).not.toHaveBeenCalledWith(
        REVIEW_REQUEST_STORAGE_KEY,
        expect.anything(),
      );
    });

    it('does not ask for a rating after a cancelled parent check', async () => {
      jest.useFakeTimers();
      storeReviewState(PENDING_REVIEW);
      renderSettings();

      fireEvent.press(screen.getByTestId('settings-grown-ups-unlock'));
      fireEvent.press(screen.getByTestId('parental-gate-cancel'));
      finishGateDismissal();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await flushPromises();

      expect(requestReviewMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('settings-grown-ups-unlock')).toBeTruthy();
    });

    it('cancels the rating request when Settings closes first', async () => {
      jest.useFakeTimers();
      storeReviewState(PENDING_REVIEW);
      const view = renderSettings();

      passGate();
      finishGateDismissal();
      view.unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await flushPromises();

      expect(requestReviewMock).not.toHaveBeenCalled();
    });
  });

  describe.each(['web', 'android'])('on %s', (os) => {
    beforeEach(() => {
      setPlatform(os);
    });

    it('shows Support and Privacy without a parent check and no Rate row', () => {
      renderSettings();

      expect(screen.getByText('For grown-ups')).toBeTruthy();
      expect(screen.queryByTestId('settings-grown-ups-unlock')).toBeNull();
      expect(screen.queryByTestId('settings-rate-link')).toBeNull();

      fireEvent.press(screen.getByTestId('settings-support-link'));
      expect(Linking.openURL).toHaveBeenLastCalledWith(getSiteUrl('/support'));

      fireEvent.press(screen.getByTestId('settings-privacy-link'));
      expect(Linking.openURL).toHaveBeenLastCalledWith(getSiteUrl('/privacy'));

      expect(screen.queryByTestId('parental-gate-question')).toBeNull();
      expect(requestReviewMock).not.toHaveBeenCalled();
    });
  });
});
