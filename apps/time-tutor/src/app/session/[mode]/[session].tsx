import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { ElapsedTimeChallengeScreen } from '@/components/elapsed-time-challenge-screen';
import { ElapsedTimePracticeScreen } from '@/components/elapsed-time-practice-screen';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { ReadClockPracticeScreen } from '@/components/read-clock-practice-screen';
import { SetClockPracticeScreen } from '@/components/set-clock-practice-screen';
import { TimedChallengeScreen } from '@/components/timed-challenge-screen';
import { Card } from '@education/ui';
import { palette, typography } from '@/design/theme';
import { getHomeModeTitle } from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type { PlayableMode, SessionType } from '@/types/time';

export default function SessionScreen() {
  const params = useLocalSearchParams<{ mode?: string; session?: string }>();
  const mode = (params.mode ?? 'digital-to-analog') as PlayableMode;
  const session = (params.session ?? 'practice') as SessionType;
  const { practiceInterval, timeFormat } = useAppState();

  if (session === 'practice' && mode === 'digital-to-analog') {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <SetClockPracticeScreen
          practiceInterval={practiceInterval}
          timeFormat={timeFormat}
        />
      </>
    );
  }

  if (session === 'practice' && mode === 'analog-to-digital') {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <ReadClockPracticeScreen
          practiceInterval={practiceInterval}
          timeFormat={timeFormat}
        />
      </>
    );
  }

  if (session === 'practice' && mode === 'elapsed-time') {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <ElapsedTimePracticeScreen
          practiceInterval={practiceInterval}
          timeFormat={timeFormat}
        />
      </>
    );
  }

  if (session === 'challenge' && mode !== 'elapsed-time') {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <TimedChallengeScreen
          mode={mode}
          practiceInterval={practiceInterval}
          timeFormat={timeFormat}
        />
      </>
    );
  }

  if (session === 'challenge' && mode === 'elapsed-time') {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <ElapsedTimeChallengeScreen
          practiceInterval={practiceInterval}
          timeFormat={timeFormat}
        />
      </>
    );
  }

  return (
    <AppShell>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <HeaderBar
        title={getHomeModeTitle(mode)}
        subtitle={session === 'challenge' ? '1-Minute Challenge' : 'Practice'}
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <Card style={styles.card}>
        <Text style={styles.title}>Session placeholder</Text>
        <Text style={styles.body}>
          This is the first migration slice for Time Tutor. The full gameplay
          screen comes next, but the monorepo app now has a real settings and
          mode flow.
        </Text>
        <Text style={styles.meta}>Mode: {getHomeModeTitle(mode)}</Text>
        <Text style={styles.meta}>
          Session: {session === 'challenge' ? 'Challenge' : 'Practice'}
        </Text>
        <Text style={styles.meta}>Interval: {practiceInterval}</Text>
        <Text style={styles.meta}>Time format: {timeFormat}</Text>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    lineHeight: 26,
  },
  meta: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
  },
});
