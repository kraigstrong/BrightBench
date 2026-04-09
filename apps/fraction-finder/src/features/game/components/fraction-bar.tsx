import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { fractionPalette } from '@/design/tokens';

type FractionBarProps = {
  connected?: boolean;
  numerator: number;
  denominator: number;
  interactive?: boolean;
  selectedSegments?: number[];
  onToggleSegment?: (index: number) => void;
  tint?: string;
};

export function FractionBar({
  connected = false,
  numerator,
  denominator,
  interactive,
  selectedSegments,
  onToggleSegment,
  tint = fractionPalette.accent,
}: FractionBarProps) {
  const activeSegments =
    selectedSegments ?? Array.from({ length: numerator }, (_, index) => index);

  if (connected && !interactive) {
    return (
      <View style={styles.connectedRail}>
        {Array.from({ length: denominator }, (_, index) => {
          const filled = activeSegments.includes(index);

          return (
            <View
              key={index}
              style={[
                styles.connectedSegment,
                filled ? { backgroundColor: tint } : styles.connectedSegmentEmpty,
                index > 0 ? styles.connectedDivider : null,
              ]}
            />
          );
        })}
      </View>
    );
  }

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
  connectedRail: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderColor: palette.ring,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  connectedSegment: {
    flex: 1,
    minHeight: 74,
  },
  connectedSegmentEmpty: {
    backgroundColor: '#FFFFFF',
  },
  connectedDivider: {
    borderLeftColor: palette.ring,
    borderLeftWidth: 1.5,
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
