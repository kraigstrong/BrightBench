import React from 'react';

import { FeatureCard } from '@education/ui';

type ModeCardProps = {
  accentColor: string;
  description: string;
  onPress: () => void;
  testID?: string;
  title: string;
};

export function ModeCard({
  accentColor,
  description,
  onPress,
  testID,
  title,
}: ModeCardProps) {
  return (
    <FeatureCard
      accentColor={accentColor}
      description={description}
      descriptionNumberOfLines={1}
      onPress={onPress}
      testID={testID}
      title={title}
    />
  );
}
