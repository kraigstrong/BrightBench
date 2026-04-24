import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, AppShell, Card, HeaderBar } from '@education/ui';
import { layout } from '@/design/tokens';
import { SettingsToggleRow } from '@/features/game/mode-play-scene';
import { useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { hydrated, settings, updateSettings } = useAppState();

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
  footerNote: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
