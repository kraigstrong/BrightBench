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

  // Consumers score audio to the reveal's own timing, so a reveal the player
  // cut short has to be distinguishable from one that ran its full length —
  // both end in the same visual state.
  it('reports whether the reveal was skipped or ran its full length', () => {
    const onRevealComplete = jest.fn();

    const { unmount } = render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        onRevealComplete={onRevealComplete}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(onRevealComplete).toHaveBeenCalledTimes(1);
    expect(onRevealComplete).toHaveBeenCalledWith({ skipped: false });

    unmount();
    onRevealComplete.mockClear();

    render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        onRevealComplete={onRevealComplete}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    fireEvent.press(screen.getByTestId('challenge-results-skip-overlay'));

    expect(onRevealComplete).toHaveBeenCalledTimes(1);
    expect(onRevealComplete).toHaveBeenCalledWith({ skipped: true });
  });

  it('fires onStarRevealed once per earned star, in reveal order', () => {
    const onStarRevealed = jest.fn();

    render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        onStarRevealed={onStarRevealed}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(onStarRevealed.mock.calls).toEqual([[1], [2], [3]]);
  });

  it('skips onStarRevealed for stars that were not earned', () => {
    const onStarRevealed = jest.fn();

    render(
      <ChallengeResultsOverlay
        accuracy={50}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        onStarRevealed={onStarRevealed}
        score={5}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(screen.getByText('1 star earned')).toBeTruthy();
    expect(onStarRevealed.mock.calls).toEqual([[2]]);
  });

  it('never fires onStarRevealed when no stars were earned', () => {
    const onStarRevealed = jest.fn();

    render(
      <ChallengeResultsOverlay
        accuracy={10}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onPlayAgain={jest.fn()}
        onStarRevealed={onStarRevealed}
        score={1}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(screen.getByText('0 stars earned')).toBeTruthy();
    expect(onStarRevealed).not.toHaveBeenCalled();
  });

  it('fires onMasteryRevealed once, only when the crown is unlocked', () => {
    const onMasteryRevealed = jest.fn();

    const { unmount } = render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery={false}
        onBack={jest.fn()}
        onMasteryRevealed={onMasteryRevealed}
        onPlayAgain={jest.fn()}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(onMasteryRevealed).not.toHaveBeenCalled();
    unmount();

    render(
      <ChallengeResultsOverlay
        accuracy={90}
        accuracyThreshold={80}
        didUnlockMastery
        onBack={jest.fn()}
        onMasteryRevealed={onMasteryRevealed}
        onPlayAgain={jest.fn()}
        score={10}
        scoreThresholdOne={4}
        scoreThresholdTwo={9}
        subtitle="Hard challenge"
        title="Time's up!"
      />,
    );

    act(() => jest.runAllTimers());

    expect(onMasteryRevealed).toHaveBeenCalledTimes(1);
  });
});
