import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { Card } from '@/components/ui/card';
import { fractionPalette } from '@/design/tokens';

export function StatCard({
  label,
  value,
  accent = fractionPalette.sky,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: spacing.sm,
  },
  accent: {
    width: 38,
    height: 10,
    borderRadius: radii.pill,
  },
  value: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.ink,
    fontFamily: typography.displayFamily,
  },
  label: {
    fontSize: 15,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
});
