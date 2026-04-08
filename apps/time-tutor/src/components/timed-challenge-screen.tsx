import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
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
  areTimesEqual,
  createInitialAnswer,
  createInitialDigitalAnswer,
  formatTimeValue,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import type {
  DigitalTimeValue,
  ExerciseMode,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type Props = {
  mode: ExerciseMode;
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

type RunStatus = 'finished' | 'ready' | 'running';
type FeedbackToast = 'error' | null;

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_ADVANCE_DELAY_MS = 700;
const ERROR_FLASH_DURATION_MS = 550;

export function TimedChallengeScreen({
  mode,
  practiceInterval,
  timeFormat,
}: Props) {
  const { width } = useWindowDimensions();
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

  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [promptTime, setPromptTime] = useState<TimeValue | null>(null);
  const [analogAnswer, setAnalogAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<DigitalTimeValue>(() =>
    createInitialDigitalAnswer(timeFormat),
  );
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewClockTime = promptTime ?? createInitialAnswer();
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

  const loadPrompt = useCallback(
    (nextPrompt: TimeValue) => {
      setPromptTime(nextPrompt);
      setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
      setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    },
    [timeFormat],
  );

  const startRun = useCallback(() => {
    const nextPrompt = randomTimeValueForInterval(practiceInterval);

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

    setPromptTime(null);
    setAnalogAnswer(createInitialAnswer());
    setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('ready');
  }, [timeFormat]);

  const handleAnalogAnswerChange = (value: SetStateAction<TimeValue>) => {
    setAnalogAnswer(value);
  };

  const handleDigitalAnswerChange = (value: DigitalTimeValue) => {
    setDigitalAnswer(value);
  };

  function checkAnswer() {
    if (runStatus !== 'running' || !promptTime || isAdvancing) {
      return;
    }

    const isCorrect =
      mode === 'digital-to-analog'
        ? areTimesEqual(analogAnswer, promptTime, {
            includeMeridiem: false,
          })
        : isDigitalAnswerCorrect(digitalAnswer, promptTime, timeFormat);

    if (isCorrect) {
      const nextPrompt = nextTimeValueForInterval(promptTime, practiceInterval);

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

  return (
    <AppShell maxWidth={contentMaxWidth} scrollEnabled={!clockInteractionActive && !isAdvancing}>
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
            {mode === 'digital-to-analog' ? (
              <>
                <Text style={styles.promptLabel}>Match this digital time</Text>
                <View style={styles.promptStage}>
                  {promptTime ? (
                    <Text style={styles.promptTime} testID="challenge-prompt-time">
                      {formatTimeValue(promptTime, {
                        includeMeridiem: false,
                        timeFormat,
                      })}
                    </Text>
                  ) : (
                    <Text style={styles.promptPlaceholder}>
                      Tap Start when you&apos;re ready to begin.
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.promptLabel}>Read this analog clock</Text>
                <View style={styles.promptClockWrap}>
                  <AnalogClock size={clockSize} time={previewClockTime} />
                  {runStatus === 'ready' ? (
                    <View pointerEvents="box-none" style={styles.startOverlay}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={startRun}
                        style={[
                          styles.startActionButton,
                          styles.startButton,
                        ]}
                        testID="challenge-start-button">
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.primaryButtonText,
                          ]}>
                          Start
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.challengeColumn}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Your answer</Text>
            {mode === 'digital-to-analog' ? (
              <View style={styles.answerClockWrap}>
                <View
                  style={[
                    styles.clockStartWrap,
                    { height: clockSize, width: clockSize },
                  ]}>
                  <AnalogClock
                    interactive={runStatus === 'running' && !isAdvancing}
                    onChange={handleAnalogAnswerChange}
                    onInteractionEnd={() => setClockInteractionActive(false)}
                    onInteractionStart={() => setClockInteractionActive(true)}
                    practiceInterval={practiceInterval}
                    size={clockSize}
                    time={analogAnswer}
                  />
                  {runStatus === 'ready' ? (
                    <View pointerEvents="box-none" style={styles.startOverlay}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={startRun}
                        style={[
                          styles.startActionButton,
                          styles.startButton,
                        ]}
                        testID="challenge-start-button">
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.primaryButtonText,
                          ]}>
                          Start
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.clockHelperText}>
                  Tap a hand and drag it around the clock.
                </Text>
              </View>
            ) : (
              <DigitalTimeInput
                compact={useCompactDigitalInput}
                disabled={runStatus !== 'running' || isAdvancing}
                onChange={handleDigitalAnswerChange}
                practiceInterval={practiceInterval}
                timeFormat={timeFormat}
                value={digitalAnswer}
              />
            )}

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
    paddingHorizontal: 22,
    paddingVertical: 16,
    ...shadows.card,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptTime: {
    alignSelf: 'center',
    color: palette.white,
    fontFamily: typography.displayFamily,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    textAlign: 'center',
  },
  promptStage: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    marginTop: 10,
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 8,
    position: 'relative',
  },
  promptPlaceholder: {
    alignSelf: 'center',
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  answerCard: {
    gap: 12,
    position: 'relative',
  },
  answerClockWrap: {
    alignItems: 'center',
    minHeight: 320,
    gap: 12,
    paddingBottom: 6,
    position: 'relative',
  },
  clockStartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockHelperText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    textAlign: 'center',
  },
  cardEyebrow: {
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
  startOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
