import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ChallengeResultsOverlay } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { ChallengeCountdownOverlay } from '@/components/challenge-countdown-overlay';
import { BackButton, HeaderBar } from '@/components/header-bar';
import type { AnswerUpdate } from '@/components/practice-screen';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import {
  CHALLENGE_DIFFICULTY_LABELS,
  challengeThresholds,
  formatChallengeIntervalLabel,
} from '@/config/challenge-thresholds';
import { getDemoChallengeResultOverride } from '@/config/demo-video';
import { palette, shadows, typography } from '@/design/theme';
import { triggerAnswerFeedback, triggerRoundCompleteFeedback } from '@/lib/answer-feedback';
import {
  calculateChallengeAccuracy,
  calculateChallengeStars,
  getChallengeIntervalForDifficulty,
  isChallengeModeMastered,
  shouldUpdateBestStars,
} from '@/lib/challenge-progression';
import { useChallengeCountdown } from '@/lib/challenge-countdown';
import { useAppState } from '@/state/app-state';
import type {
  ChallengeDifficulty,
  PlayableMode,
  PracticeInterval,
  StarCount,
  TimeFormat,
} from '@/types/time';

export type ChallengeLayout = {
  clockSize: number;
  contentMaxWidth: number;
  isTablet: boolean;
  useCompactAnswer: boolean;
};

export type ChallengeScreenConfig<TPrompt, TAnswer> = {
  checkAnswerButtonDisabledStyle?: StyleProp<ViewStyle>;
  checkAnswerButtonStyle?: StyleProp<ViewStyle>;
  checkAnswerButtonTextStyle?: StyleProp<TextStyle>;
  createInitialAnswer: (prompt: TPrompt, timeFormat: TimeFormat) => TAnswer;
  createInitialPrompt: (interval: PracticeInterval) => TPrompt;
  createNextPrompt: (prompt: TPrompt, interval: PracticeInterval) => TPrompt;
  isAnswerCorrect: (
    answer: TAnswer,
    prompt: TPrompt,
    timeFormat: TimeFormat,
  ) => boolean;
  progressMode: PlayableMode;
  promptCardStyle: StyleProp<ViewStyle>;
  promptContentStyle: StyleProp<ViewStyle>;
  renderAnswer: (args: {
    answer: TAnswer;
    disabled: boolean;
    isFinished: boolean;
    layout: ChallengeLayout;
    onAnswerChange: (value: AnswerUpdate<TAnswer>) => void;
    onInteractionEnd: () => void;
    onInteractionStart: () => void;
    practiceInterval: PracticeInterval;
    showSuccessOverlay: boolean;
    showWrongAnswerFeedback: boolean;
    timeFormat: TimeFormat;
    wrongAnswerFlashOpacity: Animated.Value;
    wrongAnswerShake: Animated.Value;
  }) => ReactNode;
  renderPrompt: (args: {
    layout: ChallengeLayout;
    prompt: TPrompt;
    timeFormat: TimeFormat;
  }) => ReactNode;
  title: string;
};

type Props<TPrompt, TAnswer> = ChallengeScreenConfig<TPrompt, TAnswer> & {
  difficulty: ChallengeDifficulty;
  timeFormat: TimeFormat;
};

