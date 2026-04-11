import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { AppStoreBadgeButton } from '@/components/app-store-badge-button';
import { getTimeTutorAppStoreUrl } from '@/lib/site-links';

describe('AppStoreBadgeButton', () => {
  it('opens the Time Tutor App Store page', () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

    render(<AppStoreBadgeButton />);

    fireEvent.press(screen.getByTestId('app-store-badge-button'));

    expect(openUrlSpy).toHaveBeenCalledWith(getTimeTutorAppStoreUrl());

    openUrlSpy.mockRestore();
  });
});
