import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { LetterTile } from '@/features/game/components/letter-tile';
import { CasePairRound } from '@/features/game/types';

export function CasePairPanel({
  accent,
  disabled,
  onSubmit,
  round,
}: {
  accent: string;
  disabled?: boolean;
  onSubmit: (answerValue: string) => void;
  round: CasePairRound;
}) {
  return (
    <View style={styles.column}>
      <View style={styles.targetWrap}>
        <Text style={styles.targetLabel}>Match this letter</Text>
        <LetterTile accent={accent} label={round.target.label} selected size="large" />
      </View>
      <View style={styles.grid}>
        {round.options.map((option) => (
          <LetterTile
            key={option.id}
            accent={accent}
            disabled={disabled}
            label={option.label}
            onPress={() => onSubmit(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  targetWrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
});
