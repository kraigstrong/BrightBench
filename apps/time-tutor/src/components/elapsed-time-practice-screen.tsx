import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { CelebrationOverlay, Card } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { palette, shadows, typography } from '@/design/theme';
import {
  createInitialElapsedDuration,
  elapsedMinutesToDuration,
  formatTimeValue,
  getElapsedMinutes,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import type {
  ElapsedDurationValue,
  PracticeInterval,
  SubmissionResult,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];
type ElapsedResult = SubmissionResult<ElapsedDurationValue, ElapsedDurationValue>;

type Props = {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

export function ElapsedTimePracticeScreen({
  practiceInterval,
  timeFormat,
}: Props) {
  const { width } = useWindowDimensions();
  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const useCompactInput = !isTablet;
  const [promptPair, setPromptPair] = useState<PromptPair>(() =>
    randomElapsedTimePairForInterval(practiceInterval),
  );
  const [answer, setAnswer] = useState<ElapsedDurationValue>(() =>
    createInitialElapsedDuration(),
  );
  const [result, setResult] = useState<ElapsedResult | null>(null);

  useEffect(() => {
    setPromptPair(randomElapsedTimePairForInterval(practiceInterval));
    setAnswer(createInitialElapsedDuration());
    setResult(null);
  }, [practiceInterval]);

  const goToNextPrompt = useCallback(() => {
    setPromptPair((current) =>
      nextElapsedTimePairForInterval(current, practiceInterval),
    );
    setAnswer(createInitialElapsedDuration());
    setResult(null);
  }, [practiceInterval]);

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
    const [startTime, endTime] = promptPair;
    const isCorrect = isElapsedDurationCorrect(answer, startTime, endTime);
    const expectedDuration = elapsedMinutesToDuration(
      getElapsedMinutes(startTime, endTime),
    );

    setResult({
      actual: answer,
      expected: expectedDuration,
      isCorrect,
    });
  }

  function formatPromptTime(value: TimeValue): string {
    return formatTimeValue(value, {
      includeMeridiem: timeFormat === '12-hour',
      timeFormat,
    });
  }

  function renderPromptTime(value: TimeValue, testID: string) {
    const formatted = formatPromptTime(value);

    if (timeFormat === '12-hour') {
      const [mainTime, meridiem] = formatted.split(' ');

      return (
        <View style={styles.promptTimeInlineRow} testID={testID}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            style={styles.promptTimeMain}>
            {mainTime}
          </Text>
          <Text numberOfLines={1} style={styles.promptTimeSuffix}>
            {meridiem}
          </Text>
        </View>
      );
    }

    return (
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={styles.promptTimeValue}
        testID={testID}>
        {formatted}
      </Text>
    );
  }

  return (
    <AppShell maxWidth={contentMaxWidth}>
      <HeaderBar
        title="Elapsed Time"
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.layout}>
        <View style={styles.column}>
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>How much time passes?</Text>
            <View style={styles.promptTimesRow}>
              <View style={styles.promptTimeCard}>
                <Text style={styles.promptTimeEyebrow}>Start</Text>
                {renderPromptTime(promptPair[0], 'elapsed-start-time')}
              </View>
              <View style={styles.connectorPill}>
                <Text style={styles.connectorText}>to</Text>
              </View>
              <View style={styles.promptTimeCard}>
                <Text style={styles.promptTimeEyebrow}>End</Text>
                {renderPromptTime(promptPair[1], 'elapsed-end-time')}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.column}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Elapsed time</Text>
            <View style={styles.answerOverlayWrap}>
              <ElapsedDurationInput
                compact={useCompactInput}
                onChange={(value) => {
                  setResult(null);
                  setAnswer(value);
                }}
                practiceInterval={practiceInterval}
                value={answer}
              />

              <CelebrationOverlay
                title="Nice work!"
                visible={Boolean(result?.isCorrect)}
              />

              {result && !result.isCorrect ? (
                <View pointerEvents="none" style={styles.feedbackOverlay}>
                  <View
                    style={styles.feedbackToast}
                    testID="elapsed-wrong-answer-overlay">
                    <Text style={styles.feedbackToastTitle}>Try again</Text>
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
              testID="elapsed-check-answer-button">
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
              testID="elapsed-next-time-button">
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
  layout: {
    gap: 16,
  },
  column: {
    gap: 16,
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    gap: 18,
    padding: 22,
    ...shadows.card,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptTimesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  promptTimeCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  promptTimeEyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  promptTimeInlineRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 4,
  },
  promptTimeMain: {
    color: palette.ink,
    flexShrink: 1,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  promptTimeSuffix: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  promptTimeValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  connectorPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  connectorText: {
    color: palette.white,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: typography.displayFamily,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
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
