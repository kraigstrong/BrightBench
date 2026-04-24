import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, radii, spacing } from '@education/design';
import {
  ChallengeCountdownOverlay,
  ChallengeResultsOverlay,
  ChallengeTimerBar,
  HeaderBar,
  HeaderBackButton,
  HeaderIconButton,
  SettingsCogIcon,
  useChallengeCountdown,
} from '@education/ui';
import { playAudioKey } from '@/features/game/audio/letter-audio';
import {
  calculateChallengeAccuracy,
  calculateChallengeStars,
  challengeThresholds,
  CHALLENGE_DIFFICULTY_LABELS,
  getDefaultChallengeDifficulty,
  isChallengeModeMastered,
  shouldUpdateBestStars,
} from '@/features/game/challenge-stars';
import { CasePairPanel } from '@/features/game/components/case-pair-panel';
import { GameScreenShell } from '@/features/game/components/game-screen-shell';
import { LetterMatchPanel } from '@/features/game/components/letter-match-panel';
import { SoundMatchPanel } from '@/features/game/components/sound-match-panel';
import { TapLetterPanel } from '@/features/game/components/tap-letter-panel';
import { MODE_META } from '@/features/game/mode-meta';
import { evaluateRound, generateRound } from '@/features/game/modes';
import {
  AnyRound,
  CasePairRound,
  DifficultyLevel,
  GameMode,
  LetterMatchRound,
  RoundEvaluation,
  SoundMatchRound,
  TapLetterRound,
} from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_ADVANCE_DELAY_MS = 650;
const WRONG_ANSWER_ADVANCE_DELAY_MS = 520;
const WRONG_ANSWER_SHAKE_KEYFRAMES = [0, -8, 8, -6, 6, -3, 0] as const;
const WRONG_ANSWER_SHAKE_DURATIONS = [0, 55, 50, 45, 40, 35, 30] as const;
const WRONG_ANSWER_FLASH_OPACITY = 0.5;

type RunStatus = 'finished' | 'ready' | 'running';

type ChallengeResultSummary = {
  accuracy: number;
  didUnlockMastery: boolean;
  difficultyLabel: string;
  isNewBest: boolean;
  score: number;
};

