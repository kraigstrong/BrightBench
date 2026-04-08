import React from 'react';

import { FeatureCard } from '@education/ui';

export function ModeCard({
  title,
  description,
  accent,
  onPress,
}: {
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <FeatureCard accentColor={accent} description={description} onPress={onPress} title={title} />
  );
}
