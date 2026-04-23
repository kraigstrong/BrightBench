import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { TieredChallengeLauncher } from '@education/ui';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
  CHALLENGE_DIFFICULTY_META,
} from '@/features/game/challenge-stars';
import { MODE_META } from '@/features/game/mode-meta';
import { ACTIVE_GAME_MODES, DifficultyLevel, GameMode } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const VALID_MODES: GameMode[] = [...ACTIVE_GAME_MODES];

export function generateStaticParams() {
  return VALID_MODES.map((mode) => ({ mode }));
}

export default function PracticeLaunchScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode as GameMode | undefined;
  const { setLastSelectedPracticeDifficulty } = useAppState();

  if (!mode || !VALID_MODES.includes(mode)) {
    return <Redirect href="/modes" />;
  }

  const meta = MODE_META[mode];

  function launchDifficulty(difficultyLevel: DifficultyLevel) {
    setLastSelectedPracticeDifficulty(mode, difficultyLevel);
    router.replace(`/session/${mode}/practice?difficulty=${difficultyLevel}`);
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          animation: 'fade',
          gestureEnabled: true,
          headerShown: false,
          presentation: 'transparentModal',
        }}
      />

      <TieredChallengeLauncher
        body="Choose your difficulty"
        eyebrow="Practice"
        onCancel={() => router.back()}
        onSelect={(key) => launchDifficulty(key as DifficultyLevel)}
        showTierStars={false}
        tiers={CHALLENGE_DIFFICULTIES.map((difficulty) => ({
          key: difficulty,
          meta: CHALLENGE_DIFFICULTY_META[difficulty],
          title: CHALLENGE_DIFFICULTY_LABELS[difficulty],
        }))}
        title={meta.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
