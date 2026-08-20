import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
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

import { Card } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { palette, shadows, typography } from '@/design/theme';
import { triggerAnswerFeedback } from '@/lib/answer-feedback';
import {
  buildWrongAnswerFlashAnimation,
  buildWrongAnswerShakeAnimation,
} from '@/lib/wrong-answer-shake';
import { useAppState } from '@/state/app-state';
import type { PracticeInterval, TimeFormat } from '@/types/time';

export type PracticeLayout = {
  clockSize: number;
  contentMaxWidth: number;
  isTablet: boolean;
  useCompactAnswer: boolean;
};

export type PracticeAnswerResult<TAnswer> = {
  actual: TAnswer;
  isCorrect: boolean;
};

// Some inputs (AnalogClock) report changes via a state-updater function rather
// than a plain value, matching React's SetStateAction convention.
export type AnswerUpdate<TAnswer> = TAnswer | ((previous: TAnswer) => TAnswer);

export type PracticeScreenConfig<TPrompt, TAnswer> = {
  answerCardStyle?: StyleProp<ViewStyle>;
  cardEyebrowStyle?: StyleProp<TextStyle>;
  cardEyebrowText: string;
  checkAnswerTestId: string;
  createInitialAnswer: (prompt: TPrompt, timeFormat: TimeFormat) => TAnswer;
  createInitialPrompt: (interval: PracticeInterval) => TPrompt;
  createNextPrompt: (prompt: TPrompt, interval: PracticeInterval) => TPrompt;
  // Renders the entered value in the transient wrong-answer label, e.g. "3:45".
  formatAnswerForFeedback: (answer: TAnswer, timeFormat: TimeFormat) => string;
  isAnswerCorrect: (
    answer: TAnswer,
    prompt: TPrompt,
    timeFormat: TimeFormat,
  ) => boolean;
  nextTimeTestId: string;
  promptCardStyle: StyleProp<ViewStyle>;
  renderAnswer: (args: {
    answer: TAnswer;
    layout: PracticeLayout;
    onAnswerChange: (value: AnswerUpdate<TAnswer>) => void;
    onInteractionEnd: () => void;
    onInteractionStart: () => void;
    practiceInterval: PracticeInterval;
    result: PracticeAnswerResult<TAnswer> | null;
    timeFormat: TimeFormat;
  }) => ReactNode;
  renderPrompt: (args: {
    layout: PracticeLayout;
    prompt: TPrompt;
    timeFormat: TimeFormat;
  }) => ReactNode;
  // Set only for modes whose initial-answer shape depends on timeFormat (e.g. digital
  // input), so the prompt doesn't silently reset for modes where it never did before.
  resetsOnTimeFormatChange?: boolean;
  title: string;
};

