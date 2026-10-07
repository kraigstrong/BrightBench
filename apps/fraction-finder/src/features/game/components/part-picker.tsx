import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { fractionPalette } from '@/design/tokens';
import { PART_CHOICES } from '@/features/game/equal-parts';

const ICON_WIDTH = 36;
const ICON_HEIGHT = 14;

type PartPickerProps = {
  /** Draw each choice as a mini bar cut into pieces, or as mini hops along a line. */
  variant: 'bar' | 'hops';
  /** The chosen number of equal parts, or null before the child picks one. */
  value: number | null;
  onChange: (parts: number) => void;
  disabled: boolean;
  /** Names the group for screen readers, e.g. "Cut into". */
  label: string;
  /** Names one choice for screen readers, e.g. "Cut into 4 pieces". */
  choiceLabel: (parts: number) => string;
};

/**
 * One row of picture buttons for splitting a whole into equal parts. Every choice is
 * visible and one tap picks it, so there is nothing to step through.
 */
export function PartPicker({ variant, value, onChange, disabled, label, choiceLabel }: PartPickerProps) {
  return (
    <View accessibilityLabel={label} accessibilityRole="radiogroup" style={styles.row}>
      {PART_CHOICES.map((parts) => {
        const selected = parts === value;
        return (
          <Pressable
            accessibilityLabel={choiceLabel(parts)}
            accessibilityRole="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            key={parts}
            onPress={() => onChange(parts)}
            style={({ pressed }) => [
              styles.choice,
              selected ? styles.choiceSelected : null,
              pressed && !selected ? styles.choicePressed : null,
              disabled && !selected ? styles.choiceDisabled : null,
            ]}>
            {variant === 'bar' ? <MiniBar parts={parts} /> : <MiniHops parts={parts} />}
            <Text style={[styles.choiceLabel, selected ? styles.choiceLabelSelected : null]}>
              {variant === 'bar' ? String(parts) : `1/${parts}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MiniBar({ parts }: { parts: number }) {
  const width = ICON_WIDTH - 2;
  return (
    <Svg width={ICON_WIDTH} height={ICON_HEIGHT}>
      <Rect x={1} y={1} width={width} height={ICON_HEIGHT - 2} rx={3} fill={palette.white} stroke={palette.ink} strokeWidth={1.5} />
      {Array.from({ length: parts - 1 }, (_, index) => {
        const x = 1 + (width * (index + 1)) / parts;
        return <Line key={index} x1={x} y1={1} x2={x} y2={ICON_HEIGHT - 1} stroke={palette.ink} strokeWidth={1.25} />;
      })}
    </Svg>
  );
}

function MiniHops({ parts }: { parts: number }) {
  const left = 1;
  const width = ICON_WIDTH - 2;
  const baseline = ICON_HEIGHT - 2;
  const hop = width / parts;
  const rise = Math.min(9, hop * 0.9);

  return (
    <Svg width={ICON_WIDTH} height={ICON_HEIGHT}>
      <Line x1={left} y1={baseline} x2={left + width} y2={baseline} stroke={palette.ink} strokeWidth={1.5} strokeLinecap="round" />
      {Array.from({ length: parts }, (_, index) => {
        const x0 = left + hop * index;
        const x1 = x0 + hop;
        return (
          <Path
            key={index}
            d={`M ${x0} ${baseline - 1} Q ${(x0 + x1) / 2} ${baseline - 1 - rise * 2} ${x1} ${baseline - 1}`}
            fill="none"
            stroke={fractionPalette.accent}
            strokeWidth={1.5}
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.ring,
    borderRadius: radii.sm,
    borderWidth: 2,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 52,
  },
  choiceSelected: {
    backgroundColor: fractionPalette.mint,
    borderColor: fractionPalette.accent,
  },
  choicePressed: {
    backgroundColor: palette.surfaceMuted,
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  choiceLabelSelected: {
    color: fractionPalette.accent,
  },
});
