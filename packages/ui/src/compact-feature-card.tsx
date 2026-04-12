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
  badgeLabel?: string;
  cardStyle?: StyleProp<ViewStyle>;
  description: string;
  descriptionNumberOfLines?: number;
  cornerAdornment?: React.ReactNode;
  footer?: React.ReactNode;
  tintColor?: string;
  title: string;
};

export function CompactFeatureCard({
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
        {cornerAdornment ? <View style={styles.cornerAdornment}>{cornerAdornment}</View> : null}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.accent,
              { backgroundColor: disabled ? palette.ring : accentColor },
            ]}
          />
          <View style={styles.copyColumn}>
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
    position: 'relative',
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
    height: 52,
    marginTop: 2,
    width: 14,
  },
  copyColumn: {
    flex: 1,
    gap: 4,
    minWidth: 0,
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
  cornerAdornment: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: 1,
  },
  badge: {
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 0,
  },
});
