import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
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
import { AnalogClock } from '@/components/analog-clock';
import { ChallengeCountdownOverlay } from '@/components/challenge-countdown-overlay';
import { DigitalTimeInput } from '@/components/digital-time-input';
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
  areTimesEqual,
  createInitialAnswer,
  createInitialDigitalAnswer,
  formatTimeValue,
  getModeTitle,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import { useChallengeCountdown } from '@/lib/challenge-countdown';
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
const WRONG_ANSWER_ADVANCE_DELAY_MS = 520;
const WRONG_ANSWER_SHAKE_KEYFRAMES = [0, -8, 8, -6, 6, -3, 0] as const;
const WRONG_ANSWER_SHAKE_DURATIONS = [0, 55, 50, 45, 40, 35, 30] as const;
const WRONG_ANSWER_FLASH_OPACITY = 0.5;

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
  const [showWrongAnswerFeedback, setShowWrongAnswerFeedback] = useState(false);
  const [resultSummary, setResultSummary] = useState<ChallengeResultSummary | null>(
    null,
  );
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongAnswerShake = useRef(new Animated.Value(0)).current;
  const wrongAnswerFlashOpacity = useRef(new Animated.Value(0)).current;
  const { countdownValue, startCountdown, clearCountdown } = useChallengeCountdown({
    onComplete: () => {
      loadPrompt(randomTimeValueForInterval(currentInterval));
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
      setChallengeBestStars(mode, difficulty, earnedStars);
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

  const triggerWrongAnswerFeedback = useCallback(
    (nextPrompt: TimeValue) => {
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

    triggerWrongAnswerFeedback(nextTimeValueForInterval(promptTime, currentInterval));
  }

  const promptLabel =
    mode === 'digital-to-analog' ? 'Match this digital time' : 'Read this analog clock';

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

  return (
    <AppShell
      maxWidth={contentMaxWidth}
      scrollEnabled={!clockInteractionActive && !isAdvancing && !resultSummary}>
      <HeaderBar
        title={getModeTitle(mode)}
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

            <View
              style={[
                styles.promptCard,
                mode === 'digital-to-analog' && styles.promptCardDigital,
              ]}>
              <View
                pointerEvents="none"
                style={[styles.promptContent, runStatus !== 'running' && styles.promptHidden]}
                testID="challenge-prompt-content">
                <Text
                  style={[
                    styles.promptLabel,
                    mode === 'digital-to-analog' && styles.promptLabelDigital,
                  ]}>
                  {promptLabel}
                </Text>

                {mode === 'digital-to-analog' ? (
                  <View style={[styles.promptStage, styles.promptStageDigital]}>
                    <Text
                      style={[styles.promptTime, styles.promptTimeDigital]}
                      testID="challenge-prompt-time">
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
          </View>

          <View style={styles.challengeColumn}>
            <Card style={styles.answerCard}>
              <Text style={styles.cardEyebrow}>Your answer</Text>
              <Animated.View
                style={[
                  styles.answerSurface,
                  {
                    transform: [{ translateX: wrongAnswerShake }],
                  },
                ]}>
                {mode === 'digital-to-analog' ? (
                  <View style={styles.answerClockWrap}>
                    <AnalogClock
                      interactive={runStatus === 'running' && !isAdvancing}
                      onChange={handleAnalogAnswerChange}
                      onInteractionEnd={() => setClockInteractionActive(false)}
                      onInteractionStart={() => setClockInteractionActive(true)}
                      practiceInterval={currentInterval}
                      showInteractionHint={runStatus !== 'finished'}
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
              </Animated.View>

              {showSuccessOverlay ? <CelebrationOverlay visible /> : null}
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
            onPlayAgain={beginChallenge}
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
    paddingHorizontal: 22,
    paddingVertical: 10,
    ...shadows.card,
  },
  promptCardDigital: {
    paddingVertical: 16,
  },
  promptContent: {
    gap: 4,
    justifyContent: 'flex-start',
  },
  promptHidden: {
    opacity: 0,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
  },
  promptLabelDigital: {
    fontSize: 16,
    lineHeight: 24,
  },
  promptTime: {
    alignSelf: 'center',
    color: palette.white,
    fontFamily: typography.displayFamily,
    fontSize: 44,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    textAlign: 'center',
  },
  promptTimeDigital: {
    fontSize: 48,
  },
  promptStage: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    marginTop: 0,
  },
  promptStageDigital: {
    height: 64,
    marginTop: 10,
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 0,
    paddingBottom: 0,
  },
  answerCard: {
    gap: 12,
    position: 'relative',
  },
  answerSurface: {
    position: 'relative',
    width: '100%',
  },
  answerOverlayWrap: {
    position: 'relative',
  },
  answerFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(231, 76, 60, 0.22)',
    borderRadius: 24,
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
});
