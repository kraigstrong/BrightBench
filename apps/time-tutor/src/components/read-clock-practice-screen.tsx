import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { CelebrationOverlay, Card } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { AnalogClock } from '@/components/analog-clock';
import { DigitalTimeInput } from '@/components/digital-time-input';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { palette, shadows, typography } from '@/design/theme';
import {
  createInitialDigitalAnswer,
  formatDigitalTimeValue,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import type {
  DigitalTimeValue,
  PracticeInterval,
  SubmissionResult,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type Props = {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

type PracticeResult = SubmissionResult<TimeValue, DigitalTimeValue>;

export function ReadClockPracticeScreen({
  practiceInterval,
  timeFormat,
}: Props) {
  const { width } = useWindowDimensions();
  const [promptTime, setPromptTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<DigitalTimeValue>(() =>
    createInitialDigitalAnswer(timeFormat),
  );
  const [result, setResult] = useState<PracticeResult | null>(null);

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactDigitalInput = !isTablet;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(
      contentMaxWidth * (isTablet ? 0.48 : 0.78),
      isTablet ? 420 : 340,
    ),
    260,
  );

  useEffect(() => {
    setPromptTime(randomTimeValueForInterval(practiceInterval));
    setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    setResult(null);
  }, [practiceInterval, timeFormat]);

  const goToNextPrompt = useCallback(() => {
    const nextPrompt = nextTimeValueForInterval(promptTime, practiceInterval);

    setPromptTime(nextPrompt);
    setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    setResult(null);
  }, [practiceInterval, promptTime, timeFormat]);

  useEffect(() => {
    if (!result?.isCorrect) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextPrompt();
    }, 1500);

    return () => clearTimeout(timer);
  }, [goToNextPrompt, result]);

  function checkAnswer() {
    const isCorrect = isDigitalAnswerCorrect(digitalAnswer, promptTime, timeFormat);

    setResult({
      actual: digitalAnswer,
      expected: promptTime,
      isCorrect,
    });
  }

  return (
    <AppShell maxWidth={contentMaxWidth}>
      <HeaderBar
        title="Read the Clock"
        subtitle="Practice"
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.practiceLayout}>
        <View style={styles.practiceColumn}>
          <View style={[styles.promptCard, styles.promptCardAnalog]}>
            <Text style={[styles.promptLabel, styles.promptLabelAnalog]}>
              Read this analog clock
            </Text>
            <View style={styles.promptClockWrap}>
              <AnalogClock size={clockSize} time={promptTime} />
            </View>
          </View>
        </View>

        <View style={styles.practiceColumn}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Your answer</Text>
            <View style={styles.answerOverlayWrap}>
              <DigitalTimeInput
                compact={useCompactDigitalInput}
                onChange={(value) => {
                  setResult(null);
                  setDigitalAnswer(value);
                }}
                practiceInterval={practiceInterval}
                timeFormat={timeFormat}
                value={digitalAnswer}
              />

              <CelebrationOverlay
                title="Nice work!"
                visible={Boolean(result?.isCorrect)}
              />

              {result && !result.isCorrect ? (
                <View style={styles.feedbackOverlay}>
                  <View
                    style={styles.feedbackToast}
                    testID="practice-wrong-answer-overlay">
                    <View style={styles.feedbackCopy}>
                      <Text style={styles.feedbackToastTitle}>Try again</Text>
                      <Text style={styles.feedbackToastText}>
                        {`You entered ${formatDigitalTimeValue(
                          result.actual,
                          timeFormat,
                        )}`}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setResult(null)}
                      style={styles.feedbackDismissButton}
                      testID="practice-dismiss-feedback-button">
                      <Text style={styles.feedbackDismissText}>Dismiss</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          </Card>

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={Boolean(result?.isCorrect)}
              onPress={checkAnswer}
              style={[
                styles.actionButton,
                styles.primaryButton,
                result?.isCorrect && styles.actionButtonDisabled,
              ]}
              testID="check-answer-button">
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Check Answer
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={Boolean(result?.isCorrect)}
              onPress={goToNextPrompt}
              style={[
                styles.actionButton,
                styles.secondaryButton,
                result?.isCorrect && styles.actionButtonDisabled,
              ]}
              testID="next-time-button">
              <Text style={styles.actionButtonText}>
                {result?.isCorrect ? 'Loading next time...' : 'Next Time'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  practiceLayout: {
    gap: 16,
  },
  practiceColumn: {
    gap: 16,
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    padding: 22,
    ...shadows.card,
  },
  promptCardAnalog: {
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptLabelAnalog: {
    marginTop: 4,
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: Platform.OS === 'web' ? 8 : 0,
  },
  answerCard: {
    alignItems: 'center',
    gap: 16,
  },
  cardEyebrow: {
    alignSelf: 'stretch',
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  answerOverlayWrap: {
    position: 'relative',
  },
  feedbackOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  feedbackToast: {
    alignItems: 'center',
    backgroundColor: '#FBEAEC',
    borderColor: palette.danger,
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
    maxWidth: '64%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackCopy: {
    alignItems: 'center',
    gap: 2,
  },
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: typography.displayFamily,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackToastText: {
    color: palette.danger,
    flexShrink: 1,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  feedbackDismissButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(182, 71, 87, 0.12)',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 12,
  },
  feedbackDismissText: {
    color: palette.danger,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  secondaryButton: {
    backgroundColor: palette.surfaceMuted,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: palette.white,
  },
});
