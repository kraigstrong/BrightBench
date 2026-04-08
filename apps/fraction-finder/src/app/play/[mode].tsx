import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { GameMode } from '@/features/game/types';

const VALID_MODES: GameMode[] = ['find', 'build', 'compare', 'estimate', 'pour'];

export default function PlayModeScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode as GameMode | undefined;

  if (!mode || !VALID_MODES.includes(mode)) {
    return <Redirect href="/modes" />;
  }

  return (
    <AppShell contentStyle={styles.content} maxWidth={layout.maxContentWidth} scroll={false}>
      <ModePlayScene mode={mode} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
