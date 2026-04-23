import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, AppShell, Card, HeaderBar, ProgressFooter } from '@education/ui';
import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';
import { StatCard } from '@/components/ui/stat-card';
import { fractionPalette, layout } from '@/design/tokens';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
} from '@/features/game/challenge-stars';
import { MODE_META } from '@/features/game/mode-meta';
import { SettingsToggleRow } from '@/features/game/mode-play-scene';
import { ACTIVE_GAME_MODES, GameMode } from '@/features/game/types';
import {
  modeProgressSummary,
  overallAccuracy,
  sessionProgressSummary,
  totalRoundsPlayed,
  useAppState,
} from '@/state/app-state';

export default function SettingsScreen() {
  const { hydrated, progress, settings, updateSettings } = useAppState();
  const modes: GameMode[] = [...ACTIVE_GAME_MODES];
  const challengeProgress = progress.challengeProgress.find;

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title="Settings"
        subtitle="Keep the app simple, calm, and easy to touch."
        leftAction={
          <ActionButton
            compact
            label="Back"
            onPress={() => goBackOrReplace(router, '/modes')}
            variant="secondary"
          />
        }
      />

      <Card style={styles.sectionCard}>
        <Text style={styles.eyebrow}>Experience</Text>
        <Text style={styles.sectionDescription}>
          Choose the calmest setup for this learner and device.
        </Text>
        <SettingsToggleRow
          label="Sound effects"
          value={settings.soundEnabled}
          onChange={(soundEnabled) => updateSettings({ soundEnabled })}
        />
        <SettingsToggleRow
          label="Reduced motion"
          value={settings.reducedMotion}
          onChange={(reducedMotion) => updateSettings({ reducedMotion })}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.eyebrow}>Difficulty</Text>
        <Text style={styles.sectionDescription}>
          Adjust how challenging each new round feels.
        </Text>
        <View style={styles.preferenceButtons}>
          <ActionButton
            description="Friendly first steps with simpler fractions."
            label="Easy"
            variant="selectable"
            selected={settings.difficultyLevel === 'easy'}
            onPress={() => updateSettings({ difficultyLevel: 'easy' })}
          />
          <ActionButton
            description="A balanced mix for regular practice."
            label="Medium"
            variant="selectable"
            selected={settings.difficultyLevel === 'medium'}
            onPress={() => updateSettings({ difficultyLevel: 'medium' })}
          />
          <ActionButton
            description="Harder comparisons and less obvious targets."
            label="Hard"
            variant="selectable"
            selected={settings.difficultyLevel === 'hard'}
            onPress={() => updateSettings({ difficultyLevel: 'hard' })}
          />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.sectionDescription}>
          See how each mode is growing without leaving settings.
        </Text>
        <View style={styles.statsRow}>
          <StatCard label="Rounds played" value={String(totalRoundsPlayed(progress))} />
          <StatCard
            label="Total accuracy"
            value={`${overallAccuracy(progress)}%`}
            accent={fractionPalette.mint}
          />
        </View>
        <View style={styles.progressList}>
          {modes.map((mode) => (
            <Card key={mode} style={styles.progressCard}>
              <Text style={styles.progressTitle}>{MODE_META[mode].title}</Text>
              {mode === 'find' ? (
                <View style={styles.sessionList}>
                  <Card style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>Practice</Text>
                    <ModeProgressSummary summary={sessionProgressSummary(progress, mode, 'practice')} />
                  </Card>
                  <Card style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>1-Minute Challenge</Text>
                    <ProgressFooter
                      items={CHALLENGE_DIFFICULTIES.map((difficulty) => ({
                        key: difficulty,
                        label: CHALLENGE_DIFFICULTY_LABELS[difficulty],
                        stars: challengeProgress.bestStars[difficulty],
                      }))}
                    />
                  </Card>
                </View>
              ) : (
                <ModeProgressSummary summary={modeProgressSummary(progress, mode)} />
              )}
            </Card>
          ))}
        </View>
      </Card>

      <Text style={styles.footerNote}>
        {hydrated ? 'Settings save automatically on this device.' : 'Loading saved settings...'}
      </Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
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
  sectionDescription: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -6,
  },
  preferenceButtons: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  progressList: {
    gap: spacing.sm,
  },
  progressCard: {
    gap: spacing.sm,
  },
  sessionList: {
    gap: spacing.sm,
  },
  sessionCard: {
    gap: spacing.sm,
  },
  progressTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  sessionTitle: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
