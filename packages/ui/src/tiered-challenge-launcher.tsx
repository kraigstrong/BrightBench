import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@education/design';
import { shadows, typography } from '@education/design/native';

import { Card } from './card';
import { RewardStarGroup } from './reward-star';

export type TieredChallengeLauncherTier = {
  key: string;
  maxStars?: number;
  meta: string;
  /** Omitted when `showTierStars` is false. */
  stars?: number;
  title: string;
};

export type TieredChallengeLauncherProps = {
  body: string;
  cancelLabel?: string;
  eyebrow: string;
  onCancel: () => void;
  onSelect: (key: string) => void;
  /** When false, hides per-tier star groups and scores (e.g. practice difficulty pick). */
  showTierStars?: boolean;
  tiers: TieredChallengeLauncherTier[];
  title: string;
};

export function TieredChallengeLauncher({
  body,
  cancelLabel = 'Not now',
  eyebrow,
  onCancel,
  onSelect,
  showTierStars = true,
  tiers,
  title,
}: TieredChallengeLauncherProps) {
  return (
    <View style={styles.screen}>
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={styles.backdrop}
        testID="challenge-launch-backdrop"
      />

      <View pointerEvents="box-none" style={styles.centerWrap}>
        <Card style={styles.modalCard}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <View style={styles.optionsColumn}>
            {tiers.map((tier) => (
              <Pressable
                key={tier.key}
                accessibilityRole="button"
                onPress={() => onSelect(tier.key)}
                style={[styles.optionButton, !showTierStars && styles.optionButtonNoStars]}
                testID={`challenge-tier-${tier.key}`}>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{tier.title}</Text>
                  <Text style={styles.optionMeta}>{tier.meta}</Text>
                </View>
                {showTierStars ? (
                  <View style={styles.optionProgress}>
                    <RewardStarGroup
                      maxStars={tier.maxStars}
                      starSize={18}
                      stars={tier.stars ?? 0}
                    />
                    <Text style={styles.optionProgressText}>
                      {tier.stars ?? 0} / {tier.maxStars ?? 3}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.cancelButton}
            testID="challenge-launch-cancel-button">
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
          </Pressable>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'rgba(20, 27, 34, 0.3)',
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    gap: 16,
    maxWidth: 460,
    width: '100%',
    ...shadows.card,
  },
  eyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  optionsColumn: {
    gap: 12,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.ring,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionButtonNoStars: {
    justifyContent: 'flex-start',
    minHeight: 72,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  optionMeta: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  optionProgress: {
    alignItems: 'flex-end',
    gap: 4,
  },
  optionProgressText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
});
