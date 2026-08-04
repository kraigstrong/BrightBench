import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay } from '@education/ui';

import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
import {
  PracticeScreen,
  type PracticeAnswerResult,
  type PracticeLayout,
} from '@/components/practice-screen';
import { palette, typography } from '@/design/theme';
import {
  createInitialElapsedDuration,
  formatTimeValue,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import type {
  ElapsedDurationValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];

type Props = {
  practiceInterval: PracticeInterval;
  timeFormat: TimeFormat;
};

function createInitialPrompt(interval: PracticeInterval): PromptPair {
  return randomElapsedTimePairForInterval(interval);
}

function createNextPrompt(prompt: PromptPair, interval: PracticeInterval): PromptPair {
  return nextElapsedTimePairForInterval(prompt, interval);
}

function createInitialAnswer(): ElapsedDurationValue {
  return createInitialElapsedDuration();
}

function isAnswerCorrect(
  answer: ElapsedDurationValue,
  prompt: PromptPair,
): boolean {
  return isElapsedDurationCorrect(answer, prompt[0], prompt[1]);
}

function renderPromptTime(
  value: TimeValue,
  timeFormat: TimeFormat,
  testID: string,
) {
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

function renderPrompt({
  prompt,
  timeFormat,
}: {
  layout: PracticeLayout;
  prompt: PromptPair;
  timeFormat: TimeFormat;
}) {
  return (
    <>
      <Text style={styles.promptLabel}>How much time passes?</Text>
      <View style={styles.promptTimesRow}>
        <View style={styles.promptTimeCard}>
          <Text style={styles.promptTimeEyebrow}>Start</Text>
          {renderPromptTime(prompt[0], timeFormat, 'elapsed-start-time')}
        </View>
        <View style={styles.connectorPill}>
          <Text style={styles.connectorText}>to</Text>
        </View>
        <View style={styles.promptTimeCard}>
          <Text style={styles.promptTimeEyebrow}>End</Text>
          {renderPromptTime(prompt[1], timeFormat, 'elapsed-end-time')}
        </View>
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
}: {
  answer: ElapsedDurationValue;
  layout: PracticeLayout;
  onAnswerChange: (value: ElapsedDurationValue) => void;
  onDismissResult: () => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  practiceInterval: PracticeInterval;
  result: PracticeAnswerResult<ElapsedDurationValue> | null;
  timeFormat: TimeFormat;
}) {
  return (
    <>
      <ElapsedDurationInput
        compact={layout.useCompactAnswer}
        onChange={onAnswerChange}
        practiceInterval={practiceInterval}
        value={answer}
      />

      <CelebrationOverlay title="Nice work!" visible={Boolean(result?.isCorrect)} />

      {result && !result.isCorrect ? (
        <View pointerEvents="none" style={styles.feedbackOverlay}>
          <View style={styles.feedbackToast} testID="elapsed-wrong-answer-overlay">
            <Text style={styles.feedbackToastTitle}>Try again</Text>
          </View>
        </View>
      ) : null}
    </>
  );
}

export function ElapsedTimePracticeScreen({ practiceInterval, timeFormat }: Props) {
  return (
    <PracticeScreen
      answerCardStyle={styles.answerCard}
      cardEyebrowStyle={styles.cardEyebrow}
      cardEyebrowText="Elapsed time"
      checkAnswerTestId="elapsed-check-answer-button"
      createInitialAnswer={createInitialAnswer}
      createInitialPrompt={createInitialPrompt}
      createNextPrompt={createNextPrompt}
      isAnswerCorrect={isAnswerCorrect}
      nextTimeTestId="elapsed-next-time-button"
      practiceInterval={practiceInterval}
      promptCardStyle={styles.promptCard}
      renderAnswer={renderAnswer}
      renderPrompt={renderPrompt}
      timeFormat={timeFormat}
      title="Elapsed Time"
    />
  );
}

const styles = StyleSheet.create({
  promptCard: {
    gap: 18,
    padding: 22,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
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
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: typography.displayFamily,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
