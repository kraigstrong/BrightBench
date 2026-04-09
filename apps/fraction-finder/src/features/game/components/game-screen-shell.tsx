import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
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
  successMessage?: string;
};

export function GameScreenShell({
  prompt,
  hint,
  accent,
  children,
  footer,
  retryFeedback,
  celebrationVisible = false,
  successMessage = 'Nice work!',
}: GameScreenShellProps) {
  const feedbackProgress = useSharedValue(0);
  const [promptHeight, setPromptHeight] = useState(0);

  useEffect(() => {
    feedbackProgress.value = withTiming(retryFeedback ? 1 : 0, { duration: 220 });
  }, [retryFeedback, feedbackProgress]);

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
        <CelebrationOverlay visible={celebrationVisible} title={successMessage} />

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
});
