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
  // Single coordinate system:
  // - `x = 0` is the start of the line (not the padded container)
  // - everything (ticks, labels, marker) positions itself off that one origin
  const MARKER_RADIUS = 10;
  const TICK_WIDTH = 2;
  const LINE_Y = 22;
  const [lineWidth, setLineWidth] = useState(1);

  function ratioToX(ratio: number) {
    return clamp(ratio, 0, 1) * lineWidth;
  }

  function valueToX(value: number) {
    return ratioToX(value / lineMax);
  }

  function updateFromLocation(locationX: number) {
    // `locationX` is relative to the padded touch surface; subtract the padding to get line space.
    const localX = locationX - MARKER_RADIUS;
    const ratio = clamp(localX / lineWidth, 0, 1);
    onChange(ratio * lineMax);
  }

  function handleTouch(event: GestureResponderEvent) {
    updateFromLocation(event.nativeEvent.locationX);
  }

  function handleLayout(_event: LayoutChangeEvent) {
    // Track is measured separately; keep the surface layout handler for future use.
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
        <View style={[styles.touchSurface, { paddingHorizontal: MARKER_RADIUS }]}>
          <View
            onLayout={(event) => setLineWidth(Math.max(event.nativeEvent.layout.width, 1))}
            style={styles.lineRegion}>
            <View style={styles.track} />

            {Array.from({ length: segmentCount + 1 }, (_, index) => {
              const x = ratioToX(index / segmentCount);
              const label = tickLabelForIndex(index, segmentCount, lineMax, difficultyLevel);
              const tickHeight = label ? 22 : 16;

              return (
                <View
                  key={`${segmentCount}-${index}`}
                  style={[
                    styles.tickWrap,
                    { left: x - TICK_WIDTH / 2, top: LINE_Y - tickHeight },
                  ]}>
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
              <View
                style={[
                  styles.targetWrap,
                  { left: valueToX(targetValue) - MARKER_RADIUS, top: LINE_Y - MARKER_RADIUS },
                ]}>
                <View style={styles.targetMarker} />
              </View>
            ) : null}

            <View
              style={[
                styles.markerWrap,
                { left: valueToX(markerValue) - MARKER_RADIUS, top: LINE_Y - MARKER_RADIUS },
              ]}>
              <View style={styles.marker} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  surface: {
    minHeight: 132,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  surfaceDisabled: {
    opacity: 0.96,
  },
  touchSurface: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  lineRegion: {
    width: '100%',
    position: 'relative',
    height: 96,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 22,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: palette.ring,
  },
  tickWrap: {
    position: 'absolute',
    alignItems: 'center',
    width: 0,
    gap: spacing.xs,
  },
  tick: {
    width: 2,
    height: 16,
    backgroundColor: palette.ring,
    borderRadius: radii.pill,
  },
  tickStrong: {
    height: 22,
    backgroundColor: fractionPalette.accentDeep,
  },
  midpointTick: {
    backgroundColor: fractionPalette.accent,
  },
  tickLabel: {
    marginTop: spacing.xl,
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
    alignItems: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: fractionPalette.accentDeep,
    borderWidth: 3,
    borderColor: palette.surface,
    shadowColor: palette.ink,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  targetWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  targetMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#F39A4A',
    backgroundColor: palette.surface,
  },
});
