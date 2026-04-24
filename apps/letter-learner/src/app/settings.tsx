import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, AppShell, Card, HeaderBar } from '@education/ui';
import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';
import { layout } from '@/design/tokens';
import { CHALLENGE_DIFFICULTIES, CHALLENGE_DIFFICULTY_LABELS } from '@/features/game/challenge-stars';
import { SettingsToggleRow } from '@/features/game/mode-play-scene';
import { MODE_META } from '@/features/game/mode-meta';
import { ACTIVE_GAME_MODES } from '@/features/game/types';
import { modeProgressSummary, useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { hydrated, progress, settings, updateSettings } = useAppState();

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
          Sound is on by default because Letter Learner uses spoken names and sounds.
        </Text>
        <SettingsToggleRow
          label="Sound effects and letters"
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
        <Text style={styles.eyebrow}>Challenge Stars</Text>
        {ACTIVE_GAME_MODES.map((mode) => (
          <View key={mode} style={styles.modeBlock}>
            <Text style={styles.modeTitle}>{MODE_META[mode].title}</Text>
            <Text style={styles.modeStars}>
              {CHALLENGE_DIFFICULTIES.map(
                (difficulty) =>
                  `${CHALLENGE_DIFFICULTY_LABELS[difficulty]}: ${
                    progress.challengeProgress[mode].bestStars[difficulty]
                  } stars`
              ).join('  ')}
            </Text>
            <ModeProgressSummary summary={modeProgressSummary(progress, mode)} />
          </View>
        ))}
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
  modeBlock: {
    gap: spacing.sm,
  },
  modeTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '800',
  },
  modeStars: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  footerNote: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
