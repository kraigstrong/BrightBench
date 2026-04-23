import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ChoiceButton } from '@/components/ui/choice-button';
import { fractionPalette } from '@/design/tokens';
import { FRACTION_BY_ID } from '@/features/game/fractions';
import { FractionBar } from '@/features/game/components/fraction-bar';
import { FractionContainer } from '@/features/game/components/fraction-container';
import { NumberLine } from '@/features/game/components/number-line';
import { clamp, getFraction } from '@/features/game/math';
import { BuildRound, EstimateRound, LineRound, PourRound } from '@/features/game/types';

const ESTIMATE_BAR_SLICES = 8;

export function BuildPanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: BuildRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const target = FRACTION_BY_ID[round.targetFractionId];
  const [segments, setSegments] = useState<number[]>([]);

  useEffect(() => {
    setSegments([]);
  }, [round.id]);

  function toggle(index: number) {
    onInteraction();
    setSegments((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index].sort()
    );
  }

  return (
    <View style={styles.modeBody}>
      <Text style={styles.helperText}>
        Tap the same kind of sections you see in Find the Fraction to shade {target.numerator} out of{' '}
        {target.denominator} equal parts.
      </Text>
      <View style={styles.visualStage}>
        <FractionBar
          connected
          numerator={target.numerator}
          denominator={target.denominator}
          interactive
          selectedSegments={segments}
          onToggleSegment={toggle}
          tint={fractionPalette.accent}
        />
      </View>
      <ChoiceButton
        label="Submit"
        onPress={() => onSubmit(segments.length)}
        disabled={disabled || segments.length === 0}
      />
    </View>
  );
}

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

export function PourPanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: PourRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const [fill, setFill] = useState(0.12);
  const [trackHeight, setTrackHeight] = useState(1);

  useEffect(() => {
    setFill(0.12);
  }, [round.id]);

  function updateFill(locationY: number) {
    onInteraction();
    const next = clamp(1 - locationY / trackHeight, 0.04, 0.96);
    setFill(next);
  }

  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        <View
          onLayout={(event) => setTrackHeight(event.nativeEvent.layout.height)}
          onMoveShouldSetResponder={() => true}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(event) => updateFill(event.nativeEvent.locationY)}
          onResponderMove={(event) => updateFill(event.nativeEvent.locationY)}
          style={styles.pourSurface}>
          <FractionContainer fillRatio={fill} fillColor={fractionPalette.water} />
        </View>
      </View>
      <ChoiceButton label="Submit" onPress={() => onSubmit(fill)} disabled={disabled} />
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
  helperText: {
    textAlign: 'center',
    color: palette.inkMuted,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: typography.bodyFamily,
  },
  pourSurface: {
    paddingVertical: spacing.sm,
  },
});

