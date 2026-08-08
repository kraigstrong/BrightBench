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
import {
  ACTIVE_GAME_MODES,
  DifficultyLevel,
  isChallengeModeKey,
} from '@/features/game/types';
import { useAppState } from '@/state/app-state';

export function generateStaticParams() {
  return ACTIVE_GAME_MODES.map((mode) => ({ mode }));
}

export default function PracticeLaunchScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode;
  const { setLastSelectedPracticeDifficulty } = useAppState();

  if (!isChallengeModeKey(mode)) {
    return <Redirect href="/modes" />;
  }

  const activeMode = mode;
  const meta = MODE_META[activeMode];

  function launchDifficulty(difficultyLevel: DifficultyLevel) {
    setLastSelectedPracticeDifficulty(activeMode, difficultyLevel);
    router.replace(`/session/${activeMode}/practice?difficulty=${difficultyLevel}`);
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
