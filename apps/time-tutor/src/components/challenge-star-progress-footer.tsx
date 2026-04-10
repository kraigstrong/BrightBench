import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
} from '@/config/challenge-thresholds';
import { ChallengeStarGroup } from '@/components/challenge-star-group';
import { palette, spacing, typography } from '@/design/theme';
import type { ChallengeModeProgress, ChallengeDifficulty, StarCount } from '@/types/time';

type ChallengeStarProgressFooterProps = {
  progress: ChallengeModeProgress;
};

export function ChallengeStarProgressFooter({
  progress,
}: ChallengeStarProgressFooterProps) {
  return (
    <View style={styles.row}>
      {CHALLENGE_DIFFICULTIES.map((difficulty) => (
        <DifficultyStars
          key={difficulty}
          difficulty={difficulty}
          stars={progress.bestStars[difficulty]}
        />
      ))}
    </View>
  );
}

function DifficultyStars({
  difficulty,
  stars,
}: {
  difficulty: ChallengeDifficulty;
  stars: StarCount;
}) {
  return (
    <View style={styles.group}>
      <ChallengeStarGroup stars={stars} />
      <Text style={styles.label}>{CHALLENGE_DIFFICULTY_LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderTopColor: palette.ring,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  group: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  label: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
