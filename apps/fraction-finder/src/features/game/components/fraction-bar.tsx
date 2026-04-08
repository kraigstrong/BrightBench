import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { fractionPalette } from '@/design/tokens';

type FractionBarProps = {
  numerator: number;
  denominator: number;
  interactive?: boolean;
  selectedSegments?: number[];
  onToggleSegment?: (index: number) => void;
  tint?: string;
};

export function FractionBar({
  numerator,
  denominator,
  interactive,
  selectedSegments,
  onToggleSegment,
  tint = fractionPalette.accent,
}: FractionBarProps) {
  const activeSegments =
    selectedSegments ?? Array.from({ length: numerator }, (_, index) => index);

  return (
    <View style={styles.row}>
      {Array.from({ length: denominator }, (_, index) => {
        const filled = activeSegments.includes(index);
        const segment = (
          <View
            style={[
              styles.segment,
              filled ? { backgroundColor: tint, borderColor: tint } : styles.segmentEmpty,
            ]}
          />
        );

        if (!interactive) {
          return (
            <View key={index} style={styles.staticSegmentWrap}>
              {segment}
            </View>
          );
        }

        return (
          <Pressable key={index} onPress={() => onToggleSegment?.(index)} style={styles.pressable}>
            {segment}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pressable: {
    flex: 1,
  },
  staticSegmentWrap: {
    flex: 1,
  },
  segment: {
    flex: 1,
    minHeight: 74,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  segmentEmpty: {
    backgroundColor: '#FFFFFF',
    borderColor: palette.ring,
  },
});
