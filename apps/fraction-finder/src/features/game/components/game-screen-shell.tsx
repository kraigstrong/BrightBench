import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton, CelebrationOverlay } from '@education/ui';
import { Card } from '@/components/ui/card';
import { fractionPalette, layout } from '@/design/tokens';
import { RoundEvaluation } from '@/features/game/types';

type GameScreenShellProps = {
  title: string;
  prompt: string;
  hint: string;
  accent: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  feedback: RoundEvaluation | null;
  celebrationVisible?: boolean;
  successMessage?: string;
  feedbackLabel?: string;
  onNextRound: () => void;
};

export function GameScreenShell({
  title,
  prompt,
  hint,
  accent,
  children,
  footer,
  feedback,
  celebrationVisible = false,
  successMessage = 'Nice work!',
  feedbackLabel,
  onNextRound,
}: GameScreenShellProps) {
  const feedbackProgress = useSharedValue(0);

  useEffect(() => {
    feedbackProgress.value = withTiming(feedback ? 1 : 0, { duration: 220 });
  }, [feedback, feedbackProgress]);

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackProgress.value,
    transform: [{ translateY: (1 - feedbackProgress.value) * 10 }],
  }));

  return (
    <View style={styles.container}>
      <Card style={[styles.promptCard, { borderColor: accent }]}>
        <View style={[styles.promptPill, { backgroundColor: accent }]} />
        <Text style={styles.eyebrow}>{title}</Text>
        <Text style={styles.prompt}>{prompt}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </Card>

      <View style={styles.playCardWrap}>
        <CelebrationOverlay visible={celebrationVisible} title={successMessage} />

        <Card style={styles.playCard}>{children}</Card>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}

      <Animated.View
        pointerEvents={feedback ? 'auto' : 'none'}
        style={[styles.feedbackWrap, feedbackStyle]}>
        {feedback ? (
          <Card style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>{feedbackLabel ?? 'Nice thinking'}</Text>
            <Text style={styles.feedbackBody}>{feedback.feedbackKey}</Text>
            {feedback.detailLabel ? <Text style={styles.feedbackDetail}>{feedback.detailLabel}</Text> : null}
            <ActionButton
              compact
              label="Next round"
              onPress={onNextRound}
              style={styles.nextButton}
              variant="primary"
            />
          </Card>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  promptCard: {
    gap: spacing.sm,
  },
  promptPill: {
    width: 52,
    height: 10,
    borderRadius: radii.pill,
  },
  eyebrow: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontWeight: '700',
  },
  prompt: {
    fontSize: 32,
    lineHeight: 38,
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontWeight: '700',
  },
  hint: {
    fontSize: 16,
    lineHeight: 22,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
  playCardWrap: {
    position: 'relative',
  },
  playCard: {
    gap: spacing.lg,
    minHeight: layout.playSurfaceMinHeight + 60,
  },
  footer: {
    gap: spacing.sm,
  },
  feedbackWrap: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 16,
  },
  feedbackCard: {
    backgroundColor: palette.surface,
    borderColor: fractionPalette.accentDeep,
    gap: spacing.sm,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.ink,
    fontFamily: typography.displayFamily,
  },
  feedbackBody: {
    fontSize: 18,
    lineHeight: 24,
    color: palette.ink,
    fontFamily: typography.bodyFamily,
  },
  feedbackDetail: {
    fontSize: 16,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
  nextButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
