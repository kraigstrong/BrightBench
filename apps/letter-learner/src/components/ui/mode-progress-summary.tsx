import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { Card } from '@education/ui';
import { ProgressSummaryData } from '@/state/app-state';

export function ModeProgressSummary({ summary }: { summary: ProgressSummaryData }) {
  return (
    <Card style={styles.card}>
      {summary.hasProgress ? (
        <View style={styles.row}>
          {summary.metrics.map((metric) => (
            <View key={metric.label} style={styles.metric}>
              <Text style={styles.value}>{metric.value}</Text>
              <Text style={styles.label}>{metric.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{summary.emptyText ?? 'Ready to begin.'}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  value: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  empty: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
