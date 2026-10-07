import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { CelebrationOverlay } from '@education/ui';
import { GameScreenShell } from '@/features/game/components/game-screen-shell';

jest.mock('@education/ui', () => {
  const actual = jest.requireActual('@education/ui');
  return { ...actual, CelebrationOverlay: jest.fn(actual.CelebrationOverlay) };
});

const celebrationMock = jest.mocked(CelebrationOverlay);

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

  it('shows a still success message and no confetti when motion is reduced', () => {
    celebrationMock.mockClear();
    render(
      <GameScreenShell
        accent="#E56B5D"
        hint="Look first, then tap."
        prompt="Which picture shows one half?"
        celebrationVisible
        reduceMotion
        successMessage="Nice work!">
        <></>
      </GameScreenShell>,
    );

    expect(screen.getByText('Nice work!')).toBeTruthy();
    expect(screen.getByText('New challenge coming up')).toBeTruthy();
    expect(celebrationMock).not.toHaveBeenCalled();
  });

  it('shows nothing extra when motion is reduced and the mode hides the success message', () => {
    celebrationMock.mockClear();
    render(
      <GameScreenShell
        accent="#7086D8"
        hint="Hold the pitcher to pour."
        prompt="Fill to about 1/2."
        celebrationVisible
        reduceMotion
        showSuccessMessage={false}
        successMessage="Nice work!">
        <></>
      </GameScreenShell>,
    );

    expect(screen.queryByText('Nice work!')).toBeNull();
    expect(celebrationMock).not.toHaveBeenCalled();
  });
});
