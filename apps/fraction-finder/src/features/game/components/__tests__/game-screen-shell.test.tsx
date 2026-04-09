import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { GameScreenShell } from '@/features/game/components/game-screen-shell';

describe('GameScreenShell', () => {
  it('shows celebration and retry feedback when provided', () => {
    render(
      <GameScreenShell
        accent="#E56B5D"
        hint="Look first, then tap."
        prompt="Which picture shows one half?"
        celebrationVisible
        retryFeedback={{
          title: 'Not quite yet',
          body: 'Take another look at how many equal parts are shaded.',
          detail: 'Look for the bar with more filled space.',
        }}
        successMessage="Nice work!">
        <></>
      </GameScreenShell>,
    );

    expect(screen.getByText('Which picture shows one half?')).toBeTruthy();
    expect(screen.getByText('Nice work!')).toBeTruthy();
    expect(screen.getByText('Not quite yet')).toBeTruthy();
    expect(screen.getByText('Take another look at how many equal parts are shaded.')).toBeTruthy();
  });
});