type Props<TPrompt, TAnswer> = PracticeScreenConfig<TPrompt, TAnswer> & {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

const AUTO_ADVANCE_DELAY_MS = 1500;

const WRONG_ANSWER_LABEL_FADE_IN_MS = 140;
const WRONG_ANSWER_LABEL_VISIBLE_MS = 1500;
const WRONG_ANSWER_LABEL_FADE_MS = 220;

export function PracticeScreen<TPrompt, TAnswer>({
  answerCardStyle,
  cardEyebrowStyle,
  cardEyebrowText,
  checkAnswerTestId,
  createInitialAnswer,
  createInitialPrompt,
  createNextPrompt,
  formatAnswerForFeedback,
  isAnswerCorrect,
  nextTimeTestId,
  practiceInterval,
  promptCardStyle,
  renderAnswer,
  renderPrompt,
  resetsOnTimeFormatChange = false,
  timeFormat,
  title,
}: Props<TPrompt, TAnswer>) {
  const { width } = useWindowDimensions();
  const { soundEffectsEnabled } = useAppState();
  const [prompt, setPrompt] = useState<TPrompt>(() =>
    createInitialPrompt(practiceInterval),
  );
  const [answer, setAnswer] = useState<TAnswer>(() =>
    createInitialAnswer(prompt, timeFormat),
  );
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [result, setResult] = useState<PracticeAnswerResult<TAnswer> | null>(
    null,
  );
  const [showWrongAnswerFeedback, setShowWrongAnswerFeedback] = useState(false);
  const [wrongAnswerAnnouncement, setWrongAnswerAnnouncement] = useState('');
  const wrongAnswerShake = useRef(new Animated.Value(0)).current;
  const wrongAnswerFlashOpacity = useRef(new Animated.Value(0)).current;
  const wrongAnswerLabelOpacity = useRef(new Animated.Value(0)).current;
  const wrongAnswerFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearWrongAnswerFeedback = useCallback(() => {
    if (wrongAnswerFeedbackTimerRef.current) {
      clearTimeout(wrongAnswerFeedbackTimerRef.current);
      wrongAnswerFeedbackTimerRef.current = null;
    }

    wrongAnswerShake.stopAnimation();
    wrongAnswerShake.setValue(0);
    wrongAnswerFlashOpacity.stopAnimation();
    wrongAnswerFlashOpacity.setValue(0);
    wrongAnswerLabelOpacity.stopAnimation();
    wrongAnswerLabelOpacity.setValue(0);
    setShowWrongAnswerFeedback(false);
    setWrongAnswerAnnouncement('');
  }, [wrongAnswerFlashOpacity, wrongAnswerLabelOpacity, wrongAnswerShake]);

  useEffect(() => clearWrongAnswerFeedback, [clearWrongAnswerFeedback]);

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(contentMaxWidth * (isTablet ? 0.48 : 0.78), isTablet ? 420 : 340),
    260,
  );
  const layout: PracticeLayout = {
    clockSize,
    contentMaxWidth,
    isTablet,
    useCompactAnswer: !isTablet,
  };

  const timeFormatResetKey = resetsOnTimeFormatChange ? timeFormat : undefined;

  useEffect(() => {
    const nextPrompt = createInitialPrompt(practiceInterval);
    setPrompt(nextPrompt);
    setAnswer(createInitialAnswer(nextPrompt, timeFormat));
    setResult(null);
    clearWrongAnswerFeedback();
    // timeFormat is intentionally read via closure, not listed: whether it should
    // retrigger this reset is controlled by timeFormatResetKey above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceInterval, timeFormatResetKey, createInitialAnswer, createInitialPrompt]);

  const goToNextPrompt = useCallback(() => {
    const nextPrompt = createNextPrompt(prompt, practiceInterval);

    setPrompt(nextPrompt);
    setAnswer(createInitialAnswer(nextPrompt, timeFormat));
    setResult(null);
    clearWrongAnswerFeedback();
  }, [
    clearWrongAnswerFeedback,
    createInitialAnswer,
    createNextPrompt,
    practiceInterval,
    prompt,
    timeFormat,
  ]);

  useEffect(() => {
    if (!result?.isCorrect) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextPrompt();
    }, AUTO_ADVANCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [goToNextPrompt, result]);

  function checkAnswer() {
    const isCorrect = isAnswerCorrect(answer, prompt, timeFormat);

    triggerAnswerFeedback(isCorrect, soundEffectsEnabled);
    setResult({ actual: answer, isCorrect });
    clearWrongAnswerFeedback();

    if (isCorrect) {
      return;
    }

    setShowWrongAnswerFeedback(true);

    const announcement = `Try again. You entered ${formatAnswerForFeedback(answer, timeFormat)}.`;

    // iOS has no live-region concept, so VoiceOver needs the explicit
    // announcement call. Android's accessibilityLiveRegion (below) already
    // announces TalkBack changes on its own, and calling
    // announceForAccessibility there too would speak it twice; on web the
    // live region is similarly what aria-live picks up.
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
    setWrongAnswerAnnouncement(announcement);

    Animated.parallel([
      buildWrongAnswerShakeAnimation(wrongAnswerShake),
      buildWrongAnswerFlashAnimation(wrongAnswerFlashOpacity),
      Animated.sequence([
        Animated.timing(wrongAnswerLabelOpacity, {
          duration: WRONG_ANSWER_LABEL_FADE_IN_MS,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(wrongAnswerLabelOpacity, {
          delay: WRONG_ANSWER_LABEL_VISIBLE_MS,
          duration: WRONG_ANSWER_LABEL_FADE_MS,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    wrongAnswerFeedbackTimerRef.current = setTimeout(() => {
      setShowWrongAnswerFeedback(false);
      setWrongAnswerAnnouncement('');
      wrongAnswerFeedbackTimerRef.current = null;
    }, WRONG_ANSWER_LABEL_FADE_IN_MS + WRONG_ANSWER_LABEL_VISIBLE_MS + WRONG_ANSWER_LABEL_FADE_MS);
  }

  const handleAnswerChange = useCallback(
    (value: AnswerUpdate<TAnswer>) => {
      setResult(null);
      setAnswer(value);
      clearWrongAnswerFeedback();
    },
    [clearWrongAnswerFeedback],
  );

  return (
    <AppShell maxWidth={contentMaxWidth} scrollEnabled={!clockInteractionActive}>
      <HeaderBar
        title={title}
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.practiceLayout}>
        <View style={styles.practiceColumn}>
          <View style={[styles.promptCard, promptCardStyle]}>
            {renderPrompt({ layout, prompt, timeFormat })}
          </View>
        </View>

        <View style={styles.practiceColumn}>
          <Card style={[styles.answerCard, answerCardStyle]}>
            <Text style={[styles.cardEyebrow, cardEyebrowStyle]}>
              {cardEyebrowText}
            </Text>
            <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
              {wrongAnswerAnnouncement}
            </Text>
            <Animated.View
              style={[
                styles.answerOverlayWrap,
                { transform: [{ translateX: wrongAnswerShake }] },
              ]}>
              {renderAnswer({
                answer,
                layout,
                onAnswerChange: handleAnswerChange,
                onInteractionEnd: () => setClockInteractionActive(false),
                onInteractionStart: () => setClockInteractionActive(true),
                practiceInterval,
                result,
                timeFormat,
              })}

              {showWrongAnswerFeedback ? (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.wrongAnswerFlash, { opacity: wrongAnswerFlashOpacity }]}
                />
              ) : null}

              {showWrongAnswerFeedback && result && !result.isCorrect ? (
                <Animated.View
                  aria-hidden
                  pointerEvents="none"
                  style={[styles.wrongAnswerLabelWrap, { opacity: wrongAnswerLabelOpacity }]}>
                  <View style={styles.wrongAnswerLabelPill}>
                    <Text
                      style={styles.wrongAnswerLabelText}
                      testID="practice-wrong-answer-label">
                      {`You entered ${formatAnswerForFeedback(result.actual, timeFormat)}`}
                    </Text>
                  </View>
                </Animated.View>
              ) : null}
            </Animated.View>
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
              testID={checkAnswerTestId}>
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
              testID={nextTimeTestId}>
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
    ...shadows.card,
  },
  answerCard: {
    gap: 16,
  },
  cardEyebrow: {
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
  visuallyHidden: {
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 1,
  },
  wrongAnswerFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(231, 76, 60, 0.22)',
    borderRadius: 24,
  },
  wrongAnswerLabelWrap: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  wrongAnswerLabelPill: {
    backgroundColor: '#FBEAEC',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wrongAnswerLabelText: {
    color: palette.danger,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
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
