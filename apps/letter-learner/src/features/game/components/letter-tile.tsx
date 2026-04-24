import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { shadows, typography } from '@education/design/native';

type LetterTileProps = {
  label: string;
  accent: string;
  disabled?: boolean;
  onPress?: () => void;
  selected?: boolean;
  size?: 'normal' | 'large';
  style?: StyleProp<ViewStyle>;
};

export function LetterTile({
  label,
  accent,
  disabled,
  onPress,
  selected,
  size = 'normal',
  style,
}: LetterTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? undefined, selected: selected || undefined }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        size === 'large' ? styles.large : styles.normal,
        { borderColor: selected ? palette.ink : accent },
        selected ? { backgroundColor: accent } : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}>
      <Text style={[styles.label, size === 'large' ? styles.largeLabel : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 3,
    justifyContent: 'center',
    padding: spacing.sm,
    ...shadows.card,
  },
  normal: {
    minHeight: 92,
    minWidth: 92,
  },
  large: {
    minHeight: 118,
    minWidth: 118,
  },
  label: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 52,
    textAlign: 'center',
  },
  largeLabel: {
    fontSize: 58,
    lineHeight: 66,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
