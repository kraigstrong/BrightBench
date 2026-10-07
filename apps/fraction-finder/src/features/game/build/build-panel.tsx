import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton } from '@education/ui';
import {
  ADJUST_MESSAGE,
  MAX_PIECES,
  missMessage,
  packFilled,
  successMessage,
} from '@/features/game/build/build-engine';
import { BAR_HEIGHT, BAR_TOP, barGeometry, CutBar, CUT_BAR_HEIGHT } from '@/features/game/build/cut-bar';
import { MessageArea, PanelMessage } from '@/features/game/components/panel-message';
import { getFraction } from '@/features/game/math';
import { BuildAnswer, BuildRound, RoundEvaluation } from '@/features/game/types';
import { useReduceMotion } from '@/lib/use-reduce-motion';
import { usePlayOnChange, useTween } from '@/lib/use-tween';

const STAGE_MAX_WIDTH = 520;
const IDLE_MESSAGE: PanelMessage = { title: '', tone: 'hint' };

type BuildPanelProps = {
  round: BuildRound;
  onSubmit: (answer: BuildAnswer) => void;
  disabled: boolean;
  onInteraction?: () => void;
  /** The latest wrong answer for this round. Once one arrives, the target's parts stay visible. */
  missEvaluation?: RoundEvaluation | null;
  /** The round was answered correctly: label the filled stretch and number its pieces. */
  solved?: boolean;
  /** The message line under the bar. The challenge hides it to fit its non-scrolling screen. */
  showMessages?: boolean;
};

/**
 * Cut & Fill: the bar arrives whole. The child decides how many equal pieces to cut it
 * into and fills some of them, so choosing the cut is the denominator and filling is the
 * numerator. Any equal share counts, so 6 of 8 pieces makes 3/4. Hosts key this panel by
 * round so each round starts with a whole bar.
 */
export function BuildPanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
  missEvaluation = null,
  solved = false,
  showMessages = true,
}: BuildPanelProps) {
  const [pieces, setPieces] = useState(1);
  const [filled, setFilled] = useState<boolean[]>([false]);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [hadMiss, setHadMiss] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);
  const reduceMotion = useReduceMotion();

  if (missEvaluation && !hadMiss) {
    setHadMiss(true);
  }

  const cutProgress = usePlayOnChange(pieces, 220, reduceMotion);
  const guideOpacity = useTween(solved || hadMiss ? 1 : 0, 280, reduceMotion);

  const target = getFraction(round.targetFractionId);
  const locked = disabled || solved;
  const filledCount = filled.filter(Boolean).length;
  const signature = `${pieces}:${filled.map((isFilled) => (isFilled ? 1 : 0)).join('')}`;
  const canCheck = !locked && filledCount > 0 && signature !== lastSubmitted;
  const stageWidth = Math.min(availableWidth || STAGE_MAX_WIDTH, STAGE_MAX_WIDTH);
  const { pieceLeft, pieceWidth } = barGeometry(stageWidth, pieces);
  // On success the filled pieces slide together so the share reads as one stretch.
  const shownFilled = solved ? packFilled(pieces, filledCount) : filled;
  const showGuide = solved ? pieces !== target.denominator : hadMiss;
  const message = solved
    ? successMessage(target.id, pieces, filledCount)
    : missEvaluation && signature === lastSubmitted
      ? missMessage(target.id, pieces, filledCount)
      : hadMiss
        ? ADJUST_MESSAGE
        : IDLE_MESSAGE;

  function cut(nextPieces: number) {
    if (locked) {
      return;
    }

    onInteraction?.();
    setPieces(nextPieces);
    setFilled(Array.from({ length: nextPieces }, () => false));
  }

  function toggle(index: number) {
    if (locked) {
      return;
    }

    onInteraction?.();
    setFilled((current) => current.map((isFilled, at) => (at === index ? !isFilled : isFilled)));
  }

  // Big-button alternative to tapping pieces, which get narrow once the bar is cut into
  // eighths. Fill one fills the leftmost empty piece; Empty one empties the rightmost
  // filled piece.
  function fillOne() {
    const index = filled.indexOf(false);
    if (index >= 0) {
      toggle(index);
    }
  }

  function emptyOne() {
    const index = filled.lastIndexOf(true);
    if (index >= 0) {
      toggle(index);
    }
  }

  function check() {
    setLastSubmitted(signature);
    onSubmit({ pieces, filled: filledCount });
  }

  return (
    <View style={styles.panel}>
      <View
        onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
        style={styles.stageWrap}>
        <View style={{ width: stageWidth, height: CUT_BAR_HEIGHT }}>
          <CutBar
            id={`build-bar-${round.id}`}
            width={stageWidth}
            pieces={pieces}
            filled={shownFilled}
            cutProgress={cutProgress}
            guideParts={showGuide ? target.denominator : null}
            guideOpacity={guideOpacity}
            highlight={solved ? { value: target.value, label: target.label } : null}
            numberFilled={solved}
          />
          {shownFilled.map((isFilled, index) => (
            <Pressable
              accessibilityLabel={pieces === 1 ? 'Whole bar' : `Piece ${index + 1} of ${pieces}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isFilled, disabled: locked }}
              disabled={locked}
              key={`hit-${index}`}
              onPress={() => toggle(index)}
              style={[
                styles.pieceHit,
                { left: pieceLeft(index), top: BAR_TOP, width: pieceWidth, height: BAR_HEIGHT },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.adjustRow}>
        <ActionButton
          accessibilityLabel="Empty one piece"
          compact
          disabled={locked || filledCount === 0}
          label="Empty one"
          onPress={emptyOne}
          style={styles.adjustButton}
          variant="secondary"
        />
        <Text accessibilityLiveRegion="polite" style={styles.readout}>
          {pieces === 1
            ? filledCount
              ? 'Whole bar filled'
              : 'Not filled'
            : `${filledCount} of ${pieces} filled`}
        </Text>
        <ActionButton
          accessibilityLabel="Fill one more piece"
          compact
          disabled={locked || filledCount === pieces}
          label="Fill one"
          onPress={fillOne}
          style={styles.adjustButton}
          variant="secondary"
        />
      </View>

      <View style={styles.adjustRow}>
        <ActionButton
          accessibilityLabel="Fewer pieces"
          compact
          disabled={locked || pieces <= 1}
          label="Fewer"
          onPress={() => cut(pieces - 1)}
          style={styles.adjustButton}
          variant="secondary"
        />
        <Text accessibilityLiveRegion="polite" style={styles.cutCount}>
          {pieces === 1 ? 'Not cut yet' : `${pieces} pieces`}
        </Text>
        <ActionButton
          accessibilityLabel="Cut into more pieces"
          compact
          disabled={locked || pieces >= MAX_PIECES}
          label="Cut more"
          onPress={() => cut(pieces + 1)}
          style={styles.adjustButton}
          variant="secondary"
        />
      </View>

      {showMessages ? <MessageArea message={message} /> : null}

      <ActionButton disabled={!canCheck} label="Check" onPress={check} variant="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    width: '100%',
  },
  stageWrap: {
    alignItems: 'center',
    width: '100%',
  },
  pieceHit: {
    borderRadius: radii.sm,
    position: 'absolute',
  },
  readout: {
    color: palette.inkMuted,
    flex: 1,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  adjustRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adjustButton: {
    minWidth: 96,
  },
  cutCount: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.displayFamily,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
