import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { ChallengeOptionCard } from '@/components/challenge-option-card';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { OptionCard } from '@/components/option-card';
import { palette, typography } from '@/design/theme';
import { getFeatureAvailability } from '@/lib/feature-availability';
import { getHomeModeTitle } from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type { PlayableMode, SessionType } from '@/types/time';

function getModeAccentColor(mode: PlayableMode): string {
  switch (mode) {
    case 'digital-to-analog':
      return '#E49A33';
    case 'analog-to-digital':
      return '#2D8F87';
    case 'elapsed-time':
      return '#556CD6';
    default:
      return palette.coral;
  }
}

function getModeTintColor(mode: PlayableMode): string {
  switch (mode) {
    case 'digital-to-analog':
      return '#FFF6E8';
    case 'analog-to-digital':
      return '#EFF9F5';
    case 'elapsed-time':
      return '#F1F4FF';
    default:
      return '#FFF7E7';
  }
}

export default function ModeScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = (params.mode ?? 'digital-to-analog') as PlayableMode;
  const { challengeProgress } = useAppState();
  const challengeAvailability = getFeatureAvailability('challenge-mode');
  const accentColor = getModeAccentColor(mode);
  const challengeBackgroundColor = getModeTintColor(mode);

  function goToSession(sessionType: SessionType) {
    if (sessionType === 'challenge' && !challengeAvailability.enabled) {
      return;
    }

    if (sessionType === 'challenge') {
      router.push(`/challenge/${mode}`);
      return;
    }

    router.push(`/session/${mode}/${sessionType}`);
  }

  return (
    <AppShell>
      <HeaderBar
        title={getHomeModeTitle(mode)}
        leftAction={<BackButton onPress={() => router.replace('/')} testID="mode-back-button" />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <Text style={styles.subtitle}>Choose how you want to play.</Text>

      <View style={styles.column}>
        <OptionCard
          accentColor={accentColor}
          description="Go at your own pace with instant feedback on each answer."
          onPress={() => goToSession('practice')}
          testID="practice-session-card"
          title="Practice"
        />

        <ChallengeOptionCard
          accentColor={accentColor}
          description="Answer as many questions as you can in one minute."
          disabled={!challengeAvailability.enabled}
          label={!challengeAvailability.enabled ? 'Mobile only' : undefined}
          onPress={() => goToSession('challenge')}
          progress={challengeProgress[mode]}
          testID="challenge-session-card"
          tintColor={challengeAvailability.enabled ? challengeBackgroundColor : undefined}
          title={challengeAvailability.label}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
    textAlign: 'center',
  },
  column: {
    gap: 14,
  },
});
