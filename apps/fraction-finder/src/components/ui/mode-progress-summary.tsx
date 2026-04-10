import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ProgressSummaryData } from '@/state/app-state';

type ModeProgressSummaryProps = {
  summary: ProgressSummaryData;
  emptyText?: string;
};

export function ModeProgressSummary({
  summary,
  emptyText = 'Ready for your first round.',
}: ModeProgressSummaryProps) {
  if (!summary.hasProgress) {
    return <Text style={styles.emptyText}>{summary.emptyText ?? emptyText}</Text>;
  }

  return (
    <View style={styles.row}>
      {summary.metrics.map((metric) => (
        <Metric key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderTopColor: palette.ring,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  metric: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  metricLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  metricValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyText: {
    borderTopColor: palette.ring,
    borderTopWidth: 1,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: spacing.sm,
  },
});
