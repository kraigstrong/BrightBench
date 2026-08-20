import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay } from '@education/ui';

import { AnalogClock } from '@/components/analog-clock';
import { DigitalTimeInput } from '@/components/digital-time-input';
import {
  PracticeScreen,
  type PracticeAnswerResult,
  type PracticeLayout,
} from '@/components/practice-screen';
import { typography } from '@/design/theme';
import {
  createInitialDigitalAnswer,
  formatDigitalTimeValue,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import type {
  DigitalTimeValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type Props = {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

function createInitialPrompt(interval: PracticeInterval): TimeValue {
  return randomTimeValueForInterval(interval);
}

function createNextPrompt(prompt: TimeValue, interval: PracticeInterval): TimeValue {
  return nextTimeValueForInterval(prompt, interval);
}

function createInitialAnswer(
  _prompt: TimeValue,
  timeFormat: TimeFormat,
): DigitalTimeValue {
  return createInitialDigitalAnswer(timeFormat);
}

function isAnswerCorrect(
  answer: DigitalTimeValue,
  prompt: TimeValue,
  timeFormat: TimeFormat,
): boolean {
  return isDigitalAnswerCorrect(answer, prompt, timeFormat);
}

function formatAnswerForFeedback(
  answer: DigitalTimeValue,
  timeFormat: TimeFormat,
): string {
  return formatDigitalTimeValue(answer, timeFormat);
}

function renderPrompt({ layout, prompt }: { layout: PracticeLayout; prompt: TimeValue; timeFormat: TimeFormat }) {
  return (
    <>
      <Text style={[styles.promptLabel, styles.promptLabelAnalog]}>
        Read this analog clock
      </Text>
      <View style={styles.promptClockWrap}>
        <AnalogClock size={layout.clockSize} time={prompt} />
      </View>
    </>
  );
}

function renderAnswer({
  answer,
  layout,
  onAnswerChange,
  practiceInterval,
  result,
  timeFormat,
}: {
  answer: DigitalTimeValue;
  layout: PracticeLayout;
  onAnswerChange: (value: DigitalTimeValue) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  practiceInterval: PracticeInterval;
  result: PracticeAnswerResult<DigitalTimeValue> | null;
  timeFormat: TimeFormat;
}) {
  return (
    <>
      <DigitalTimeInput
        compact={layout.useCompactAnswer}
        onChange={onAnswerChange}
        practiceInterval={practiceInterval}
        timeFormat={timeFormat}
        value={answer}
      />

      <CelebrationOverlay title="Nice work!" visible={Boolean(result?.isCorrect)} />
    </>
  );
}

export function ReadClockPracticeScreen({ practiceInterval, timeFormat }: Props) {
  return (
    <PracticeScreen
      answerCardStyle={styles.answerCard}
      cardEyebrowStyle={styles.cardEyebrow}
      cardEyebrowText="Your answer"
      checkAnswerTestId="check-answer-button"
      createInitialAnswer={createInitialAnswer}
      createInitialPrompt={createInitialPrompt}
      createNextPrompt={createNextPrompt}
      formatAnswerForFeedback={formatAnswerForFeedback}
      isAnswerCorrect={isAnswerCorrect}
      nextTimeTestId="next-time-button"
      practiceInterval={practiceInterval}
      promptCardStyle={styles.promptCard}
      renderAnswer={renderAnswer}
      renderPrompt={renderPrompt}
      resetsOnTimeFormatChange
      timeFormat={timeFormat}
      title="Read the Clock"
    />
  );
}

const styles = StyleSheet.create({
  promptCard: {
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptLabelAnalog: {
    marginTop: 4,
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: Platform.OS === 'web' ? 8 : 0,
  },
  answerCard: {
    alignItems: 'center',
  },
  cardEyebrow: {
    alignSelf: 'stretch',
  },
});
