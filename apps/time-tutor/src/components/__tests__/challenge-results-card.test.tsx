import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChallengeResultsCard } from '@/components/challenge-results-card';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

describe('ChallengeResultsCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('reveals stars and actions after the animation completes', () => {
    render(
      <ChallengeResultsCard
        accuracy={80}
        accuracyThreshold={80}
        didUnlockMastery={false}
        difficulty="medium"
        intervalLabel="5 min"
        onPlayAgain={jest.fn()}
        score={8}
        scoreThreshold={8}
      />,
    );

    expect(screen.getByText('Revealing your stars...')).toBeTruthy();
    expect(screen.getByTestId('challenge-play-again-button')).toBeTruthy();
    expect(screen.getByTestId('challenge-summary-back-button')).toBeTruthy();
    expect(screen.getByTestId('challenge-results-skip-overlay')).toBeTruthy();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('2 stars earned')).toBeTruthy();
    expect(screen.getByTestId('challenge-play-again-button')).toBeTruthy();
  });

  it('fast-forwards the reveal when play again is tapped early', () => {
    render(
      <ChallengeResultsCard
        accuracy={100}
        accuracyThreshold={80}
        didUnlockMastery
        difficulty="hard"
        intervalLabel="1 min"
        onPlayAgain={jest.fn()}
        score={15}
        scoreThreshold={14}
      />,
    );

    fireEvent.press(screen.getByTestId('challenge-play-again-button'));

    expect(screen.getByText('3 stars earned')).toBeTruthy();
    expect(screen.getAllByText('Crown Unlocked!').length).toBeGreaterThan(0);
    expect(screen.getByTestId('challenge-summary-back-button')).toBeTruthy();
  });
});
