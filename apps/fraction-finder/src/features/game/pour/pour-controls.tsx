import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { palette, radii } from '@education/design';
import { typography } from '@education/design/native';
import { PourDirection, PourMessage } from '@/features/game/pour/pour-engine';

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

export function MessageArea({ message }: { message: PourMessage }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.messageArea}>
      <Text
        style={[
          styles.messageTitle,
          message.tone === 'hint' ? styles.messageHint : null,
          message.tone === 'success' ? styles.messageSuccess : null,
        ]}>
        {message.title}
      </Text>
      {message.body ? <Text style={styles.messageBody}>{message.body}</Text> : null}
    </View>
  );
}

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
  messageArea: {
    gap: 2,
    justifyContent: 'center',
    minHeight: 52,
  },
  messageTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    textAlign: 'center',
  },
  messageHint: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  messageSuccess: {
    color: palette.success,
  },
  messageBody: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  hotspot: {
    borderRadius: radii.md,
    position: 'absolute',
  },
});
