import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@education/ui';

import { ChallengeStarGroup } from '@/components/challenge-star-group';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
  formatChallengeLaunchIntervalLabel,
} from '@/config/challenge-thresholds';
import { palette, shadows, typography } from '@/design/theme';
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
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          animation: 'fade',
          gestureEnabled: true,
          headerShown: false,
          presentation: 'transparentModal',
        }}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backdrop}
        testID="challenge-launch-backdrop"
      />

      <View pointerEvents="box-none" style={styles.centerWrap}>
        <Card style={styles.modalCard}>
          <Text style={styles.eyebrow}>Challenge</Text>
          <Text style={styles.title}>{getHomeModeTitle(mode)}</Text>
          <Text style={styles.body}>Choose your difficulty</Text>

          <View style={styles.optionsColumn}>
            {CHALLENGE_DIFFICULTIES.map((difficulty) => (
              <Pressable
                key={difficulty}
                accessibilityRole="button"
                onPress={() => launchDifficulty(difficulty)}
                style={styles.optionButton}
                testID={`challenge-difficulty-${difficulty}`}>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>
                    {CHALLENGE_DIFFICULTY_LABELS[difficulty]}
                  </Text>
                  <Text style={styles.optionMeta}>
                    {formatChallengeLaunchIntervalLabel(
                      getChallengeIntervalForDifficulty(difficulty),
                    )}
                  </Text>
                </View>
                <View style={styles.optionProgress}>
                  <ChallengeStarGroup starSize={18} stars={progress.bestStars[difficulty]} />
                  <Text style={styles.optionProgressText}>
                    {progress.bestStars[difficulty]} / 3
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.cancelButton}
            testID="challenge-launch-cancel-button">
            <Text style={styles.cancelButtonText}>Not now</Text>
          </Pressable>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'rgba(20, 27, 34, 0.3)',
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    gap: 16,
    maxWidth: 460,
    width: '100%',
    ...shadows.card,
  },
  eyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  optionsColumn: {
    gap: 12,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.ring,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  optionMeta: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  optionProgress: {
    alignItems: 'flex-end',
    gap: 4,
  },
  optionProgressText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
});
