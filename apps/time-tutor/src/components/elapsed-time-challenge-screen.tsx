import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { CelebrationOverlay, Card } from '@education/ui';

import {
  ChallengeScreen,
  type ChallengeLayout,
} from '@/components/challenge-screen';
import { ElapsedDurationInput } from '@/components/elapsed-duration-input';
import { palette, typography } from '@/design/theme';
import {
  createInitialElapsedDuration,
  formatTimeValue,
  getHomeModeTitle,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '@/lib/time';
import type {
  ChallengeDifficulty,
  ElapsedDurationValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';

type PromptPair = readonly [TimeValue, TimeValue];

type Props = {
  difficulty: ChallengeDifficulty;
  timeFormat: TimeFormat;
};

const MODE = 'elapsed-time';

function createInitialPrompt(interval: PracticeInterval): PromptPair {
  return randomElapsedTimePairForInterval(interval);
}

function createNextPrompt(prompt: PromptPair, interval: PracticeInterval): PromptPair {
  return nextElapsedTimePairForInterval(prompt, interval);
}

function createInitialAnswer(): ElapsedDurationValue {
  return createInitialElapsedDuration();
}

function isAnswerCorrect(answer: ElapsedDurationValue, prompt: PromptPair): boolean {
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
  layout: ChallengeLayout;
  prompt: PromptPair;
  timeFormat: TimeFormat;
}) {
  return (
    <>
      <Text style={styles.promptLabel}>How much time passes?</Text>
      <View style={styles.promptContentArea}>
        <View style={styles.promptTimesRow}>
          <View style={styles.promptTimeCard}>
            <Text style={styles.promptTimeEyebrow}>Start</Text>
            {renderPromptTime(prompt[0], timeFormat, 'elapsed-challenge-start-time')}
          </View>
          <View style={styles.connectorPill}>
            <Text style={styles.connectorText}>to</Text>
          </View>
          <View style={styles.promptTimeCard}>
            <Text style={styles.promptTimeEyebrow}>End</Text>
            {renderPromptTime(prompt[1], timeFormat, 'elapsed-challenge-end-time')}
          </View>
        </View>
      </View>
    </>
  );
}

function renderAnswer({
  answer,
  disabled,
  onAnswerChange,
  practiceInterval,
  showSuccessOverlay,
  showWrongAnswerFeedback,
  wrongAnswerFlashOpacity,
  wrongAnswerShake,
  layout,
}: {
  answer: ElapsedDurationValue;
  disabled: boolean;
  isFinished: boolean;
  layout: ChallengeLayout;
  onAnswerChange: (value: ElapsedDurationValue) => void;
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
      <Text style={styles.cardEyebrow}>Elapsed time</Text>
      <Animated.View
        style={[
          styles.answerSurface,
          { transform: [{ translateX: wrongAnswerShake }] },
        ]}>
        <View style={styles.answerOverlayWrap}>
          <ElapsedDurationInput
            compact={layout.useCompactAnswer}
            disabled={disabled}
            onChange={onAnswerChange}
            practiceInterval={practiceInterval}
            value={answer}
          />

          {showWrongAnswerFeedback ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.answerFlashOverlay, { opacity: wrongAnswerFlashOpacity }]}
            />
          ) : null}
        </View>

        {showSuccessOverlay ? <CelebrationOverlay visible /> : null}
      </Animated.View>
    </Card>
  );
}

export function ElapsedTimeChallengeScreen({ difficulty, timeFormat }: Props) {
  return (
    <ChallengeScreen
      checkAnswerButtonDisabledStyle={styles.checkAnswerButtonDisabled}
      checkAnswerButtonStyle={styles.checkAnswerButton}
      checkAnswerButtonTextStyle={styles.checkAnswerButtonText}
      createInitialAnswer={createInitialAnswer}
      createInitialPrompt={createInitialPrompt}
      createNextPrompt={createNextPrompt}
      difficulty={difficulty}
      isAnswerCorrect={isAnswerCorrect}
      progressMode={MODE}
      promptCardStyle={styles.promptCard}
      promptContentStyle={styles.promptContent}
      renderAnswer={renderAnswer}
      renderPrompt={renderPrompt}
      timeFormat={timeFormat}
      title={getHomeModeTitle(MODE)}
    />
  );
}

const styles = StyleSheet.create({
  promptCard: {
    gap: 18,
    padding: 22,
  },
  promptContent: {
    gap: 18,
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
  checkAnswerButton: {
    borderRadius: 20,
    minHeight: 54,
    paddingHorizontal: 20,
  },
  checkAnswerButtonDisabled: {
    opacity: 0.5,
  },
  checkAnswerButtonText: {
    fontSize: 18,
  },
});
