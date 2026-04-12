import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';

describe('ModeProgressSummary', () => {
  it('renders summary metrics through the shared progress footer', () => {
    render(
      <ModeProgressSummary
        summary={{
          hasProgress: true,
          metrics: [
            { label: 'Accuracy', value: '75%' },
            { label: 'Best streak', value: '4' },
          ],
        }}
      />,
    );

    expect(screen.getByText('Accuracy')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Best streak')).toBeTruthy();
  });

  it('renders the empty text when no progress exists', () => {
    render(
      <ModeProgressSummary
        summary={{
          emptyText: 'Ready to start.',
          hasProgress: false,
          metrics: [],
        }}
      />,
    );

    expect(screen.getByText('Ready to start.')).toBeTruthy();
  });
});
