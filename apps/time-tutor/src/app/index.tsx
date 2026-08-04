import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MasteryCrownBadge } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { AppStoreBadgeButton } from '@/components/app-store-badge-button';
import { HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { ModeCard } from '@/components/mode-card';
import { palette, shadows, typography } from '@/design/theme';
import { countMasteredModes, PLAYABLE_MODES } from '@/lib/challenge-progression';
import { useAppState } from '@/state/app-state';
import type { HomeMode, PlayableMode } from '@/types/time';

const modeCards: {
  accentColor: string;
  description: string;
  mode: HomeMode;
  title: string;
}[] = [
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
  {
    accentColor: '#D95D67',
    description: 'Not sure yet? Explore analog and digital time together.',
    mode: 'explore-time',
    title: 'Explore Time',
  },
];

export default function HomeScreen() {
  const { challengeProgress } = useAppState();
  const masteredCount = countMasteredModes(challengeProgress);

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

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/progress')}
        style={styles.progressLink}
        testID="progress-link">
        <MasteryCrownBadge accessibilityLabel="Progress" size={20} />
        <View style={styles.progressLinkCopy}>
          <Text style={styles.progressLinkLabel}>Your Progress</Text>
          <Text style={styles.progressLinkMeta}>
            {masteredCount} of {PLAYABLE_MODES.length} modes mastered
          </Text>
        </View>
        <Text style={styles.progressLinkArrow}>→</Text>
      </Pressable>

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
  progressLink: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.card,
  },
  progressLinkCopy: {
    flex: 1,
    gap: 2,
  },
  progressLinkLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  progressLinkMeta: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  progressLinkArrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  column: {
    gap: 14,
  },
});
