import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { GameMode } from '@/features/game/types';

const VALID_MODES: GameMode[] = ['find', 'build', 'compare', 'estimate', 'pour', 'line'];

export default function PlayModeScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode as GameMode | undefined;

  if (!mode || !VALID_MODES.includes(mode)) {
    return <Redirect href="/modes" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <AppShell maxWidth={layout.maxContentWidth}>
        <ModePlayScene mode={mode} />
      </AppShell>
    </>
  );
}
