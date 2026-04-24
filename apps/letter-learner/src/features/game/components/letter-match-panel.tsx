import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { ActionButton } from '@education/ui';
import { playAudioKey } from '@/features/game/audio/letter-audio';
import { LetterTile } from '@/features/game/components/letter-tile';
import { LetterMatchRound } from '@/features/game/types';

export function LetterMatchPanel({
  accent,
  disabled,
  onSubmit,
  round,
  soundEnabled,
}: {
  accent: string;
  disabled?: boolean;
  onSubmit: (answerValue: string) => void;
  round: LetterMatchRound;
  soundEnabled: boolean;
}) {
  return (
    <View style={styles.column}>
      <ActionButton
        disabled={disabled}
        label="Play clue"
        onPress={() => playAudioKey(round.instructionAudioKey, soundEnabled)}
        variant="primary"
      />
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
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
});
