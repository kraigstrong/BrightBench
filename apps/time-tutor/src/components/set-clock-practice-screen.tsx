import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay } from '@education/ui';

import { AnalogClock } from '@/components/analog-clock';
import {
  PracticeScreen,
  type AnswerUpdate,
  type PracticeAnswerResult,
  type PracticeLayout,
} from '@/components/practice-screen';
import { palette, typography } from '@/design/theme';
import {
  areTimesEqual,
  createInitialAnswer as createAnalogAnswer,
  formatTimeValue,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '@/lib/time';
import type { PracticeInterval, TimeFormat, TimeValue } from '@/types/time';


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

function createInitialAnswer(prompt: TimeValue): TimeValue {
  return createAnalogAnswer(prompt.meridiem);
}

function isAnswerCorrect(answer: TimeValue, prompt: TimeValue): boolean {
  return areTimesEqual(answer, prompt, { includeMeridiem: false });
}

function renderPrompt({
  prompt,
  timeFormat,
}: {
  layout: PracticeLayout;
  prompt: TimeValue;
  timeFormat: TimeFormat;
}) {
  return (
    <>
      <Text style={styles.promptLabel}>Match this digital time</Text>
      <View style={styles.promptStage}>
        <Text style={styles.promptTime} testID="prompt-time">
          {formatTimeValue(prompt, { includeMeridiem: false, timeFormat })}
        </Text>
      </View>
    </>
  );
}

function renderAnswer({
  answer,
  layout,
  onAnswerChange,
  onDismissResult,
  onInteractionEnd,
  onInteractionStart,
  practiceInterval,
  result,
}: {
  answer: TimeValue;
  layout: PracticeLayout;
  onAnswerChange: (value: AnswerUpdate<TimeValue>) => void;
  onDismissResult: () => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  practiceInterval: PracticeInterval;
  result: PracticeAnswerResult<TimeValue> | null;
}) {
  return (
    <>
      <AnalogClock
        interactive
        onChange={onAnswerChange}
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
        practiceInterval={practiceInterval}
        size={layout.clockSize}
        time={answer}
      />

      <CelebrationOverlay title="Nice work!" visible={Boolean(result?.isCorrect)} />

      {result && !result.isCorrect ? (
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackToast} testID="practice-wrong-answer-overlay">
            <View style={styles.feedbackCopy}>
              <Text style={styles.feedbackToastTitle}>Try again</Text>
              <Text style={styles.feedbackToastText}>
                {`You entered ${formatTimeValue(result.actual, {
                  includeMeridiem: false,
                })}`}
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

export function SetClockPracticeScreen({ practiceInterval, timeFormat }: Props) {
  return (
    <PracticeScreen
      checkAnswerTestId="check-answer-button"
      cardEyebrowText="Your answer"
      createInitialAnswer={createInitialAnswer}
      createInitialPrompt={createInitialPrompt}
      createNextPrompt={createNextPrompt}
      isAnswerCorrect={isAnswerCorrect}
      nextTimeTestId="next-time-button"
      practiceInterval={practiceInterval}
      promptCardStyle={styles.promptCard}
      renderAnswer={renderAnswer}
      renderPrompt={renderPrompt}
      timeFormat={timeFormat}
      title="Set the Clock"
    />
  );
}

const styles = StyleSheet.create({
  promptCard: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptStage: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    marginTop: 10,
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
