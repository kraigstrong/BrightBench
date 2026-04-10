import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';

import { Card } from './card';

type CompactFeatureCardProps = Omit<PressableProps, 'children' | 'style'> & {
  accentColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  description: string;
  footer?: React.ReactNode;
  tintColor?: string;
  title: string;
};

export function CompactFeatureCard({
  accentColor,
  cardStyle,
  description,
  disabled = false,
  footer,
  tintColor,
  title,
  ...rest
}: CompactFeatureCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || undefined }}
      disabled={disabled}
      style={({ pressed }) => [pressed && !disabled ? styles.pressed : null]}
      {...rest}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: disabled ? palette.surfaceMuted : tintColor ?? palette.surface,
            borderColor: disabled ? palette.ring : accentColor,
            opacity: disabled ? 0.7 : 1,
          },
          cardStyle,
        ]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.accent,
              { backgroundColor: disabled ? palette.ring : accentColor },
            ]}
          />
          <View style={styles.copyColumn}>
            <Text numberOfLines={1} style={[styles.title, disabled && styles.titleDisabled]}>
              {title}
            </Text>
            <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
              {description}
            </Text>
          </View>
        </View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 2,
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  accent: {
    borderRadius: radii.pill,
    flexShrink: 0,
    height: 44,
    marginTop: 2,
    width: 14,
  },
  copyColumn: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  titleDisabled: {
    color: palette.inkMuted,
  },
  description: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 21,
  },
  descriptionDisabled: {
    color: '#6D7A89',
  },
  footer: {
    marginTop: 0,
  },
});
