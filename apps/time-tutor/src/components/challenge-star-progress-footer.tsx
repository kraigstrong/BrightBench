import React from 'react';
import { type ProgressFooterItem, ProgressFooter } from '@education/ui';

import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
} from '@/config/challenge-thresholds';
import type { ChallengeModeProgress } from '@/types/time';

type ChallengeStarProgressFooterProps = {
  progress: ChallengeModeProgress;
};

export function ChallengeStarProgressFooter({
  progress,
}: ChallengeStarProgressFooterProps) {
  const items: ProgressFooterItem[] = CHALLENGE_DIFFICULTIES.map((difficulty) => ({
    key: difficulty,
    label: CHALLENGE_DIFFICULTY_LABELS[difficulty],
    stars: progress.bestStars[difficulty],
  }));

  return <ProgressFooter items={items} />;
}
