import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { AnalogClock } from '@/components/analog-clock';

describe('AnalogClock', () => {
  const time = {
    hour12: 3 as const,
    meridiem: 'PM' as const,
    minute: 15,
  };

  it('keeps the interaction hint visible when explicitly requested', () => {
    render(
      <AnalogClock
        interactive={false}
        showInteractionHint
        size={280}
        time={time}
      />,
    );

    expect(screen.getByText('Tap a hand and drag it around the clock.')).toBeTruthy();
  });
});
