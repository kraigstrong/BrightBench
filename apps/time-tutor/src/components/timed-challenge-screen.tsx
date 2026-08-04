import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay, Card } from '@education/ui';

import { AnalogClock } from '@/components/analog-clock';
import {
  ChallengeScreen,
  type ChallengeLayout,
} from '@/components/challenge-screen';
import { DigitalTimeInput } from '@/components/digital-time-input';
import { palette, typography } from '@/design/theme';
import {
  areTimesEqual,
  createInitialAnswer as createAnalogAnswer,
  createInitialDigitalAnswer,
  formatTimeValue,
  getModeTitle,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import type {
  AnswerUpdate,
} from '@/components/practice-screen';
import type {
  ChallengeDifficulty,
  DigitalTimeValue,
  ExerciseMode,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type Props = {
  difficulty: ChallengeDifficulty;
  mode: ExerciseMode;
  timeFormat: TimeFormat;
};

type Answer = TimeValue | DigitalTimeValue;

function createInitialPrompt(interval: PracticeInterval): TimeValue {
  return randomTimeValueForInterval(interval);
}

function createNextPrompt(prompt: TimeValue, interval: PracticeInterval): TimeValue {
  return nextTimeValueForInterval(prompt, interval);
}

export function TimedChallengeScreen({ difficulty, mode, timeFormat }: Props) {
  const isDigitalToAnalog = mode === 'digital-to-analog';

  function createInitialAnswer(prompt: TimeValue, format: TimeFormat): Answer {
    return isDigitalToAnalog
      ? createAnalogAnswer(prompt.meridiem)
      : createInitialDigitalAnswer(format);
  }

  function isAnswerCorrect(answer: Answer, prompt: TimeValue, format: TimeFormat): boolean {
    return isDigitalToAnalog
      ? areTimesEqual(answer as TimeValue, prompt, { includeMeridiem: false })
      : isDigitalAnswerCorrect(answer as DigitalTimeValue, prompt, format);
  }

  function renderPrompt({
    layout,
    prompt,
    timeFormat: promptTimeFormat,
  }: {
    layout: ChallengeLayout;
    prompt: TimeValue;
    timeFormat: TimeFormat;
  }) {
    return (
      <>
        <Text
          style={[styles.promptLabel, isDigitalToAnalog && styles.promptLabelDigital]}>
          {isDigitalToAnalog ? 'Match this digital time' : 'Read this analog clock'}
        </Text>

        {isDigitalToAnalog ? (
          <View style={[styles.promptStage, styles.promptStageDigital]}>
            <Text
              style={[styles.promptTime, styles.promptTimeDigital]}
              testID="challenge-prompt-time">
              {formatTimeValue(prompt, {
                includeMeridiem: false,
                timeFormat: promptTimeFormat,
              })}
            </Text>
          </View>
        ) : (
          <View style={styles.promptClockWrap}>
            <AnalogClock size={layout.clockSize} time={prompt} />
          </View>
        )}
      </>
    );
  }

  function renderAnswer({
    answer,
    disabled,
    isFinished,
    layout,
    onAnswerChange,
    onInteractionEnd,
    onInteractionStart,
    practiceInterval,
    showSuccessOverlay,
    showWrongAnswerFeedback,
    timeFormat: answerTimeFormat,
    wrongAnswerFlashOpacity,
    wrongAnswerShake,
  }: {
    answer: Answer;
    disabled: boolean;
    isFinished: boolean;
    layout: ChallengeLayout;
    onAnswerChange: (value: AnswerUpdate<Answer>) => void;
    onInteractionEnd: () => void;
    onInteractionStart: () => void;
    practiceInterval: PracticeInterval;
    showSuccessOverlay: boolean;
    showWrongAnswerFeedback: boolean;
    timeFormat: TimeFormat;
    wrongAnswerFlashOpacity: Animated.Value;
    wrongAnswerShake: Animated.Value;
  }) {
    return (
      <Card style={styles.answerCard}>
        <Text style={styles.cardEyebrow}>Your answer</Text>
        <Animated.View
          style={[
            styles.answerSurface,
            { transform: [{ translateX: wrongAnswerShake }] },
          ]}>
          {isDigitalToAnalog ? (
            <View style={styles.answerClockWrap}>
              <AnalogClock
                interactive={!disabled}
                onChange={onAnswerChange as (value: AnswerUpdate<TimeValue>) => void}
                onInteractionEnd={onInteractionEnd}
                onInteractionStart={onInteractionStart}
                practiceInterval={practiceInterval}
                showInteractionHint={!isFinished}
                size={layout.clockSize}
                time={answer as TimeValue}
              />
            </View>
          ) : (
            <View style={styles.answerOverlayWrap}>
              <DigitalTimeInput
                compact={layout.useCompactAnswer}
                disabled={disabled}
                onChange={onAnswerChange as (value: DigitalTimeValue) => void}
                practiceInterval={practiceInterval}
                timeFormat={answerTimeFormat}
                value={answer as DigitalTimeValue}
              />
            </View>
          )}

          {showWrongAnswerFeedback ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.answerFlashOverlay, { opacity: wrongAnswerFlashOpacity }]}
            />
          ) : null}
        </Animated.View>

        {showSuccessOverlay ? <CelebrationOverlay visible /> : null}
      </Card>
    );
  }

  return (
    <ChallengeScreen
      createInitialAnswer={createInitialAnswer}
      createInitialPrompt={createInitialPrompt}
      createNextPrompt={createNextPrompt}
      difficulty={difficulty}
      isAnswerCorrect={isAnswerCorrect}
      progressMode={mode}
      promptCardStyle={
        isDigitalToAnalog
          ? [styles.promptCard, styles.promptCardDigital]
          : styles.promptCard
      }
      promptContentStyle={styles.promptContent}
      renderAnswer={renderAnswer}
      renderPrompt={renderPrompt}
      timeFormat={timeFormat}
      title={getModeTitle(mode)}
    />
  );
}

const styles = StyleSheet.create({
  promptCard: {
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  promptCardDigital: {
    paddingVertical: 16,
  },
  promptContent: {
    gap: 4,
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
});