export function ChallengeScene({
  mode,
  difficultyLevel,
}: {
  mode: GameMode;
  difficultyLevel?: DifficultyLevel;
}) {
  const { progress, recordRound, setChallengeBestStars, settings } = useAppState();
  const challengeProgress = progress.challengeProgress[mode];
  const activeDifficultyLevel =
    difficultyLevel ?? getDefaultChallengeDifficulty(challengeProgress);
  const thresholds = challengeThresholds[activeDifficultyLevel];

  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [round, setRound] = useState<AnyRound>(() =>
    generateRound(mode, { difficultyLevel: activeDifficultyLevel, sessionType: 'challenge' })
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showWrongAnswerFeedback, setShowWrongAnswerFeedback] = useState(false);
  const [resultSummary, setResultSummary] = useState<ChallengeResultSummary | null>(null);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongAnswerShake = useRef(new Animated.Value(0)).current;
  const wrongAnswerFlashOpacity = useRef(new Animated.Value(0)).current;
  const meta = MODE_META[mode];

  const showSuccessOverlay = isAdvancing && !showWrongAnswerFeedback;
  const timerProgress =
    runStatus === 'running'
      ? Math.max(0, Math.min(1, timeRemaining / CHALLENGE_DURATION_SECONDS))
      : 1;

  const { countdownValue, startCountdown, clearCountdown } = useChallengeCountdown({
    onComplete: () => {
      setRound(generateRound(mode, { difficultyLevel: activeDifficultyLevel, sessionType: 'challenge' }));
      setTimeRemaining(CHALLENGE_DURATION_SECONDS);
      setRunStatus('running');
      playAudioKey('ui:go', settings.soundEnabled);
    },
  });

  useEffect(
    () => () => {
      clearCountdown();
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [clearCountdown]
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
    if (runStatus !== 'running') {
      return;
    }

    if (mode === 'sound') {
      playAudioKey((round as SoundMatchRound).audioKey, settings.soundEnabled);
    }

    if (mode === 'match') {
      playAudioKey((round as LetterMatchRound).instructionAudioKey, settings.soundEnabled);
    }
  }, [mode, round, runStatus, settings.soundEnabled]);

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

    const accuracy = calculateChallengeAccuracy(score, attempts);
    const earnedStars = calculateChallengeStars({ accuracy, score }, thresholds);
    const previousBest = challengeProgress.bestStars[activeDifficultyLevel];
    const nextBest = earnedStars > previousBest ? earnedStars : previousBest;
    const nextProgress = {
      ...challengeProgress,
      bestStars: {
        ...challengeProgress.bestStars,
        [activeDifficultyLevel]: nextBest,
      },
    };
    const isNewBest = shouldUpdateBestStars(previousBest, earnedStars);
    const didUnlockMastery =
      !isChallengeModeMastered(challengeProgress) && isChallengeModeMastered(nextProgress);

    if (isNewBest) {
      setChallengeBestStars(mode, activeDifficultyLevel, earnedStars);
    }

    setResultSummary({
      accuracy,
      didUnlockMastery,
      difficultyLabel: CHALLENGE_DIFFICULTY_LABELS[activeDifficultyLevel],
      isNewBest,
      score,
    });
  }, [
    activeDifficultyLevel,
    attempts,
    challengeProgress,
    mode,
    resultSummary,
    runStatus,
    score,
    setChallengeBestStars,
    thresholds,
  ]);

  const resetFeedbackVisuals = useCallback(() => {
    wrongAnswerShake.stopAnimation();
    wrongAnswerShake.setValue(0);
    wrongAnswerFlashOpacity.stopAnimation();
    wrongAnswerFlashOpacity.setValue(0);
  }, [wrongAnswerFlashOpacity, wrongAnswerShake]);

  const loadNextRound = useCallback(() => {
    setRound(generateRound(mode, { difficultyLevel: activeDifficultyLevel, sessionType: 'challenge' }));
    setShowWrongAnswerFeedback(false);
    setIsAdvancing(false);
    feedbackTimerRef.current = null;
  }, [activeDifficultyLevel, mode]);

  const beginChallenge = useCallback(() => {
    clearCountdown();

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    resetFeedbackVisuals();
    setScore(0);
    setAttempts(0);
    setIsAdvancing(false);
    setShowWrongAnswerFeedback(false);
    setResultSummary(null);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setRunStatus('ready');
    setRound(generateRound(mode, { difficultyLevel: activeDifficultyLevel, sessionType: 'challenge' }));
    startCountdown();
  }, [activeDifficultyLevel, clearCountdown, mode, resetFeedbackVisuals, startCountdown]);

  useEffect(() => {
    beginChallenge();
  }, [beginChallenge]);

  const triggerWrongAnswerFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    resetFeedbackVisuals();
    setShowWrongAnswerFeedback(true);
    setIsAdvancing(true);
    playAudioKey('ui:try-again', settings.soundEnabled);

    Animated.parallel([
      Animated.sequence(
        WRONG_ANSWER_SHAKE_KEYFRAMES.map((offset, index) =>
          Animated.timing(wrongAnswerShake, {
            duration: WRONG_ANSWER_SHAKE_DURATIONS[index],
            easing: Easing.out(Easing.quad),
            toValue: offset,
            useNativeDriver: true,
          })
        )
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
      loadNextRound();
      resetFeedbackVisuals();
    }, WRONG_ANSWER_ADVANCE_DELAY_MS);
  }, [
    loadNextRound,
    resetFeedbackVisuals,
    settings.soundEnabled,
    wrongAnswerFlashOpacity,
    wrongAnswerShake,
  ]);

  const submit = useCallback(
    (input: unknown) => {
      if (runStatus !== 'running' || isAdvancing) {
        return;
      }

      const evaluation: RoundEvaluation = evaluateRound(mode, round, input);
      setAttempts((current) => current + 1);

      recordRound({
        difficultyLevel: activeDifficultyLevel,
        mode,
        sessionType: 'challenge',
        targetId: getRoundTargetId(round),
        scoreBand: evaluation.scoreBand,
        wasCorrect: evaluation.isCorrect,
        feedbackKey: evaluation.feedbackKey,
        createdAt: new Date().toISOString(),
      });

      if (evaluation.isCorrect) {
        if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
        }

        resetFeedbackVisuals();
        setShowWrongAnswerFeedback(false);
        setIsAdvancing(true);
        setScore((current) => current + 1);
        playAudioKey('ui:correct', settings.soundEnabled);
        feedbackTimerRef.current = setTimeout(loadNextRound, SUCCESS_ADVANCE_DELAY_MS);
        return;
      }

      triggerWrongAnswerFeedback();
    },
    [
      activeDifficultyLevel,
      isAdvancing,
      loadNextRound,
      mode,
      recordRound,
      resetFeedbackVisuals,
      round,
      runStatus,
      settings.soundEnabled,
      triggerWrongAnswerFeedback,
    ]
  );

  function renderRound() {
    const disabled = runStatus !== 'running' || isAdvancing;

    switch (mode) {
      case 'match':
        return (
          <LetterMatchPanel
            accent={meta.accent}
            disabled={disabled}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as LetterMatchRound}
            soundEnabled={settings.soundEnabled}
          />
        );
      case 'case':
        return (
          <CasePairPanel
            accent={meta.accent}
            disabled={disabled}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as CasePairRound}
          />
        );
      case 'tap':
        return (
          <TapLetterPanel
            accent={meta.accent}
            disabled={disabled}
            onSubmit={(answerValue) => submit(answerValue)}
            reducedMotion={settings.reducedMotion}
            round={round as TapLetterRound}
          />
        );
      case 'sound':
        return (
          <SoundMatchPanel
            accent={meta.accent}
            disabled={disabled}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as SoundMatchRound}
            soundEnabled={settings.soundEnabled}
          />
        );
    }
  }

  return (
    <View style={styles.scene}>
      <HeaderBar
        title={meta.title}
        subtitle={`${CHALLENGE_DIFFICULTY_LABELS[activeDifficultyLevel]} - 1-Minute Challenge`}
        leftAction={<HeaderBackButton onPress={() => goBackOrReplace(router, `/mode/${mode}`)} />}
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />

      <View style={styles.screenBody}>
        <ChallengeCountdownOverlay value={countdownValue} />

        <ChallengeTimerBar
          fillTestID="challenge-timer-bar-fill"
          progress={timerProgress}
          testID="challenge-timer-bar"
        />

        <GameScreenShell
          accent={meta.accent}
          celebrationVisible={showSuccessOverlay}
          hint={round.hint}
          prompt={round.prompt}
          successMessage="Nice work!">
          <Animated.View
            style={[
              styles.answerSurface,
              {
                transform: [{ translateX: wrongAnswerShake }],
              },
            ]}>
            {renderRound()}

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
        </GameScreenShell>

        {runStatus === 'finished' && resultSummary ? (
          <ChallengeResultsOverlay
            accuracy={resultSummary.accuracy}
            accuracyThreshold={thresholds.accuracyThreshold}
            didUnlockMastery={resultSummary.didUnlockMastery}
            onBack={() => goBackOrReplace(router, `/mode/${mode}`)}
            onPlayAgain={beginChallenge}
            score={resultSummary.score}
            scoreThresholdOne={thresholds.scoreThresholdOne}
            scoreThresholdTwo={thresholds.scoreThresholdTwo}
            subtitle={`${resultSummary.difficultyLabel} challenge${resultSummary.isNewBest ? ' - New Best' : ''}`}
            title="Time's up!"
          />
        ) : null}
      </View>
    </View>
  );
}

function getRoundTargetId(round: AnyRound) {
  switch (round.mode) {
    case 'match':
    case 'tap':
      return round.target.value;
    case 'case':
      return round.answer.value;
    case 'sound':
      return round.audioKey;
  }
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    gap: spacing.md,
  },
  screenBody: {
    flex: 1,
    gap: spacing.md,
    position: 'relative',
  },
  answerSurface: {
    minHeight: 300,
    position: 'relative',
    width: '100%',
  },
  answerFlashOverlay: {
    backgroundColor: palette.danger,
    borderRadius: radii.lg,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
