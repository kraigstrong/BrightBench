import React from 'react';

import { CompactFeatureCard } from '@education/ui';
import { ChallengeMasteryCrown } from '@/components/challenge-mastery-crown';
import { ChallengeStarProgressFooter } from '@/components/challenge-star-progress-footer';
import { isChallengeModeMastered } from '@/lib/challenge-progression';
import type { ChallengeModeProgress } from '@/types/time';

type ChallengeOptionCardProps = {
  accentColor: string;
  description: string;
  disabled?: boolean;
  label?: string;
  onPress: () => void;
  progress: ChallengeModeProgress;
  testID?: string;
  tintColor?: string;
  title: string;
};

export function ChallengeOptionCard({
  accentColor,
  description,
  disabled = false,
  label,
  onPress,
  progress,
  testID,
  tintColor,
  title,
}: ChallengeOptionCardProps) {
  return (
    <CompactFeatureCard
      accentColor={accentColor}
      badgeLabel={label}
      cornerAdornment={isChallengeModeMastered(progress) ? <ChallengeMasteryCrown /> : null}
      description={description}
      disabled={disabled}
      footer={<ChallengeStarProgressFooter progress={progress} />}
      onPress={onPress}
      testID={testID}
      tintColor={tintColor}
      title={title}
    />
  );
}
