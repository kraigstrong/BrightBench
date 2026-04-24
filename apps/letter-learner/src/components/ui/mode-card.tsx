import React from 'react';

import { CompactFeatureCard } from '@education/ui';

export function ModeCard({
  title,
  description,
  accent,
  surface,
  cornerAdornment,
  onPress,
}: {
  title: string;
  description: string;
  accent: string;
  surface?: string;
  cornerAdornment?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <CompactFeatureCard
      accentColor={accent}
      cornerAdornment={cornerAdornment}
      description={description}
      onPress={onPress}
      tintColor={surface}
      title={title}
    />
  );
}
