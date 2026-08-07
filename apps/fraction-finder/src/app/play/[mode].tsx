import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import { getDefaultPracticeDifficulty } from '@/features/game/challenge-stars';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { ACTIVE_GAME_MODES, isChallengeModeKey } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

export function generateStaticParams() {
  return ACTIVE_GAME_MODES.map((mode) => ({ mode }));
}

export default function PlayModeScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode;
  const { progress } = useAppState();

  if (!isChallengeModeKey(mode)) {
    return <Redirect href="/modes" />;
  }

  if (mode === 'find') {
    return <Redirect href="/practice/find" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <AppShell maxWidth={layout.maxContentWidth}>
        <ModePlayScene
          mode={mode}
          difficultyLevel={getDefaultPracticeDifficulty(progress.challengeProgress[mode])}
        />
      </AppShell>
    </>
  );
}
