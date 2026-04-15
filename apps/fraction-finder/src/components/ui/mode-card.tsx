import React from 'react';

import { CompactFeatureCard } from '@education/ui';

export function ModeCard({
  title,
  description,
  accent,
  surface,
  onPress,
}: {
  title: string;
  description: string;
  accent: string;
  surface?: string;
  onPress: () => void;
}) {
  return (
    <CompactFeatureCard
      accentColor={accent}
      description={description}
      onPress={onPress}
      tintColor={surface}
      title={title}
    />
  );
}
