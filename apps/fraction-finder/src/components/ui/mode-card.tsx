import React from 'react';

import { FeatureCard } from '@education/ui';
import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';
import { ModeProgressSummaryData } from '@/state/app-state';

export function ModeCard({
  title,
  description,
  accent,
  progressSummary,
  onPress,
}: {
  title: string;
  description: string;
  accent: string;
  progressSummary: ModeProgressSummaryData;
  onPress: () => void;
}) {
  return (
    <FeatureCard
      accentColor={accent}
      description={description}
      descriptionNumberOfLines={2}
      footer={<ModeProgressSummary summary={progressSummary} />}
      onPress={onPress}
      title={title}
    />
  );
}
