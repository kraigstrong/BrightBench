import React from 'react';

import { FeatureCard } from '@education/ui';
import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';
import { ProgressSummaryData } from '@/state/app-state';

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
  progressSummary?: ProgressSummaryData;
  onPress: () => void;
}) {
  return (
    <FeatureCard
      accentColor={accent}
      description={description}
      descriptionNumberOfLines={2}
      footer={progressSummary ? <ModeProgressSummary summary={progressSummary} /> : undefined}
      onPress={onPress}
      title={title}
    />
  );
}
