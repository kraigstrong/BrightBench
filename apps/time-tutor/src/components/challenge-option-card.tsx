import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CompactFeatureCard, MasteryCrownBadge } from '@education/ui';
import { AppStoreBadgeButton } from '@/components/app-store-badge-button';
import { ChallengeStarProgressFooter } from '@/components/challenge-star-progress-footer';
import { isChallengeModeMastered } from '@/lib/challenge-progression';
import type { ChallengeModeProgress } from '@/types/time';

type ChallengeOptionCardProps = {
  accentColor: string;
  description: string;
  disabled?: boolean;
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
  onPress,
  progress,
  testID,
  tintColor,
  title,
}: ChallengeOptionCardProps) {
  const cornerAdornment = !disabled && isChallengeModeMastered(progress) ? (
    <MasteryCrownBadge />
  ) : null;

  return (
    <View style={styles.container}>
      <CompactFeatureCard
        accentColor={accentColor}
        cornerAdornment={cornerAdornment}
        description={description}
        disabled={disabled}
        footer={<ChallengeStarProgressFooter progress={progress} />}
        onPress={onPress}
        testID={testID}
        tintColor={tintColor}
        title={title}
      />
      {disabled ? (
        <View style={styles.badgeOverlay}>
          <AppStoreBadgeButton />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badgeOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
});
