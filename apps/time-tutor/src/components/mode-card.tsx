import React from 'react';

import { FeatureCard } from '@education/ui';
import { ChallengeMasteryCrown } from '@/components/challenge-mastery-crown';
import { isChallengeModeMastered } from '@/lib/challenge-progression';
import type { ChallengeModeProgress } from '@/types/time';

type ModeCardProps = {
  accentColor: string;
  description: string;
  onPress: () => void;
  progress?: ChallengeModeProgress;
  testID?: string;
  title: string;
};

export function ModeCard({
  accentColor,
  description,
  onPress,
  progress,
  testID,
  title,
}: ModeCardProps) {
  return (
    <FeatureCard
      accentColor={accentColor}
      cornerAdornment={
        progress && isChallengeModeMastered(progress) ? <ChallengeMasteryCrown /> : null
      }
      description={description}
      descriptionNumberOfLines={1}
      onPress={onPress}
      testID={testID}
      title={title}
    />
  );
}
