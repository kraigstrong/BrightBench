import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@education/design';
import {
  AppShell,
  CompactFeatureCard,
  HeaderBar,
  HeaderBackButton,
  HeaderIconButton,
  MasteryCrownBadge,
  ProgressFooter,
  SettingsCogIcon,
  type ProgressFooterItem,
} from '@education/ui';
import { layout } from '@/design/tokens';
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTY_LABELS,
  isChallengeModeMastered,
} from '@/features/game/challenge-stars';
import { MODE_META } from '@/features/game/mode-meta';
import { ACTIVE_GAME_MODES, GameMode } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const VALID_MODES: GameMode[] = [...ACTIVE_GAME_MODES];

export function generateStaticParams() {
  return VALID_MODES.map((mode) => ({ mode }));
}

export default function ModeDetailScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode as GameMode | undefined;
  const { progress } = useAppState();

  if (!mode || !VALID_MODES.includes(mode)) {
    return <Redirect href="/modes" />;
  }

  const meta = MODE_META[mode];
  const challengeProgress = progress.challengeProgress[mode];
  const challengeFooterItems: ProgressFooterItem[] = CHALLENGE_DIFFICULTIES.map(
    (difficulty) => ({
      key: difficulty,
      label: CHALLENGE_DIFFICULTY_LABELS[difficulty],
      stars: challengeProgress.bestStars[difficulty],
    })
  );

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title={meta.title}
        leftAction={<HeaderBackButton onPress={() => router.back()} />}
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />

      <Text style={styles.subtitle}>Choose how you want to play.</Text>

      <View style={styles.column}>
        <CompactFeatureCard
          accentColor={meta.accent}
          description="Go at your own pace with instant feedback on each answer."
          onPress={() => router.push(`/practice/${mode}`)}
          title="Practice"
        />
        <CompactFeatureCard
          accentColor={meta.accent}
          cornerAdornment={
            isChallengeModeMastered(challengeProgress) ? <MasteryCrownBadge /> : null
          }
          description="Answer as many questions as you can in one minute."
          footer={<ProgressFooter items={challengeFooterItems} />}
          onPress={() => router.push(`/challenge/${mode}`)}
          title="1-Minute Challenge"
          tintColor={meta.surface}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: '#5E6B78',
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
    textAlign: 'center',
  },
  column: {
    gap: spacing.sm,
  },
});
