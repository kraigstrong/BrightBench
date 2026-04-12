import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';

import { RewardStarGroup } from './reward-star';

export type ProgressFooterMetricItem = {
  key?: string;
  label: string;
  value: string;
};

export type ProgressFooterStarsItem = {
  key?: string;
  label: string;
  maxStars?: number;
  stars: number;
  starSize?: number;
};

export type ProgressFooterItem = ProgressFooterMetricItem | ProgressFooterStarsItem;

type ProgressFooterProps = {
  emptyText?: string;
  items: ProgressFooterItem[];
};

function isStarsItem(item: ProgressFooterItem): item is ProgressFooterStarsItem {
  return 'stars' in item;
}

export function ProgressFooter({ emptyText, items }: ProgressFooterProps) {
  if (!items.length) {
    if (!emptyText) {
      return null;
    }

    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.row}>
      {items.map((item, index) =>
        isStarsItem(item) ? (
          <View
            key={item.key ?? `${item.label}-${index}`}
            style={styles.starsItem}>
            <RewardStarGroup
              maxStars={item.maxStars}
              starSize={item.starSize}
              stars={item.stars}
            />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ) : (
          <View
            key={item.key ?? `${item.label}-${index}`}
            style={styles.metricItem}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ),
      )}
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
  metricItem: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  starsItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  label: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  value: {
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
