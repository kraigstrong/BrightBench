import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii } from '@education/design';
import { shadows, typography } from '@education/design/native';

type HeaderBarProps = {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function HeaderBar({
  leftAction,
  rightAction,
  subtitle,
  title,
}: HeaderBarProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.row}>
        <View style={styles.sideSlot}>{leftAction}</View>
        <View style={styles.copy}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={styles.title}>
            {title}
          </Text>
        </View>
        <View style={[styles.sideSlot, styles.rightSlot]}>{rightAction}</View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function HeaderBackButton({ onPress, testID }: { onPress: () => void; testID?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.backButton}
      testID={testID}>
      <Text numberOfLines={1} style={styles.backLabel}>
        Back
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 8,
    paddingBottom: 6,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sideSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
    width: 68,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  copy: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: palette.surface,
    borderColor: palette.ring,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadows.card,
  },
  backLabel: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
});
