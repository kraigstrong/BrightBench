import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { GameScreenShell } from '@/features/game/components/game-screen-shell';

describe('GameScreenShell', () => {
  it('shows celebration and feedback controls when provided', () => {
    render(
      <GameScreenShell
        accent="#E56B5D"
        feedback={{
          feedbackKey: 'Try again with the bigger fraction.',
          detailLabel: 'Look for the bar with more filled space.',
          isCorrect: false,
          scoreBand: 'close',
        }}
        hint="Look first, then tap."
        onNextRound={jest.fn()}
        prompt="Which picture shows one half?"
        title="Find the Fraction"
        celebrationVisible
        successMessage="Nice work!">
        <></>
      </GameScreenShell>,
    );

    expect(screen.getByText('Find the Fraction')).toBeTruthy();
    expect(screen.getByText('Which picture shows one half?')).toBeTruthy();
    expect(screen.getByText('Nice work!')).toBeTruthy();
    expect(screen.getByText('Try again with the bigger fraction.')).toBeTruthy();
    expect(screen.getByText('Next round')).toBeTruthy();
  });
});
