import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChallengeCountdownOverlay } from '../challenge-countdown-overlay';
import { ChallengeTimerBar } from '../challenge-timer-bar';
import { ProgressFooter } from '../progress-footer';
import { TieredChallengeLauncher } from '../tiered-challenge-launcher';

describe('shared challenge primitives', () => {
  it('renders countdown values and hides the completed countdown', () => {
    const { rerender } = render(<ChallengeCountdownOverlay value={3} />);

    expect(screen.getByText('3')).toBeTruthy();

    rerender(<ChallengeCountdownOverlay value="go" />);
    expect(screen.getByText('GO')).toBeTruthy();

    rerender(<ChallengeCountdownOverlay value={null} />);
    expect(screen.queryByTestId('challenge-countdown-value')).toBeNull();
  });

  it('clamps timer progress to the visible rail', () => {
    const { rerender } = render(
      <ChallengeTimerBar fillTestID="fill" progress={1.5} testID="rail" />,
    );

    expect(screen.getByTestId('fill')).toHaveStyle({ width: '100%' });

    rerender(<ChallengeTimerBar fillTestID="fill" progress={-1} testID="rail" />);
    expect(screen.getByTestId('fill')).toHaveStyle({ width: '0%' });
  });

  it('renders metric, star, and empty progress states', () => {
    const { rerender } = render(
      <ProgressFooter
        items={[
          { label: 'Accuracy', value: '80%' },
          { label: 'Hard', stars: 2 },
        ]}
      />,
    );

    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();

    rerender(<ProgressFooter emptyText="No progress yet" items={[]} />);
    expect(screen.getByText('No progress yet')).toBeTruthy();
  });

  it('routes tier selection and cancellation through callbacks', () => {
    const onCancel = jest.fn();
    const onSelect = jest.fn();

    render(
      <TieredChallengeLauncher
        body="Choose your difficulty"
        eyebrow="Challenge"
        onCancel={onCancel}
        onSelect={onSelect}
        tiers={[
          { key: 'easy', meta: 'Friendly start', stars: 1, title: 'Easy' },
          { key: 'hard', meta: 'Full challenge', stars: 2, title: 'Hard' },
        ]}
        title="Set the Clock"
      />,
    );

    fireEvent.press(screen.getByTestId('challenge-tier-hard'));
    fireEvent.press(screen.getByTestId('challenge-launch-cancel-button'));

    expect(onSelect).toHaveBeenCalledWith('hard');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
