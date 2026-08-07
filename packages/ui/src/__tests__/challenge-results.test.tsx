import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChallengeResultsOverlay } from '../challenge-results-overlay';

describe('ChallengeResultsOverlay', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('reveals earned stars and preserves both actions', () => {
    const onBack = jest.fn();
    const onPlayAgain = jest.fn();

    render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={onBack}
        onPlayAgain={onPlayAgain}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(screen.getByText('3 stars earned')).toBeTruthy();
    fireEvent.press(screen.getByTestId('challenge-play-again-button'));
    fireEvent.press(screen.getByTestId('challenge-summary-back-button'));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