type RunStatus = 'finished' | 'ready' | 'running';
type ChallengeResultSummary = {
  accuracy: number;
  didUnlockMastery: boolean;
  difficulty: ChallengeDifficulty;
  earnedStars: StarCount;
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

export function ChallengeScreen<TPrompt, TAnswer>({
  checkAnswerButtonDisabledStyle,
  checkAnswerButtonStyle,
  checkAnswerButtonTextStyle,
  createInitialAnswer,
  createInitialPrompt,
  createNextPrompt,
  difficulty,
  isAnswerCorrect,
  progressMode,
  promptCardStyle,
  promptContentStyle,
  renderAnswer,
  renderPrompt,
  timeFormat,
  title,
}: Props<TPrompt, TAnswer>) {
  const { width } = useWindowDimensions();
  const { challengeProgress, setChallengeBestStars, soundEffectsEnabled } = useAppState();
  const progress = challengeProgress[progressMode];
  const currentInterval = getChallengeIntervalForDifficulty(difficulty);
  const thresholds = challengeThresholds[progressMode][difficulty];

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(contentMaxWidth * (isTablet ? 0.48 : 0.78), isTablet ? 420 : 340),
    260,
  );
  const layout: ChallengeLayout = {
    clockSize,
    contentMaxWidth,
    isTablet,
    useCompactAnswer: !isTablet,
  };

  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [prompt, setPrompt] = useState<TPrompt>(() =>
    createInitialPrompt(currentInterval),
  );
  const [answer, setAnswer] = useState<TAnswer>(() =>
    createInitialAnswer(prompt, timeFormat),
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
      loadPrompt(createInitialPrompt(currentInterval));
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
      calculateChallengeStars({ accuracy, score: finalScore }, thresholds);
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
      setChallengeBestStars(progressMode, difficulty, earnedStars);
    }

    triggerRoundCompleteFeedback(earnedStars, soundEffectsEnabled);

    setResultSummary({
      accuracy,
      didUnlockMastery,
      difficulty,
      earnedStars,
      intervalLabel: formatChallengeIntervalLabel(currentInterval),
      isNewBest,
      score: finalScore,
    });
  }, [
    attempts,
    currentInterval,
    difficulty,
    progress,
    progressMode,
    resultSummary,
    runStatus,
    score,
    setChallengeBestStars,
    soundEffectsEnabled,
    thresholds,
  ]);

  const loadPrompt = useCallback(
    (nextPrompt: TPrompt) => {
      setPrompt(nextPrompt);
      setAnswer(createInitialAnswer(nextPrompt, timeFormat));
    },
    [createInitialAnswer, timeFormat],
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
  }, [clearCountdown, wrongAnswerFlashOpacity, wrongAnswerShake, startCountdown]);

  useEffect(() => {
    beginChallenge();
  }, [beginChallenge]);

  const triggerWrongAnswerFeedback = useCallback(
    (nextPrompt: TPrompt) => {
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

  const handleAnswerChange = useCallback((value: AnswerUpdate<TAnswer>) => {
    setAnswer(value);
  }, []);

  function checkAnswer() {
    if (runStatus !== 'running' || isAdvancing) {
      return;
    }

    const isCorrect = isAnswerCorrect(answer, prompt, timeFormat);

    triggerAnswerFeedback(isCorrect, soundEffectsEnabled);
    setAttempts((current) => current + 1);

    if (isCorrect) {
      const nextPrompt = createNextPrompt(prompt, currentInterval);

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

    triggerWrongAnswerFeedback(createNextPrompt(prompt, currentInterval));
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

  return (
    <AppShell
      maxWidth={contentMaxWidth}
      scrollEnabled={!clockInteractionActive && !isAdvancing && !resultSummary}>
      <HeaderBar
        title={title}
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

            <View style={[styles.promptCard, promptCardStyle]}>
              <View
                pointerEvents="none"
                style={[
                  styles.promptContent,
                  promptContentStyle,
                  runStatus !== 'running' && styles.promptHidden,
                ]}
                testID="challenge-prompt-content">
                {renderPrompt({ layout, prompt, timeFormat })}
              </View>
            </View>
          </View>

          <View style={styles.challengeColumn}>
            {renderAnswer({
              answer,
              disabled: runStatus !== 'running' || isAdvancing,
              isFinished: runStatus === 'finished',
              layout,
              onAnswerChange: handleAnswerChange,
              onInteractionEnd: () => setClockInteractionActive(false),
              onInteractionStart: () => setClockInteractionActive(true),
              practiceInterval: currentInterval,
              showSuccessOverlay,
              showWrongAnswerFeedback,
              timeFormat,
              wrongAnswerFlashOpacity,
              wrongAnswerShake,
            })}

            {runStatus !== 'finished' || !resultSummary ? (
              <Pressable
                accessibilityRole="button"
                disabled={runStatus !== 'running' || isAdvancing}
                onPress={checkAnswer}
                style={[
                  styles.actionButton,
                  checkAnswerButtonStyle,
                  styles.primaryButton,
                  (runStatus !== 'running' || isAdvancing) &&
                    (checkAnswerButtonDisabledStyle ?? styles.actionButtonDisabled),
                ]}
                testID="challenge-check-answer-button">
                <Text
                  style={[
                    styles.actionButtonText,
                    checkAnswerButtonTextStyle,
                    styles.primaryButtonText,
                  ]}>
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
            onReanimate={() =>
              triggerRoundCompleteFeedback(resultSummary.earnedStars, soundEffectsEnabled)
            }
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
    ...shadows.card,
  },
  promptContent: {
    justifyContent: 'flex-start',
  },
  promptHidden: {
    opacity: 0,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
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
