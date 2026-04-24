import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import { AppShell, HeaderBar, HeaderIconButton, MasteryCrownBadge, SettingsCogIcon } from '@education/ui';
import { ModeCard } from '@/components/ui/mode-card';
import { layout } from '@/design/tokens';
import { isChallengeModeMastered } from '@/features/game/challenge-stars';
import { MODE_META } from '@/features/game/mode-meta';
import { ACTIVE_GAME_MODES, GameMode } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

export default function ModesScreen() {
  const modes: GameMode[] = [...ACTIVE_GAME_MODES];
  const { progress } = useAppState();

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title="Letter Learner"
        subtitle="Practice letters, cases, and sounds one skill at a time."
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
            surface={MODE_META[mode].surface}
            cornerAdornment={
              isChallengeModeMastered(progress.challengeProgress[mode]) ? <MasteryCrownBadge /> : null
            }
            onPress={() => router.push(`/mode/${mode}`)}
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
