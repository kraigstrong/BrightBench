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

type ActionButtonVariant = 'primary' | 'secondary' | 'selectable';

type ActionButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  compact?: boolean;
  description?: string;
  label: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  trailingLabel?: string;
  variant?: ActionButtonVariant;
};

export function ActionButton({
  compact = false,
  description,
  disabled,
  label,
  selected = false,
  style,
  trailingLabel,
  variant = 'secondary',
  ...rest
}: ActionButtonProps) {
  const isSelectable = variant === 'selectable';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled ?? undefined,
        selected: selected || undefined,
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        variant === 'primary' ? styles.primary : styles.secondary,
        isSelectable ? styles.selectable : null,
        selected && !isSelectable ? styles.secondarySelected : null,
        selected && isSelectable ? styles.selectableSelected : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
      {...rest}>
      {isSelectable ? (
        <View style={styles.optionRow}>
          <View
            style={[
              styles.optionIndicator,
              selected ? styles.optionIndicatorSelected : null,
            ]}>
            {selected ? <View style={styles.optionIndicatorDot} /> : null}
          </View>
          <View style={styles.optionCopy}>
            <View style={styles.optionTitleRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  styles.leftLabel,
                  selected ? styles.selectableLabelSelected : null,
                ]}>
                {label}
              </Text>
              {trailingLabel ? (
                <View style={styles.trailingBadge}>
                  <Text style={styles.trailingBadgeText}>{trailingLabel}</Text>
                </View>
              ) : null}
            </View>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
        </View>
      ) : (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.9}
          numberOfLines={1}
          style={[
            styles.label,
            compact ? styles.compactLabel : null,
            variant === 'primary' || selected ? styles.primaryLabel : null,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  regular: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderColor: palette.ring,
  },
  primary: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  selectable: {
    alignItems: 'stretch',
    backgroundColor: palette.surfaceMuted,
    borderColor: 'transparent',
    borderWidth: 2,
  },
  secondarySelected: {
    backgroundColor: palette.teal,
    borderColor: palette.ink,
  },
  selectableSelected: {
    backgroundColor: '#FFF4E8',
    borderColor: palette.coral,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  compactLabel: {
    fontSize: 18,
  },
  leftLabel: {
    textAlign: 'left',
  },
  primaryLabel: {
    color: palette.white,
  },
  selectableLabelSelected: {
    color: palette.ink,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionIndicator: {
    alignItems: 'center',
    borderColor: palette.ring,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  optionIndicatorSelected: {
    borderColor: palette.coral,
  },
  optionIndicatorDot: {
    backgroundColor: palette.coral,
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  description: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  trailingBadge: {
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trailingBadgeText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
  },
});
