import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ChallengeOptionCard } from '@/components/challenge-option-card';

describe('ChallengeOptionCard', () => {
  it('shows the app store badge in the card corner when disabled', () => {
    render(
      <ChallengeOptionCard
        accentColor="#E49A33"
        description="Answer as many questions as you can in one minute."
        disabled
        onPress={jest.fn()}
        progress={{
          bestStars: {
            easy: 0,
            hard: 0,
            medium: 0,
          },
        }}
        title="1-Minute Challenge"
      />,
    );

    expect(screen.getByTestId('app-store-badge-button')).toBeTruthy();
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
  });
});
