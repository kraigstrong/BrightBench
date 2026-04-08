import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, AppShell, Card, HeaderBar } from '@education/ui';
import { StatCard } from '@/components/ui/stat-card';
import { fractionPalette, layout } from '@/design/tokens';
import { MODE_META } from '@/features/game/mode-meta';
import { GameMode } from '@/features/game/types';
import { accuracyForMode, useAppState } from '@/state/app-state';

export default function ProgressScreen() {
  const { progress } = useAppState();
  const modes = Object.keys(MODE_META) as GameMode[];

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title="Progress"
        subtitle="Small wins add up when the rounds stay short and clear."
        leftAction={
          <Link href="/modes" asChild>
            <ActionButton compact label="Back" variant="secondary" />
          </Link>
        }
      />

      <View style={styles.statsRow}>
        <StatCard label="Rounds played" value={String(modes.reduce((sum, mode) => sum + progress.modeStats[mode].played, 0))} />
        <StatCard label="Best streak" value={String(Math.max(...modes.map((mode) => progress.modeStats[mode].bestStreak)))} accent={fractionPalette.mint} />
      </View>

      <View style={styles.list}>
        {modes.map((mode) => {
          const stat = progress.modeStats[mode];
          return (
            <Card key={mode} style={styles.modeCard}>
              <Text style={styles.modeTitle}>{MODE_META[mode].title}</Text>
              <Text style={styles.modeMeta}>
                {stat.played} played · {accuracyForMode(progress, mode)}% correct
              </Text>
            </Card>
          );
        })}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  modeCard: {
    gap: spacing.xs,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.ink,
    fontFamily: typography.displayFamily,
  },
  modeMeta: {
    fontSize: 16,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
});
