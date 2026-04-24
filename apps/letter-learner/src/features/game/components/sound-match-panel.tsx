import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton } from '@education/ui';
import { playAudioKey } from '@/features/game/audio/letter-audio';
import { LetterTile } from '@/features/game/components/letter-tile';
import { SoundMatchRound } from '@/features/game/types';

export function SoundMatchPanel({
  accent,
  disabled,
  onSubmit,
  round,
  soundEnabled,
}: {
  accent: string;
  disabled?: boolean;
  onSubmit: (answerValue: string) => void;
  round: SoundMatchRound;
  soundEnabled: boolean;
}) {
  return (
    <View style={styles.column}>
      <ActionButton
        disabled={disabled}
        label="Play Sound"
        onPress={() => playAudioKey(round.audioKey, soundEnabled)}
        variant="primary"
      />
      <Text style={styles.helper}>Pick any letter that can make that sound.</Text>
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
  helper: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
});
