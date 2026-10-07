import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { ChoiceButton } from '@/components/ui/choice-button';
import { fractionPalette } from '@/design/tokens';
import { FRACTION_BY_ID } from '@/features/game/fractions';
import { FractionBar } from '@/features/game/components/fraction-bar';
import { NumberLine } from '@/features/game/components/number-line';
import { clamp, getFraction } from '@/features/game/math';
import { EstimateRound, LineRound } from '@/features/game/types';

const ESTIMATE_BAR_SLICES = 8;

export function EstimatePanel({
  round,
  onSubmit,
  disabled,
}: {
  round: EstimateRound;
  onSubmit: (input: string) => void;
  disabled: boolean;
}) {
  const filledSlices = clamp(
    Math.round(round.actualValue * ESTIMATE_BAR_SLICES),
    0,
    ESTIMATE_BAR_SLICES
  );

  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        <FractionBar
          connected
          showSegmentDividers={false}
          numerator={filledSlices}
          denominator={ESTIMATE_BAR_SLICES}
          tint={fractionPalette.accent}
        />
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

export function LinePanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: LineRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const [markerValue, setMarkerValue] = useState(0);
  const target = getFraction(round.targetFractionId);

  useEffect(() => {
    setMarkerValue(0);
  }, [round.id]);

  return (
    <View style={styles.modeBody}>
      <NumberLine
        difficultyLevel={round.difficultyLevel}
        lineMax={round.lineMax}
        markerValue={markerValue}
        onChange={(value) => {
          onInteraction();
          setMarkerValue(value);
        }}
        revealTarget={false}
        segmentCount={round.segmentCount}
        targetValue={target.value}
        disabled={disabled}
      />
      <ChoiceButton label="Submit" onPress={() => onSubmit(markerValue)} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  modeBody: {
    width: '100%',
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 260,
  },
  visualStage: {
    width: '100%',
    minHeight: 116,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerStage: {
    width: '100%',
    gap: spacing.sm,
  },
});
