import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { TieredChallengeLauncher } from '@education/ui';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
  formatChallengeLaunchIntervalLabel,
} from '@/config/challenge-thresholds';
import { getFeatureAvailability } from '@/lib/feature-availability';
import { getChallengeIntervalForDifficulty } from '@/lib/challenge-progression';
import { getHomeModeTitle } from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type { ChallengeDifficulty, PlayableMode } from '@/types/time';

export default function ChallengeLaunchScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = (params.mode ?? 'digital-to-analog') as PlayableMode;
  const { challengeProgress, setLastSelectedChallengeDifficulty } = useAppState();
  const challengeAvailability = getFeatureAvailability('challenge-mode');
  const progress = challengeProgress[mode];

  useEffect(() => {
    if (!challengeAvailability.enabled) {
      router.replace(`/mode/${mode}`);
    }
  }, [challengeAvailability.enabled, mode]);

  if (!challengeAvailability.enabled) {
    return null;
  }

  function launchDifficulty(difficulty: ChallengeDifficulty) {
    setLastSelectedChallengeDifficulty(mode, difficulty);
    router.replace(`/session/${mode}/challenge?difficulty=${difficulty}`);
  }

  return (
    <View style={{ flex: 1 }}>
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
        onSelect={(key) => launchDifficulty(key as ChallengeDifficulty)}
        tiers={CHALLENGE_DIFFICULTIES.map((difficulty) => ({
          key: difficulty,
          meta: formatChallengeLaunchIntervalLabel(
            getChallengeIntervalForDifficulty(difficulty),
          ),
          stars: progress.bestStars[difficulty],
          title: CHALLENGE_DIFFICULTY_LABELS[difficulty],
        }))}
        title={getHomeModeTitle(mode)}
      />
    </View>
  );
}
