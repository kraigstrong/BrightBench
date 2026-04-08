import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, AppShell, Card, HeaderBar } from '@education/ui';
import { layout } from '@/design/tokens';
import { FRACTION_BY_ID } from '@/features/game/fractions';
import { MODE_META } from '@/features/game/mode-meta';
import { useAppState } from '@/state/app-state';

export default function ResultsScreen() {
  const { lastResult } = useAppState();

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title="Latest Result"
        subtitle="A quick recap before the next round."
        leftAction={
          <Link href="/modes" asChild>
            <ActionButton compact label="Back" variant="secondary" />
          </Link>
        }
      />

      <Card style={styles.card}>
        <Text style={styles.eyebrow}>Most recent round</Text>
        {lastResult ? (
          <>
            <Text style={styles.title}>{lastResult.feedbackKey}</Text>
            <Text style={styles.meta}>
              {MODE_META[lastResult.mode].title} · Target {FRACTION_BY_ID[lastResult.targetFractionId].label}
            </Text>
          </>
        ) : (
          <Text style={styles.body}>Play a round and your newest feedback will show here.</Text>
        )}

        <View style={styles.actions}>
          <Link href="/modes" asChild>
            <ActionButton label="Back to modes" variant="primary" />
          </Link>
          <Link href="/progress" asChild>
            <ActionButton label="View progress" variant="secondary" />
          </Link>
        </View>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  eyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.ink,
    fontFamily: typography.displayFamily,
  },
  body: {
    fontSize: 19,
    lineHeight: 28,
    color: palette.ink,
    fontFamily: typography.bodyFamily,
  },
  meta: {
    fontSize: 15,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
  actions: {
    gap: spacing.sm,
  },
});
