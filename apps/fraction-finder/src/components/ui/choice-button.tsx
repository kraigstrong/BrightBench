import React from 'react';

import { ActionButton } from '@education/ui';

type ChoiceButtonProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function ChoiceButton({ label, onPress, selected, disabled }: ChoiceButtonProps) {
  return (
    <ActionButton
      onPress={onPress}
      disabled={disabled}
      label={label}
      selected={selected}
      variant="secondary"
    />
  );
}
