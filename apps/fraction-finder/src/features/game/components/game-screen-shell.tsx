import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette, radii, spacing } from '@education/design';
import { shadows, typography } from '@education/design/native';
import { CelebrationOverlay, FeedbackCallout } from '@education/ui';
import { Card } from '@/components/ui/card';
import { layout } from '@/design/tokens';

type RetryFeedback = {
  body: string;
  detail?: string;
  title: string;
};

type GameScreenShellProps = {
  prompt: string;
  hint: string;
  accent: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  retryFeedback?: RetryFeedback | null;
  celebrationVisible?: boolean;
  /** False shows only the confetti, leaving the play card visible underneath. */
  showSuccessMessage?: boolean;
  successMessage?: string;
  /** Skips confetti and slides; the success message, if shown, appears without animation. */
  reduceMotion?: boolean;
};

export function GameScreenShell({
  prompt,
  hint,
  accent,
  children,
  footer,
  retryFeedback,
  celebrationVisible = false,
  showSuccessMessage = true,
  successMessage = 'Nice work!',
  reduceMotion = false,
}: GameScreenShellProps) {
  const feedbackProgress = useSharedValue(0);
  const [promptHeight, setPromptHeight] = useState(0);

  useEffect(() => {
    const target = retryFeedback ? 1 : 0;
    feedbackProgress.value = reduceMotion ? target : withTiming(target, { duration: 220 });
  }, [retryFeedback, feedbackProgress, reduceMotion]);

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackProgress.value,
    transform: [{ translateY: (1 - feedbackProgress.value) * 10 }],
  }));

  function handlePromptLayout(event: LayoutChangeEvent) {
    setPromptHeight(event.nativeEvent.layout.height);
  }

  return (
    <View style={styles.container}>
      <View onLayout={handlePromptLayout}>
        <Card style={[styles.promptCard, { borderColor: accent }]}>
          <View style={[styles.promptPill, { backgroundColor: accent }]} />
          <Text style={styles.prompt}>{prompt}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </Card>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.retryFeedbackWrap,
          promptHeight
            ? {
                top: Math.max(promptHeight - spacing.md, spacing.sm),
              }
            : null,
          feedbackStyle,
          retryFeedback ? null : styles.retryFeedbackHidden,
        ]}>
        {retryFeedback ? (
          <FeedbackCallout
            body={retryFeedback.body}
            detail={retryFeedback.detail}
            title={retryFeedback.title}
            tone="warning"
          />
        ) : null}
      </Animated.View>

      <View style={styles.playCardWrap}>
        {reduceMotion ? (
          celebrationVisible && showSuccessMessage ? (
            <View pointerEvents="none" style={styles.stillCelebration}>
              <View style={styles.stillMessageCard}>
                <Text style={styles.stillMessageTitle}>{successMessage}</Text>
                <Text style={styles.stillMessageBody}>New challenge coming up</Text>
              </View>
            </View>
          ) : null
        ) : (
          <CelebrationOverlay
            visible={celebrationVisible}
            showMessage={showSuccessMessage}
            title={successMessage}
          />
        )}

        <Card style={styles.playCard}>{children}</Card>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    position: 'relative',
  },
  promptCard: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  promptPill: {
    width: 44,
    height: 8,
    borderRadius: radii.pill,
  },
  prompt: {
    fontSize: 26,
    lineHeight: 32,
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontWeight: '700',
  },
  hint: {
    fontSize: 15,
    lineHeight: 21,
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
  },
  playCardWrap: {
    position: 'relative',
  },
  playCard: {
    gap: spacing.lg,
    minHeight: layout.playSurfaceMinHeight,
  },
  retryFeedbackWrap: {
    left: 0,
    opacity: 0.94,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  retryFeedbackHidden: {
    opacity: 0,
  },
  footer: {
    gap: spacing.sm,
  },
  // Matches CelebrationOverlay's message card, without the confetti or the pop-in.
  stillCelebration: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  stillMessageCard: {
    alignItems: 'center',
    backgroundColor: palette.surfaceOverlay,
    borderColor: palette.gold,
    borderRadius: radii.lg,
    borderWidth: 2,
    maxWidth: 360,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.overlay,
  },
  stillMessageTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 26,
    fontWeight: '700',
  },
  stillMessageBody: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    marginTop: 4,
  },
});
