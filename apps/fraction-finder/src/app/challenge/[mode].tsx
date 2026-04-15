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
import { DifficultyLevel, GameMode } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const VALID_MODES: GameMode[] = ['find'];

export function generateStaticParams() {
  return VALID_MODES.map((mode) => ({ mode }));
}

export default function ChallengeLaunchScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode as GameMode | undefined;
  const { progress, setLastSelectedChallengeDifficulty } = useAppState();

  if (!mode || !VALID_MODES.includes(mode)) {
    return <Redirect href="/modes" />;
  }

  const meta = MODE_META[mode];
  const challengeProgress = progress.challengeProgress.find;

  function launchDifficulty(difficultyLevel: DifficultyLevel) {
    setLastSelectedChallengeDifficulty('find', difficultyLevel);
    router.replace(`/session/${mode}/challenge?difficulty=${difficultyLevel}`);
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
        eyebrow="Challenge"
        onCancel={() => router.back()}
        onSelect={(key) => launchDifficulty(key as DifficultyLevel)}
        tiers={CHALLENGE_DIFFICULTIES.map((difficulty) => ({
          key: difficulty,
          meta: CHALLENGE_DIFFICULTY_META[difficulty],
          stars: challengeProgress.bestStars[difficulty],
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
