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
import { ChallengeResultsCard } from '@/components/challenge-results-card';
import { DigitalTimeInput } from '@/components/digital-time-input';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import {
  CHALLENGE_DIFFICULTY_LABELS,
  challengeThresholds,
  formatChallengeIntervalLabel,
} from '@/config/challenge-thresholds';
import { palette, shadows, typography } from '@/design/theme';
import {
  calculateChallengeAccuracy,
  calculateChallengeStars,
  getChallengeIntervalForDifficulty,
  isChallengeModeMastered,
  shouldUpdateBestStars,
} from '@/lib/challenge-progression';
import {
  areTimesEqual,
  createInitialAnswer,
  createInitialDigitalAnswer,
  formatTimeValue,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type {
  ChallengeDifficulty,
  DigitalTimeValue,
  ExerciseMode,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type Props = {
  difficulty: ChallengeDifficulty;
  mode: ExerciseMode;
  timeFormat: TimeFormat;
};

type RunStatus = 'finished' | 'ready' | 'running';
type FeedbackToast = 'error' | null;
type ChallengeResultSummary = {
  accuracy: number;
  didUnlockMastery: boolean;
  difficulty: ChallengeDifficulty;
  intervalLabel: string;
  isNewBest: boolean;
  score: number;
};

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_ADVANCE_DELAY_MS = 700;
const ERROR_FLASH_DURATION_MS = 550;

export function TimedChallengeScreen({ difficulty, mode, timeFormat }: Props) {
  const { width } = useWindowDimensions();
  const { challengeProgress, setChallengeBestStars } = useAppState();
  const progress = challengeProgress[mode];
  const currentInterval = getChallengeIntervalForDifficulty(difficulty);
  const thresholds = challengeThresholds[mode][difficulty];

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
  const [attempts, setAttempts] = useState(0);
  const [promptTime, setPromptTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(currentInterval),
  );
  const [analogAnswer, setAnalogAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<DigitalTimeValue>(() =>
    createInitialDigitalAnswer(timeFormat),
  );
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast>(null);
  const [resultSummary, setResultSummary] = useState<ChallengeResultSummary | null>(
    null,
  );
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccessOverlay = isAdvancing && feedbackToast === null;
  const timerProgress =
    runStatus === 'running'
      ? Math.max(0, Math.min(1, timeRemaining / CHALLENGE_DURATION_SECONDS))
      : 1;

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
    if (runStatus !== 'finished' || resultSummary) {
      return;
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setFeedbackToast(null);
    setIsAdvancing(false);

    const accuracy = calculateChallengeAccuracy(score, attempts);
    const earnedStars = calculateChallengeStars(
      { accuracy, score },
      thresholds,
    );
    const previousBest = progress.bestStars[difficulty];
    const nextBest = earnedStars > previousBest ? earnedStars : previousBest;
    const nextProgress = {
      ...progress,
      bestStars: {
        ...progress.bestStars,
        [difficulty]: nextBest,
      },
    };
    const isNewBest = shouldUpdateBestStars(previousBest, earnedStars);
    const didUnlockMastery =
      !isChallengeModeMastered(progress) && isChallengeModeMastered(nextProgress);

    if (isNewBest) {
      setChallengeBestStars(mode, difficulty, earnedStars);
    }

    setResultSummary({
      accuracy,
      didUnlockMastery,
      difficulty,
      intervalLabel: formatChallengeIntervalLabel(currentInterval),
      isNewBest,
      score,
    });
  }, [
    attempts,
    currentInterval,
    difficulty,
    mode,
    progress,
    resultSummary,
    runStatus,
    score,
    setChallengeBestStars,
    thresholds,
  ]);

  const loadPrompt = useCallback(
    (nextPrompt: TimeValue) => {
      setPromptTime(nextPrompt);
      setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
      setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    },
    [timeFormat],
  );

  const startRun = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    loadPrompt(randomTimeValueForInterval(currentInterval));
    setScore(0);
    setAttempts(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setResultSummary(null);
    setRunStatus('running');
  }, [currentInterval, loadPrompt]);

  const resetToReady = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setAnalogAnswer(createInitialAnswer());
    setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    setScore(0);
    setAttempts(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setResultSummary(null);
    setPromptTime(randomTimeValueForInterval(currentInterval));
    setRunStatus('ready');
  }, [currentInterval, timeFormat]);

  const handleAnalogAnswerChange = (value: SetStateAction<TimeValue>) => {
    setAnalogAnswer(value);
  };

  const handleDigitalAnswerChange = (value: DigitalTimeValue) => {
    setDigitalAnswer(value);
  };

  function checkAnswer() {
    if (runStatus !== 'running' || isAdvancing) {
      return;
    }

    const isCorrect =
      mode === 'digital-to-analog'
        ? areTimesEqual(analogAnswer, promptTime, {
            includeMeridiem: false,
          })
        : isDigitalAnswerCorrect(digitalAnswer, promptTime, timeFormat);

    setAttempts((current) => current + 1);

    if (isCorrect) {
      const nextPrompt = nextTimeValueForInterval(promptTime, currentInterval);

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

  const promptLabel =
    mode === 'digital-to-analog' ? 'Match this digital time' : 'Read this analog clock';

  return (
    <AppShell
      maxWidth={contentMaxWidth}
      scrollEnabled={!clockInteractionActive && !isAdvancing && !resultSummary}>
      <HeaderBar
        title="Challenge Mode"
        subtitle={`${CHALLENGE_DIFFICULTY_LABELS[difficulty]} · ${formatChallengeIntervalLabel(
          currentInterval,
        )}`}
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.screenBody}>
        <View style={styles.challengeLayout}>
        <View style={styles.challengeColumn}>
          <View style={styles.timerRail} testID="challenge-timer-bar">
            <View
              style={[styles.timerFill, { width: `${timerProgress * 100}%` }]}
              testID="challenge-timer-bar-fill"
            />
          </View>

          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>{promptLabel}</Text>

            {mode === 'digital-to-analog' ? (
              <View style={styles.promptStage}>
                <Text style={styles.promptTime} testID="challenge-prompt-time">
                  {formatTimeValue(promptTime, {
                    includeMeridiem: false,
                    timeFormat,
                  })}
                </Text>
              </View>
            ) : (
              <View style={styles.promptClockWrap}>
                <AnalogClock size={clockSize} time={promptTime} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.challengeColumn}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Your answer</Text>
            {mode === 'digital-to-analog' ? (
              <View style={styles.answerClockWrap}>
                <AnalogClock
                  interactive={runStatus === 'running' && !isAdvancing}
                  onChange={handleAnalogAnswerChange}
                  onInteractionEnd={() => setClockInteractionActive(false)}
                  onInteractionStart={() => setClockInteractionActive(true)}
                  practiceInterval={currentInterval}
                  size={clockSize}
                  time={analogAnswer}
                />
              </View>
            ) : (
              <View style={styles.answerOverlayWrap}>
                <DigitalTimeInput
                  compact={useCompactDigitalInput}
                  disabled={runStatus !== 'running' || isAdvancing}
                  onChange={handleDigitalAnswerChange}
                  practiceInterval={currentInterval}
                  timeFormat={timeFormat}
                  value={digitalAnswer}
                />
              </View>
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

            {runStatus === 'ready' ? (
              <View pointerEvents="box-none" style={styles.startOverlay}>
                <Pressable
                  accessibilityRole="button"
                  onPress={startRun}
                  style={styles.startActionButton}
                  testID="challenge-start-button">
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    Start
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </Card>

          {runStatus !== 'finished' || !resultSummary ? (
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
          ) : null}
        </View>

        {runStatus === 'finished' && resultSummary ? (
          <View pointerEvents="box-none" style={styles.resultsOverlay}>
            <View style={styles.resultsCardWrap}>
              <ChallengeResultsCard
              accuracy={resultSummary.accuracy}
              accuracyThreshold={thresholds.accuracyThreshold}
              didUnlockMastery={resultSummary.didUnlockMastery}
              difficulty={resultSummary.difficulty}
              intervalLabel={resultSummary.intervalLabel}
              isNewBest={resultSummary.isNewBest}
              onPlayAgain={resetToReady}
              score={resultSummary.score}
              scoreThreshold={thresholds.scoreThreshold}
            />
          </View>
        </View>
        ) : null}
      </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    position: 'relative',
  },
  challengeLayout: {
    gap: 12,
  },
  challengeColumn: {
    gap: 12,
  },
  timerRail: {
    backgroundColor: '#E8EDF3',
    borderRadius: 999,
    height: 14,
    overflow: 'hidden',
    ...shadows.card,
  },
  timerFill: {
    backgroundColor: palette.coral,
    borderRadius: 999,
    height: '100%',
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
  },
  answerCard: {
    gap: 12,
    position: 'relative',
  },
  answerOverlayWrap: {
    position: 'relative',
  },
  answerClockWrap: {
    alignItems: 'center',
    gap: 12,
    minHeight: 320,
    paddingBottom: 6,
    position: 'relative',
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
  startOverlay: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 38,
    zIndex: 25,
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
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  startActionButton: {
    alignItems: 'center',
    backgroundColor: palette.success,
    borderColor: '#3E985B',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 140,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: palette.coral,
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
  resultsOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingVertical: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  resultsCardWrap: {
    maxWidth: 440,
    width: '100%',
  },
});
