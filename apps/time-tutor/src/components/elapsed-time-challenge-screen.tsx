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
import { ChallengeResultsCard } from '@/components/challenge-results-card';
import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
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
  createInitialElapsedDuration,
  formatTimeValue,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type {
  ChallengeDifficulty,
  ElapsedDurationValue,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];
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

type Props = {
  difficulty: ChallengeDifficulty;
  timeFormat: TimeFormat;
};

const MODE = 'elapsed-time';
const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_ADVANCE_DELAY_MS = 700;
const ERROR_FLASH_DURATION_MS = 550;

export function ElapsedTimeChallengeScreen({ difficulty, timeFormat }: Props) {
  const { width } = useWindowDimensions();
  const { challengeProgress, setChallengeBestStars } = useAppState();
  const progress = challengeProgress[MODE];
  const currentInterval = getChallengeIntervalForDifficulty(difficulty);
  const thresholds = challengeThresholds[MODE][difficulty];

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactInput = !isTablet;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);

  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [promptPair, setPromptPair] = useState<PromptPair>(() =>
    randomElapsedTimePairForInterval(currentInterval),
  );
  const [answer, setAnswer] = useState<ElapsedDurationValue>(() =>
    createInitialElapsedDuration(),
  );
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
      setChallengeBestStars(MODE, difficulty, earnedStars);
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
    progress,
    resultSummary,
    runStatus,
    score,
    setChallengeBestStars,
    thresholds,
  ]);

  const loadPrompt = useCallback((nextPrompt: PromptPair) => {
    setPromptPair(nextPrompt);
    setAnswer(createInitialElapsedDuration());
  }, []);

  const startRun = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    loadPrompt(randomElapsedTimePairForInterval(currentInterval));
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

    setPromptPair(randomElapsedTimePairForInterval(currentInterval));
    setAnswer(createInitialElapsedDuration());
    setScore(0);
    setAttempts(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setResultSummary(null);
    setRunStatus('ready');
  }, [currentInterval]);

  function checkAnswer() {
    if (runStatus !== 'running' || isAdvancing) {
      return;
    }

    const isCorrect = isElapsedDurationCorrect(answer, promptPair[0], promptPair[1]);

    setAttempts((current) => current + 1);

    if (isCorrect) {
      const nextPrompt = nextElapsedTimePairForInterval(promptPair, currentInterval);

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
    <AppShell
      maxWidth={contentMaxWidth}
      scrollEnabled={!isAdvancing && !resultSummary}>
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
            <Text style={styles.promptLabel}>How much time passes?</Text>
            <View style={styles.promptContentArea}>
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
            </View>
          </View>
        </View>

        <View style={styles.challengeColumn}>
          <Card style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Elapsed time</Text>
            <View style={styles.answerOverlayWrap}>
              <ElapsedDurationInput
                compact={useCompactInput}
                disabled={runStatus !== 'running' || isAdvancing}
                onChange={setAnswer}
                practiceInterval={currentInterval}
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
    position: 'relative',
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
