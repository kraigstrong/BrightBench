import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { AppShell, HeaderBar, HeaderIconButton, SettingsCogIcon } from '@education/ui';
import { ModeCard } from '@/components/ui/mode-card';
import { layout } from '@/design/tokens';
import { MODE_META } from '@/features/game/mode-meta';
import { GameMode } from '@/features/game/types';

export default function ModesScreen() {
  const modes: GameMode[] = ['find', 'build', 'estimate', 'line', 'pour', 'compare'];

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title="Choose a Mode"
        subtitle="Each mode focuses on one fraction skill at a time."
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />
      <View style={styles.list}>
        {modes.map((mode) => (
          <ModeCard
            key={mode}
            title={MODE_META[mode].title}
            description={MODE_META[mode].description}
            accent={MODE_META[mode].accent}
            onPress={() => router.push(`/play/${mode}`)}
          />
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
