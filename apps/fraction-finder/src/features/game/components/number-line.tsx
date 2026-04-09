import React, { useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { fractionPalette } from '@/design/tokens';
import { DifficultyLevel } from '@/features/game/types';

type NumberLineProps = {
  difficultyLevel: DifficultyLevel;
  lineMax: number;
  segmentCount: number;
  markerValue: number;
  targetValue?: number;
  disabled?: boolean;
  revealTarget?: boolean;
  onChange: (value: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function tickLabelForIndex(
  index: number,
  segmentCount: number,
  lineMax: number,
  difficultyLevel: DifficultyLevel
) {
  if (difficultyLevel === 'easy') {
    return ['0', '1/4', '1/2', '3/4', '1'][index] ?? '';
  }

  if (difficultyLevel === 'medium') {
    if (index === 0) {
      return '0';
    }
    if (index === segmentCount) {
      return String(lineMax);
    }
    if (segmentCount % 2 === 0 && index === segmentCount / 2) {
      return '1/2';
    }
    return '';
  }

  if (index === 0) {
    return '0';
  }
  if (index === segmentCount / 2) {
    return '1';
  }
  if (index === segmentCount) {
    return '2';
  }
  return '';
}

export function NumberLine({
  difficultyLevel,
  lineMax,
  segmentCount,
  markerValue,
  targetValue,
  disabled = false,
  revealTarget = false,
  onChange,
}: NumberLineProps) {
  const [trackWidth, setTrackWidth] = useState(1);

  function updateFromLocation(locationX: number) {
    const ratio = clamp(locationX / trackWidth, 0, 1);
    onChange(ratio * lineMax);
  }

  function handleTouch(event: GestureResponderEvent) {
    updateFromLocation(event.nativeEvent.locationX);
  }

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(Math.max(event.nativeEvent.layout.width, 1));
  }

  return (
    <View style={styles.wrapper}>
      <View
        onLayout={handleLayout}
        onMoveShouldSetResponder={() => !disabled}
        onStartShouldSetResponder={() => !disabled}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        style={[styles.surface, disabled ? styles.surfaceDisabled : null]}>
        <View style={styles.track} />
        {Array.from({ length: segmentCount + 1 }, (_, index) => {
          const percent = (index / segmentCount) * 100;
          const label = tickLabelForIndex(index, segmentCount, lineMax, difficultyLevel);

          return (
            <View key={`${segmentCount}-${index}`} style={[styles.tickWrap, { left: `${percent}%` }]}>
              <View
                style={[
                  styles.tick,
                  label ? styles.tickStrong : null,
                  difficultyLevel === 'hard' && index === segmentCount / 2 ? styles.midpointTick : null,
                ]}
              />
              {label ? <Text style={styles.tickLabel}>{label}</Text> : null}
            </View>
          );
        })}

        {revealTarget && typeof targetValue === 'number' ? (
          <View style={[styles.targetWrap, { left: `${(targetValue / lineMax) * 100}%` }]}>
            <View style={styles.targetLine} />
            <View style={styles.targetMarker} />
          </View>
        ) : null}

        <View style={[styles.markerWrap, { left: `${(markerValue / lineMax) * 100}%` }]}>
          <View style={styles.marker} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  surface: {
    minHeight: 148,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  surfaceDisabled: {
    opacity: 0.96,
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.ring,
  },
  tickWrap: {
    position: 'absolute',
    top: spacing.sm,
    alignItems: 'center',
    marginLeft: -1,
    gap: spacing.xs,
  },
  tick: {
    width: 2,
    height: 18,
    backgroundColor: palette.ring,
    borderRadius: radii.pill,
  },
  tickStrong: {
    height: 24,
    backgroundColor: fractionPalette.accentDeep,
  },
  midpointTick: {
    backgroundColor: fractionPalette.accent,
  },
  tickLabel: {
    marginTop: spacing.xxl,
    color: palette.inkMuted,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: typography.bodyFamily,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
  markerWrap: {
    position: 'absolute',
    top: 34,
    marginLeft: -14,
    alignItems: 'center',
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: fractionPalette.accentDeep,
    borderWidth: 4,
    borderColor: palette.white,
    shadowColor: palette.ink,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  targetWrap: {
    position: 'absolute',
    top: 10,
    marginLeft: -12,
    alignItems: 'center',
  },
  targetLine: {
    width: 2,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: '#F39A4A',
  },
  targetMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#F39A4A',
    backgroundColor: palette.surface,
    marginTop: -6,
  },
});
