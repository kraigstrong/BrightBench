import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { ChoiceButton } from '@/components/ui/choice-button';
import { FRACTION_BY_ID } from '@/features/game/fractions';
import { FractionBar } from '@/features/game/components/fraction-bar';
import { FindRound } from '@/features/game/types';

type FindRoundPanelProps = {
  disabled: boolean;
  onSubmit: (input: string) => void;
  round: FindRound;
};

export function FindRoundPanel({
  disabled,
  onSubmit,
  round,
}: FindRoundPanelProps) {
  const target = FRACTION_BY_ID[round.targetFractionId];

  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        <FractionBar connected numerator={target.numerator} denominator={target.denominator} />
      </View>
      <View style={styles.answerStage}>
        {round.options.map((optionId) => (
          <ChoiceButton
            key={optionId}
            disabled={disabled}
            label={FRACTION_BY_ID[optionId].label}
            onPress={() => onSubmit(optionId)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modeBody: {
    alignItems: 'center',
    gap: spacing.lg,
    justifyContent: 'flex-start',
    minHeight: 260,
    width: '100%',
  },
  visualStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 116,
    width: '100%',
  },
  answerStage: {
    gap: spacing.sm,
    width: '100%',
  },
});
