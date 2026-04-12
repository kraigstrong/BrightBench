import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ChallengeCountdownOverlay } from '@/components/challenge-countdown-overlay';

describe('ChallengeCountdownOverlay', () => {
  it('renders the countdown value', () => {
    render(<ChallengeCountdownOverlay value={3} />);

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByTestId('challenge-countdown-value')).toBeTruthy();
  });

  it('renders GO for the final step', () => {
    render(<ChallengeCountdownOverlay value="go" />);

    expect(screen.getByText('GO')).toBeTruthy();
  });

  it('renders nothing when hidden', () => {
    render(<ChallengeCountdownOverlay value={null} />);

    expect(screen.queryByTestId('challenge-countdown-value')).toBeNull();
  });
});
