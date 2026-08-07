import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, MasteryCrownBadge, RewardStarGroup } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { BackButton, HeaderBar } from '@/components/header-bar';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
} from '@/config/challenge-thresholds';
import { palette, typography } from '@/design/theme';
import {
  countMasteredModes,
  isChallengeModeMastered,
  PLAYABLE_MODES,
} from '@/lib/challenge-progression';
import { getHomeModeTitle } from '@/lib/time';
import { useAppState } from '@/state/app-state';

export default function ProgressScreen() {
  const { challengeProgress } = useAppState();
  const masteredCount = countMasteredModes(challengeProgress);

  return (
    <AppShell>
      <HeaderBar
        title="Progress"
        subtitle="Your best stars in every mode"
        leftAction={
          <BackButton onPress={() => router.back()} testID="progress-back-button" />
        }
      />

      <Card style={styles.summaryCard}>
        <MasteryCrownBadge
          accessibilityLabel={`${masteredCount} of ${PLAYABLE_MODES.length} modes mastered`}
          size={28}
        />
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryValue} testID="progress-crown-count">
            {masteredCount} / {PLAYABLE_MODES.length}
          </Text>
          <Text style={styles.summaryLabel}>modes mastered</Text>
        </View>
      </Card>

      <Card style={styles.gridCard}>
        <View style={styles.headerRow}>
          <View style={styles.modeLabelColumn} />
          {CHALLENGE_DIFFICULTIES.map((difficulty) => (
            <Text key={difficulty} style={styles.difficultyHeader}>
              {CHALLENGE_DIFFICULTY_LABELS[difficulty]}
            </Text>
          ))}
        </View>

        {PLAYABLE_MODES.map((mode) => {
          const progress = challengeProgress[mode];
          const mastered = isChallengeModeMastered(progress);

          return (
            <View key={mode} style={styles.modeRow} testID={`progress-row-${mode}`}>
              <View style={styles.modeLabelColumn}>
                <Text numberOfLines={2} style={styles.modeLabel}>
                  {getHomeModeTitle(mode)}
                </Text>
                {mastered ? <MasteryCrownBadge size={14} /> : null}
              </View>
              {CHALLENGE_DIFFICULTIES.map((difficulty) => (
                <View key={difficulty} style={styles.starCell}>
                  <RewardStarGroup starSize={15} stars={progress.bestStars[difficulty]} />
                </View>
              ))}
            </View>
          );
        })}
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  summaryCopy: {
    gap: 2,
  },
  summaryValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  gridCard: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeLabelColumn: {
    flex: 1.3,
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
  },
  difficultyHeader: {
    color: palette.inkMuted,
    flex: 1,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  modeRow: {
    alignItems: 'center',
    borderTopColor: palette.ring,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
  },
  modeLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  starCell: {
    alignItems: 'center',
    flex: 1,
  },
});
