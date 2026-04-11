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

type FeatureCardProps = Omit<PressableProps, 'children' | 'style'> & {
  accentColor: string;
  badgeLabel?: string;
  cardStyle?: StyleProp<ViewStyle>;
  cornerAdornment?: React.ReactNode;
  description: string;
  descriptionNumberOfLines?: number;
  footer?: React.ReactNode;
  tintColor?: string;
  title: string;
};

export function FeatureCard({
  accentColor,
  badgeLabel,
  cardStyle,
  cornerAdornment,
  description,
  descriptionNumberOfLines,
  disabled = false,
  footer,
  tintColor,
  title,
  ...rest
}: FeatureCardProps) {
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
        {cornerAdornment ? <View style={styles.cornerAdornment}>{cornerAdornment}</View> : null}
        <View
          style={[
            styles.accent,
            { backgroundColor: disabled ? palette.ring : accentColor },
          ]}
        />
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.title, disabled && styles.titleDisabled]}>
            {title}
          </Text>
          {badgeLabel ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text
          numberOfLines={descriptionNumberOfLines}
          style={[styles.description, disabled && styles.descriptionDisabled]}>
          {description}
        </Text>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  accent: {
    borderRadius: radii.pill,
    height: 12,
    marginBottom: spacing.md,
    width: 64,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  titleDisabled: {
    color: palette.inkMuted,
  },
  description: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  descriptionDisabled: {
    color: '#6D7A89',
  },
  footer: {
    marginTop: spacing.md,
  },
  badge: {
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cornerAdornment: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: 1,
  },
  badgeLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
