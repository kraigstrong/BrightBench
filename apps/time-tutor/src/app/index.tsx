import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { AppStoreBadgeButton } from '@/components/app-store-badge-button';
import { HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { ModeCard } from '@/components/mode-card';
import { useAppState } from '@/state/app-state';
import type { HomeMode, PlayableMode } from '@/types/time';

const modeCards: {
  accentColor: string;
  description: string;
  mode: HomeMode;
  title: string;
}[] = [
  {
    accentColor: '#D95D67',
    description: 'Explore analog and digital time together.',
    mode: 'explore-time',
    title: 'Explore Time',
  },
  {
    accentColor: '#E49A33',
    description: 'Match the analog clock to a digital time.',
    mode: 'digital-to-analog',
    title: 'Set the Clock',
  },
  {
    accentColor: '#2D8F87',
    description: 'Read the analog clock and enter the time.',
    mode: 'analog-to-digital',
    title: 'Read the Clock',
  },
  {
    accentColor: '#556CD6',
    description: 'Figure out how much time has elapsed.',
    mode: 'elapsed-time',
    title: 'Elapsed Time',
  },
];

export default function HomeScreen() {
  const { challengeProgress } = useAppState();

  return (
    <AppShell>
      {Platform.OS === 'web' ? (
        <View pointerEvents="box-none" style={styles.webAppStoreCta}>
          <AppStoreBadgeButton />
        </View>
      ) : null}

      <HeaderBar
        title="Time Tutor"
        subtitle="Choose a mode"
        rightAction={
          <HeaderSettingsButton onPress={() => router.push('/settings')} />
        }
      />

      <View style={styles.column}>
        {modeCards.map((card) => (
          <ModeCard
            key={card.mode}
            accentColor={card.accentColor}
            description={card.description}
            onPress={() => {
              if (card.mode === 'explore-time') {
                router.push('/explore-time');
                return;
              }

              router.push(`/mode/${card.mode}`);
            }}
            progress={
              card.mode === 'explore-time'
                ? undefined
                : challengeProgress[card.mode as PlayableMode]
            }
            testID={`${card.mode}-card`}
            title={card.title}
          />
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  webAppStoreCta: {
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 20,
  },
  column: {
    gap: 14,
  },
});
