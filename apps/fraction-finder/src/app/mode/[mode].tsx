import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@education/design';
import {
  AppShell,
  FeatureCard,
  HeaderBar,
  HeaderBackButton,
  HeaderIconButton,
  SettingsCogIcon,
} from '@education/ui';
import { ModeProgressSummary } from '@/components/ui/mode-progress-summary';
import { layout } from '@/design/tokens';
import { MODE_META } from '@/features/game/mode-meta';
import { GameMode } from '@/features/game/types';
import { sessionProgressSummary, useAppState } from '@/state/app-state';

const VALID_MODES: GameMode[] = ['find'];

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

  return (
    <AppShell maxWidth={layout.maxContentWidth}>
      <HeaderBar
        title={meta.title}
        subtitle="Choose how you want to play."
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

      <View style={styles.column}>
        <FeatureCard
          accentColor={meta.accent}
          description="Go at your own pace with instant feedback on each answer."
          footer={
            <ModeProgressSummary summary={sessionProgressSummary(progress, mode, 'practice')} />
          }
          onPress={() => router.push(`/session/${mode}/practice`)}
          title="Practice"
        />
        <FeatureCard
          accentColor={meta.accent}
          description="Answer as many questions as you can in one minute."
          footer={
            <ModeProgressSummary summary={sessionProgressSummary(progress, mode, 'challenge')} />
          }
          onPress={() => router.push(`/session/${mode}/challenge`)}
          title="1-Minute Challenge"
          tintColor={meta.surface}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.sm,
  },
});
