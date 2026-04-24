import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { LetterTile } from '@/features/game/components/letter-tile';
import { LetterMatchRound } from '@/features/game/types';

export function LetterMatchPanel({
  accent,
  disabled,
  onSubmit,
  round,
}: {
  accent: string;
  disabled?: boolean;
  onSubmit: (answerValue: string) => void;
  round: LetterMatchRound;
}) {
  return (
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
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
});
