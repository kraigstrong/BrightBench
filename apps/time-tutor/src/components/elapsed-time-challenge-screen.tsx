import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { CelebrationOverlay, Card, ChallengeResultsOverlay } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { ChallengeCountdownOverlay } from '@/components/challenge-countdown-overlay';
import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import {
  CHALLENGE_DIFFICULTY_LABELS,
  challengeThresholds,
  formatChallengeIntervalLabel,
} from '@/config/challenge-thresholds';
import { getDemoChallengeResultOverride } from '@/config/demo-video';
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
  getHomeModeTitle,
  formatTimeValue,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import { useAppState } from '@/state/app-state';
import { useChallengeCountdown } from '@/lib/challenge-countdown';
import type {
  ChallengeDifficulty,
  ElapsedDurationValue,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];
type RunStatus = 'finished' | 'ready' | 'running';
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
const WRONG_ANSWER_ADVANCE_DELAY_MS = 520;
const WRONG_ANSWER_SHAKE_KEYFRAMES = [0, -8, 8, -6, 6, -3, 0] as const;
const WRONG_ANSWER_SHAKE_DURATIONS = [0, 55, 50, 45, 40, 35, 30] as const;
const WRONG_ANSWER_FLASH_OPACITY = 0.5;

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
  const [showWrongAnswerFeedback, setShowWrongAnswerFeedback] = useState(false);
  const [resultSummary, setResultSummary] = useState<ChallengeResultSummary | null>(
    null,
  );
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongAnswerShake = useRef(new Animated.Value(0)).current;
  const wrongAnswerFlashOpacity = useRef(new Animated.Value(0)).current;
  const { countdownValue, startCountdown, clearCountdown } = useChallengeCountdown({
    onComplete: () => {
      loadPrompt(randomElapsedTimePairForInterval(currentInterval));
      setTimeRemaining(CHALLENGE_DURATION_SECONDS);
      setRunStatus('running');
    },
  });

  const showSuccessOverlay = isAdvancing && !showWrongAnswerFeedback;
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

    setShowWrongAnswerFeedback(false);
    setIsAdvancing(false);

    const demoOverride = getDemoChallengeResultOverride(difficulty);
    const accuracy = demoOverride?.accuracy ?? calculateChallengeAccuracy(score, attempts);
    const finalScore = demoOverride?.score ?? score;
    const earnedStars =
      demoOverride?.stars ??
      calculateChallengeStars(
        { accuracy, score: finalScore },
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
      score: finalScore,
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

  const beginChallenge = useCallback(() => {
    clearCountdown();

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setScore(0);
    setAttempts(0);
    setIsAdvancing(false);
    setShowWrongAnswerFeedback(false);
    wrongAnswerShake.stopAnimation();
    wrongAnswerShake.setValue(0);
    wrongAnswerFlashOpacity.stopAnimation();
    wrongAnswerFlashOpacity.setValue(0);
    setResultSummary(null);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setRunStatus('ready');
    startCountdown();
  }, [
    clearCountdown,
    wrongAnswerFlashOpacity,
    wrongAnswerShake,
    startCountdown,
  ]);

  useEffect(() => {
    beginChallenge();
  }, [beginChallenge]);

  const resetToReady = useCallback(() => {
    beginChallenge();
  }, [beginChallenge]);

  const triggerWrongAnswerFeedback = useCallback(
    (nextPrompt: PromptPair) => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }

      wrongAnswerShake.stopAnimation();
      wrongAnswerShake.setValue(0);
      wrongAnswerFlashOpacity.stopAnimation();
      wrongAnswerFlashOpacity.setValue(0);
      setShowWrongAnswerFeedback(true);
      setIsAdvancing(true);

      Animated.parallel([
        Animated.sequence(
          WRONG_ANSWER_SHAKE_KEYFRAMES.map((offset, index) =>
            Animated.timing(wrongAnswerShake, {
              duration: WRONG_ANSWER_SHAKE_DURATIONS[index],
              easing: Easing.out(Easing.quad),
              toValue: offset,
              useNativeDriver: true,
            }),
          ),
        ),
        Animated.sequence([
          Animated.timing(wrongAnswerFlashOpacity, {
            duration: 80,
            toValue: WRONG_ANSWER_FLASH_OPACITY,
            useNativeDriver: true,
          }),
          Animated.timing(wrongAnswerFlashOpacity, {
            duration: 220,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      feedbackTimerRef.current = setTimeout(() => {
        loadPrompt(nextPrompt);
        setShowWrongAnswerFeedback(false);
        setIsAdvancing(false);
        feedbackTimerRef.current = null;
      }, WRONG_ANSWER_ADVANCE_DELAY_MS);
    },
    [loadPrompt, wrongAnswerFlashOpacity, wrongAnswerShake],
  );

  function checkAnswer() {
    if (runStatus !== 'running' || isAdvancing) {
      return;
    }

    const isCorrect = isElapsedDurationCorrect(answer, promptPair[0], promptPair[1]);

    setAttempts((current) => current + 1);

    if (isCorrect) {
      const nextPrompt = nextElapsedTimePairForInterval(promptPair, currentInterval);

      setScore((current) => current + 1);
      setShowWrongAnswerFeedback(false);
      setIsAdvancing(true);
      wrongAnswerShake.stopAnimation();
      wrongAnswerShake.setValue(0);
      wrongAnswerFlashOpacity.stopAnimation();
      wrongAnswerFlashOpacity.setValue(0);

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

    triggerWrongAnswerFeedback(nextElapsedTimePairForInterval(promptPair, currentInterval));
  }

  function addDebugScore() {
    setScore((current) => current + 5);
    setAttempts((current) => current + 5);
  }

  function endDebugRun() {
    if (runStatus === 'finished') {
      return;
    }

    clearCountdown();
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setIsAdvancing(false);
    setShowWrongAnswerFeedback(false);
    wrongAnswerShake.stopAnimation();
    wrongAnswerShake.setValue(0);
    wrongAnswerFlashOpacity.stopAnimation();
    wrongAnswerFlashOpacity.setValue(0);
    setTimeRemaining(0);
    setRunStatus('finished');
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
    <AppShell
      maxWidth={contentMaxWidth}
      scrollEnabled={!isAdvancing && !resultSummary}>
      <HeaderBar
        title={getHomeModeTitle(MODE)}
        subtitle={`${CHALLENGE_DIFFICULTY_LABELS[difficulty]} · ${formatChallengeIntervalLabel(
          currentInterval,
        )}`}
        leftAction={
          resultSummary ? null : <BackButton onPress={() => router.back()} />
        }
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.screenBody}>
        <ChallengeCountdownOverlay value={countdownValue} />
        <View style={styles.challengeLayout}>
          <View style={styles.challengeColumn}>
            <View style={styles.timerRail} testID="challenge-timer-bar">
              <View
                style={[styles.timerFill, { width: `${timerProgress * 100}%` }]}
                testID="challenge-timer-bar-fill"
              />
            </View>

            {__DEV__ ? (
              <View pointerEvents="box-none" style={styles.devControlsOverlay}>
                <View style={styles.devControls}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={runStatus !== 'running'}
                    onPress={addDebugScore}
                    style={[
                      styles.devButton,
                      runStatus !== 'running' ? styles.actionButtonDisabled : null,
                    ]}
                    testID="challenge-dev-add-score-button">
                    <Text style={styles.devButtonText}>+5</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={runStatus !== 'running'}
                    onPress={endDebugRun}
                    style={[
                      styles.devButton,
                      runStatus !== 'running' ? styles.actionButtonDisabled : null,
                    ]}
                    testID="challenge-dev-end-button">
                    <Text style={styles.devButtonText}>End Now</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <View style={styles.promptCard}>
              <View
                pointerEvents="none"
                style={[styles.promptContent, runStatus !== 'running' && styles.promptHidden]}
                testID="challenge-prompt-content">
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
          </View>

          <View style={styles.challengeColumn}>
            <Card style={styles.answerCard}>
              <Text style={styles.cardEyebrow}>Elapsed time</Text>
              <Animated.View
                style={[
                  styles.answerSurface,
                  {
                    transform: [{ translateX: wrongAnswerShake }],
                  },
                ]}>
                <View style={styles.answerOverlayWrap}>
                  <ElapsedDurationInput
                    compact={useCompactInput}
                    disabled={runStatus !== 'running' || isAdvancing}
                    onChange={setAnswer}
                    practiceInterval={currentInterval}
                    value={answer}
                  />

                  {showWrongAnswerFeedback ? (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.answerFlashOverlay,
                        {
                          opacity: wrongAnswerFlashOpacity,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                {showSuccessOverlay ? <CelebrationOverlay visible /> : null}
              </Animated.View>
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
        </View>

        {runStatus === 'finished' && resultSummary ? (
          <ChallengeResultsOverlay
            accuracy={resultSummary.accuracy}
            accuracyThreshold={thresholds.accuracyThreshold}
            didUnlockMastery={resultSummary.didUnlockMastery}
            onBack={() => router.back()}
            onPlayAgain={resetToReady}
            score={resultSummary.score}
            scoreThresholdOne={thresholds.scoreThresholdOne}
            scoreThresholdTwo={thresholds.scoreThresholdTwo}
            subtitle={`${CHALLENGE_DIFFICULTY_LABELS[resultSummary.difficulty]} challenge · ${resultSummary.intervalLabel}`}
            title="Time's up!"
          />
        ) : null}
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
    position: 'relative',
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
  devControlsOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 22,
    zIndex: 15,
  },
  devControls: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  devButton: {
    alignItems: 'center',
    backgroundColor: '#EEF3FA',
    borderColor: '#B9C7DA',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  devButtonText: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    gap: 18,
    padding: 22,
    ...shadows.card,
  },
  promptContent: {
    gap: 18,
  },
  promptHidden: {
    opacity: 0,
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
    alignItems: 'center',
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
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    justifyContent: 'center',
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
    gap: 16,
    padding: 22,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  answerSurface: {
    position: 'relative',
  },
  answerOverlayWrap: {
    position: 'relative',
  },
  answerFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.coral,
    borderRadius: 24,
  },
  answerClockWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: palette.white,
  },
  promptClockWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
