import React from 'react';

import { HeaderIconButton, SettingsCogIcon } from '@education/ui';

type Props = {
  onPress: () => void;
  testID?: string;
};

export function HeaderSettingsButton({ onPress, testID }: Props) {
  return (
    <HeaderIconButton
      accessibilityLabel="Open settings"
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}>
      <SettingsCogIcon size={24} />
    </HeaderIconButton>
  );
}
