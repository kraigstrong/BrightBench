import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChallengeResultsCard } from '@education/ui';

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
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        score={8}
        scoreThresholdOne={5}
        scoreThresholdTwo={8}
        subtitle="Medium challenge · 5 min"
        title="Time's up!"
      />,
    );

    expect(screen.getByText('Revealing your stars...')).toBeTruthy();
    expect(screen.getByTestId('challenge-play-again-button')).toBeTruthy();
    expect(screen.getByTestId('challenge-summary-back-button')).toBeTruthy();
    expect(screen.getByTestId('challenge-results-skip-overlay')).toBeTruthy();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('3 stars earned')).toBeTruthy();
    expect(screen.getByTestId('challenge-play-again-button')).toBeTruthy();
  });

  it('fast-forwards the reveal when play again is tapped early', () => {
    render(
      <ChallengeResultsCard
        accuracy={80}
        accuracyThreshold={80}
        didUnlockMastery
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        score={8}
        scoreThresholdOne={5}
        scoreThresholdTwo={8}
        subtitle="Hard challenge · 1 min"
        title="Time's up!"
      />,
    );

    fireEvent.press(screen.getByTestId('challenge-play-again-button'));

    expect(screen.getByText('3 stars earned')).toBeTruthy();
    expect(screen.getAllByText('Crown Unlocked!').length).toBeGreaterThan(0);
    expect(screen.getByTestId('challenge-summary-back-button')).toBeTruthy();
  });
});
