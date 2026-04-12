import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import {
  MasteryCrownBadge,
  ProgressFooter,
  RewardStarGroup,
  TieredChallengeLauncher,
} from '@education/ui';

describe('shared reward ui', () => {
  it('renders the mastery crown badge accessibly', () => {
    render(<MasteryCrownBadge />);

    expect(screen.getByLabelText('Mastered')).toBeTruthy();
  });

  it('renders metric and star footer items', () => {
    render(
      <>
        <ProgressFooter
          items={[
            { label: 'Accuracy', value: '80%' },
            { label: 'Rounds', value: '12' },
          ]}
        />
        <ProgressFooter
          items={[
            { label: 'Easy', stars: 1 },
            { label: 'Medium', stars: 2 },
            { label: 'Hard', stars: 3 },
          ]}
        />
      </>,
    );

    expect(screen.getByText('Accuracy')).toBeTruthy();
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('Hard')).toBeTruthy();
  });

  it('renders a reward star group and tier launcher interactions', () => {
    const onCancel = jest.fn();
    const onSelect = jest.fn();

    render(
      <>
        <RewardStarGroup starSize={18} stars={2} />
        <TieredChallengeLauncher
          body="Choose your difficulty"
          eyebrow="Challenge"
          onCancel={onCancel}
          onSelect={onSelect}
          tiers={[
            { key: 'easy', meta: '15 min. intervals', stars: 1, title: 'Easy' },
            { key: 'medium', meta: '5 min. intervals', stars: 2, title: 'Medium' },
            { key: 'hard', meta: '1 min. intervals', stars: 3, title: 'Hard' },
          ]}
          title="Read the Clock"
        />
      </>,
    );

    fireEvent.press(screen.getByTestId('challenge-tier-medium'));
    fireEvent.press(screen.getByTestId('challenge-launch-cancel-button'));

    expect(screen.getByText('Read the Clock')).toBeTruthy();
    expect(onSelect).toHaveBeenCalledWith('medium');
    expect(onCancel).toHaveBeenCalled();
  });
});
