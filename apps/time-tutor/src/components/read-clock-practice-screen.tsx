import React from 'react';
import { Pressable, Platform, StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay } from '@education/ui';

import { AnalogClock } from '@/components/analog-clock';
import { DigitalTimeInput } from '@/components/digital-time-input';
import {
  PracticeScreen,
  type PracticeAnswerResult,
  type PracticeLayout,
} from '@/components/practice-screen';
import { palette, typography } from '@/design/theme';
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
  onDismissResult,
  practiceInterval,
  result,
  timeFormat,
}: {
  answer: DigitalTimeValue;
  layout: PracticeLayout;
  onAnswerChange: (value: DigitalTimeValue) => void;
  onDismissResult: () => void;
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

      {result && !result.isCorrect ? (
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackToast} testID="practice-wrong-answer-overlay">
            <View style={styles.feedbackCopy}>
              <Text style={styles.feedbackToastTitle}>Try again</Text>
              <Text style={styles.feedbackToastText}>
                {`You entered ${formatDigitalTimeValue(result.actual, timeFormat)}`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onDismissResult}
              style={styles.feedbackDismissButton}
              testID="practice-dismiss-feedback-button">
              <Text style={styles.feedbackDismissText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
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
  feedbackOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  feedbackToast: {
    alignItems: 'center',
    backgroundColor: '#FBEAEC',
    borderColor: palette.danger,
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
    maxWidth: '64%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackCopy: {
    alignItems: 'center',
    gap: 2,
  },
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: typography.displayFamily,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackToastText: {
    color: palette.danger,
    flexShrink: 1,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  feedbackDismissButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(182, 71, 87, 0.12)',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 12,
  },
  feedbackDismissText: {
    color: palette.danger,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
});
