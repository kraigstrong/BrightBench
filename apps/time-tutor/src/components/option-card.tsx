import React from 'react';

import { FeatureCard } from '@education/ui';

type OptionCardProps = {
  accentColor: string;
  description: string;
  disabled?: boolean;
  label?: string;
  onPress: () => void;
  testID?: string;
  tintColor?: string;
  title: string;
};

export function OptionCard({
  accentColor,
  description,
  disabled = false,
  label,
  onPress,
  testID,
  tintColor,
  title,
}: OptionCardProps) {
  return (
    <FeatureCard
      accentColor={accentColor}
      badgeLabel={label}
      description={description}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      tintColor={tintColor}
      title={title}
    />
  );
}
