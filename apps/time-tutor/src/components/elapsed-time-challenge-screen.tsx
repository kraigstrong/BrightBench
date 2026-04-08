import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { palette, shadows, typography } from '@/design/theme';
import {
  createInitialElapsedDuration,
  formatTimeValue,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import type {
  ElapsedDurationValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];
type RunStatus = 'finished' | 'ready' | 'running';
type FeedbackToast = 'error' | null;

type Props = {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_ADVANCE_DELAY_MS = 700;
const ERROR_FLASH_DURATION_MS = 550;

export function ElapsedTimeChallengeScreen({
  practiceInterval,
  timeFormat,
}: Props) {
  const { width } = useWindowDimensions();
  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactInput = !isTablet;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);

  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [promptPair, setPromptPair] = useState<PromptPair | null>(null);
  const [answer, setAnswer] = useState<ElapsedDurationValue>(() =>
    createInitialElapsedDuration(),
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSuccessOverlay = isAdvancing && feedbackToast === null;

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (runStatus !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          setRunStatus('finished');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [runStatus]);

  useEffect(() => {
    if (runStatus === 'finished') {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedbackToast(null);
      setIsAdvancing(false);
    }
  }, [runStatus]);

  const loadPrompt = useCallback((nextPrompt: PromptPair) => {
    setPromptPair(nextPrompt);
    setAnswer(createInitialElapsedDuration());
  }, []);

  const startRun = useCallback(() => {
    const nextPrompt = randomElapsedTimePairForInterval(practiceInterval);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    loadPrompt(nextPrompt);
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('running');
  }, [loadPrompt, practiceInterval]);

  const handlePlayAgain = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setPromptPair(null);
    setAnswer(createInitialElapsedDuration());
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('ready');
  }, []);

  function checkAnswer() {
    if (runStatus !== 'running' || !promptPair || isAdvancing) {
      return;
    }

    const isCorrect = isElapsedDurationCorrect(answer, promptPair[0], promptPair[1]);

    if (isCorrect) {
      const nextPrompt = nextElapsedTimePairForInterval(
        promptPair,
        practiceInterval,
      );

      setScore((current) => current + 1);
      setFeedbackToast(null);
      setIsAdvancing(true);

      feedbackTimerRef.current = setTimeout(() => {
        loadPrompt(nextPrompt);
        setIsAdvancing(false);
        feedbackTimerRef.current = null;
      }, SUCCESS_ADVANCE_DELAY_MS);

      return;
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setFeedbackToast('error');

    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackToast(null);
      feedbackTimerRef.current = null;
    }, ERROR_FLASH_DURATION_MS);
  }

  function renderPromptTime(value: TimeValue, testID: string) {
    const formatted = formatTimeValue(value, {
      includeMeridiem: timeFormat === '12-hour',
      timeFormat,
    });

    if (timeFormat === '12-hour') {
      const [mainTime, meridiem] = formatted.split(' ');

      return (
        <View style={styles.promptTimeInlineRow} testID={testID}>
          <Text numberOfLines={1} style={styles.promptTimeMain}>
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
    <AppShell maxWidth={contentMaxWidth} scrollEnabled={!isAdvancing}>
      <HeaderBar
        title="Challenge Mode"
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.challengeLayout}>
        <View style={styles.challengeColumn}>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Time left</Text>
              <Text style={styles.statValue} testID="challenge-time-remaining">
                {formatCountdown(timeRemaining)}
              </Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue} testID="challenge-score">
                {score}
              </Text>
            </View>
          </View>

          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>How much time passes?</Text>
            <View style={styles.promptContentArea}>
              {promptPair ? (
                <View style={styles.promptTimesRow}>
                  <View style={styles.promptTimeCard}>
                    <Text style={styles.promptTimeEyebrow}>Start</Text>
                    {renderPromptTime(promptPair[0], 'elapsed-challenge-start-time')}
                  </View>
                  <View style={styles.connectorPill}>
                    <Text style={styles.connectorText}>to</Text>
                  </View>
                  <View style={styles.promptTimeCard}>
                    <Text style={styles.promptTimeEyebrow}>End</Text>
                    {renderPromptTime(promptPair[1], 'elapsed-challenge-end-time')}
                  </View>
                </View>
              ) : (
                <View style={styles.promptStage}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={startRun}
                    style={[styles.startActionButton, styles.startButton]}
                    testID="challenge-start-button">
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                      Start
                    </Text>
                  </Pressable>
                  <Text style={styles.promptPlaceholder}>
                    Tap Start when you&apos;re ready to begin.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.challengeColumn}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Elapsed time</Text>
            <View style={styles.answerOverlayWrap}>
              <ElapsedDurationInput
                compact={useCompactInput}
                onChange={setAnswer}
                practiceInterval={practiceInterval}
                value={answer}
              />

              {showSuccessOverlay ? <CelebrationOverlay visible /> : null}

              {feedbackToast === 'error' ? (
                <View pointerEvents="none" style={styles.feedbackToastOverlay}>
                  <View style={[styles.feedbackToast, styles.errorToast]}>
                    <Text style={[styles.feedbackToastText, styles.errorToastText]}>
                      Try Again
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </Card>

          {runStatus === 'finished' ? (
            <Card style={styles.summaryCard} testID="challenge-summary">
              <Text style={styles.summaryTitle}>Time&apos;s up!</Text>
              <Text style={styles.summaryBody}>
                You got {score} correct in 1 minute.
              </Text>
              <View style={styles.summaryActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handlePlayAgain}
                  style={[styles.actionButton, styles.primaryButton]}
                  testID="challenge-play-again-button">
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    Play Again
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.back()}
                  style={[styles.actionButton, styles.secondaryButton]}
                  testID="challenge-summary-back-button">
                  <Text style={styles.actionButtonText}>Back</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={runStatus !== 'running' || isAdvancing}
              onPress={checkAnswer}
              style={[
                styles.actionButton,
                styles.primaryButton,
                (runStatus !== 'running' || isAdvancing) &&
                  styles.actionButtonDisabled,
              ]}
              testID="challenge-check-answer-button">
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Check Answer
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </AppShell>
  );
}

function formatCountdown(timeRemaining: number): string {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  challengeLayout: {
    gap: 12,
  },
  challengeColumn: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadows.card,
  },
  statLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
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
  promptContentArea: {
    justifyContent: 'center',
    minHeight: 120,
  },
  promptStage: {
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
    minHeight: 120,
  },
  promptPlaceholder: {
    alignSelf: 'center',
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    lineHeight: 26,
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
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  promptTimeSuffix: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  promptTimeValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  connectorPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  connectorText: {
    color: palette.white,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  answerCard: {
    alignItems: 'center',
    gap: 16,
  },
  answerOverlayWrap: {
    position: 'relative',
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
  feedbackToastOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  feedbackToast: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorToast: {
    backgroundColor: '#FBEAEC',
    borderColor: palette.danger,
  },
  feedbackToastText: {
    fontFamily: typography.displayFamily,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorToastText: {
    color: palette.danger,
  },
  summaryCard: {
    gap: 12,
  },
  summaryTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryBody: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  startActionButton: {
    alignItems: 'center',
    backgroundColor: palette.success,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 96,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  startButton: {
    shadowColor: palette.coral,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    zIndex: 40,
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
