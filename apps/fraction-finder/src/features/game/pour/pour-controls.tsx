import React from 'react';
import { Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { radii } from '@education/design';
import { PourDirection } from '@/features/game/pour/pour-engine';

function noop() {}

/**
 * Props for hold-to-pour controls. Pouring must start the instant a finger lands, and
 * react-native-web otherwise waits 50ms before onPressIn — dropping any tap released
 * sooner unless an onPress handler exists. An onLongPress handler keeps a long touch
 * alive on Android browsers, where the context-menu gesture would otherwise end it.
 */
export const holdPressProps = {
  onPress: noop,
  onLongPress: noop,
  ...(Platform.OS === 'web' ? { delayPressIn: 0 } : { unstable_pressDelay: 0 }),
} as const;

/** An invisible press target laid over part of the SVG stage. */
export function PourHotspot({
  direction,
  disabled,
  label,
  hint,
  onStart,
  onStop,
  style,
}: {
  direction: PourDirection;
  disabled: boolean;
  label: string;
  hint: string;
  onStart: (direction: PourDirection) => void;
  onStop: (direction: PourDirection) => void;
  style: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      {...holdPressProps}
      onPressIn={() => onStart(direction)}
      onPressOut={() => onStop(direction)}
      style={[styles.hotspot, style]}
    />
  );
}

const styles = StyleSheet.create({
  hotspot: {
    borderRadius: radii.md,
    position: 'absolute',
  },
});
