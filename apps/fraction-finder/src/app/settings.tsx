import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.eyebrow}>Preferred visuals</Text>
        <Text style={styles.sectionDescription}>
          Pick which fraction picture style shows up most often.
        </Text>
        <View style={styles.preferenceButtons}>
          <ActionButton
            description="Mix bars and containers together."
            label="Mixed"
            variant="selectable"
            selected={settings.preferredRepresentation === 'mixed'}
            onPress={() => updateSettings({ preferredRepresentation: 'mixed' })}
          />
          <ActionButton
            description="Lean on bar models when possible."
            label="Bars"
            variant="selectable"
            selected={settings.preferredRepresentation === 'bar'}
            onPress={() => updateSettings({ preferredRepresentation: 'bar' })}
          />
          <ActionButton
            description="Favor containers and fill levels."
            label="Containers"
            variant="selectable"
            selected={settings.preferredRepresentation === 'container'}
            onPress={() => updateSettings({ preferredRepresentation: 'container' })}
          />
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
  footerNote: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
