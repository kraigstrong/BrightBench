import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import { ActionButton } from '@education/ui';
import { MessageArea, PanelMessage } from '@/features/game/components/panel-message';
import {
  ADJUST_MESSAGE,
  hopSizeLabel,
  hopsLabel,
  MAX_HOP_PARTS,
  missMessage,
  successMessage,
} from '@/features/game/line/hop-engine';
import {
  FROG_HIT_RISE,
  FROG_HIT_SIZE,
  HOP_LINE_HEIGHT,
  HopLine,
  LINE_Y,
  lineGeometry,
} from '@/features/game/line/hop-line';
import { getFraction } from '@/features/game/math';
import { LineAnswer, LineRound, RoundEvaluation } from '@/features/game/types';
import { useReduceMotion } from '@/lib/use-reduce-motion';
import { usePlayOnChange, useTween } from '@/lib/use-tween';

const STAGE_MAX_WIDTH = 520;
// How far the line reaches into the card's side padding.
const STAGE_BLEED = 16;
const HOP_MS = 260;
const IDLE_MESSAGE: PanelMessage = { title: '', tone: 'hint' };

type HopPanelProps = {
  round: LineRound;
  onSubmit: (answer: LineAnswer) => void;
  disabled: boolean;
  onInteraction?: () => void;
  /** The latest wrong answer for this round. Once one arrives, the flag and guide marks stay. */
  missEvaluation?: RoundEvaluation | null;
  /** The round was answered correctly: label the landing spot and number the hops. */
  solved?: boolean;
  /** The message line under the line. The challenge hides it to fit its non-scrolling screen. */
  showMessages?: boolean;
};

/**
 * Hop It: a frog starts at 0. The child splits each whole into equal hops and hops the
 * frog to the target, so the hop size is the denominator and the hop count is the
 * numerator. Any exact landing counts, so 6 eighth-hops makes 3/4. Hosts key this panel
 * by round so each round starts back at 0 with whole hops.
 */
export function HopPanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
  missEvaluation = null,
  solved = false,
  showMessages = true,
}: HopPanelProps) {
  const [parts, setParts] = useState(1);
  const [hops, setHops] = useState(0);
  // Changing the hop size sends the frog straight back to 0 instead of hopping there.
  const [snapBack, setSnapBack] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [hadMiss, setHadMiss] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);
  const reduceMotion = useReduceMotion();

  if (missEvaluation && !hadMiss) {
    setHadMiss(true);
  }

  const frogAt = useTween(hops, HOP_MS, reduceMotion || snapBack);
  const marksProgress = usePlayOnChange(parts, 220, reduceMotion);
  const guideOpacity = useTween(solved || hadMiss ? 1 : 0, 280, reduceMotion);

  const target = getFraction(round.targetFractionId);
  const locked = disabled || solved;
  const maxHops = parts * round.lineMax;
  const signature = `${parts}:${hops}`;
  const canCheck = !locked && hops > 0 && signature !== lastSubmitted;
  const stageWidth = Math.min(availableWidth || STAGE_MAX_WIDTH, STAGE_MAX_WIDTH);
  const { xForHops } = lineGeometry(stageWidth, round.lineMax, parts);
  const showGuide = solved ? parts !== target.denominator : hadMiss;
  const message = solved
    ? successMessage(target.id, parts, hops)
    : missEvaluation && signature === lastSubmitted
      ? missMessage(target.id, parts, hops)
      : hadMiss
        ? ADJUST_MESSAGE
        : IDLE_MESSAGE;

  function resize(nextParts: number) {
    if (locked) {
      return;
    }

    onInteraction?.();
    setSnapBack(true);
    setParts(nextParts);
    setHops(0);
  }

  function hopBy(step: 1 | -1) {
    const next = hops + step;
    if (locked || next < 0 || next > maxHops) {
      return;
    }

    onInteraction?.();
    setSnapBack(false);
    setHops(next);
  }

  function check() {
    setLastSubmitted(signature);
    onSubmit({ parts, hops });
  }

  return (
    <View style={styles.panel}>
      <View
        onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
        style={styles.stageWrap}>
        <View
          accessibilityLabel={`Number line from 0 to ${round.lineMax}`}
          accessibilityRole="image"
          style={{ width: stageWidth, height: HOP_LINE_HEIGHT }}>
          <HopLine
            width={stageWidth}
            lineMax={round.lineMax}
            parts={parts}
            hops={hops}
            frogAt={frogAt}
            marksProgress={marksProgress}
            guideParts={showGuide ? target.denominator : null}
            guideOpacity={guideOpacity}
            flagValue={hadMiss ? target.value : null}
            solvedLabel={solved ? target.label : null}
          />
          {/* Tapping the frog hops it too. The Hop button is the accessible control. */}
          <Pressable
            accessible={false}
            disabled={locked || hops >= maxHops}
            focusable={false}
            onPress={() => hopBy(1)}
            tabIndex={-1}
            style={[
              styles.frogHit,
              {
                left: xForHops(frogAt) - FROG_HIT_SIZE / 2,
                top: LINE_Y - FROG_HIT_RISE,
              },
            ]}
            testID="frog"
          />
        </View>
      </View>

      <View style={styles.controlRow}>
        <ActionButton
          accessibilityLabel="Bigger hops"
          compact
          disabled={locked || parts <= 1}
          label="Bigger"
          onPress={() => resize(parts - 1)}
          style={styles.controlButton}
          variant="secondary"
        />
        <View accessibilityLiveRegion="polite" style={styles.controlCenter}>
          <Text style={styles.controlCaption}>each hop</Text>
          <Text style={styles.controlValue}>{hopSizeLabel(parts)}</Text>
        </View>
        <ActionButton
          accessibilityLabel="Smaller hops"
          compact
          disabled={locked || parts >= MAX_HOP_PARTS}
          label="Smaller"
          onPress={() => resize(parts + 1)}
          style={styles.controlButton}
          variant="secondary"
        />
      </View>

      <View style={styles.controlRow}>
        <ActionButton
          accessibilityLabel="Hop back"
          compact
          disabled={locked || hops <= 0}
          label="Back"
          onPress={() => hopBy(-1)}
          style={styles.controlButton}
          variant="secondary"
        />
        <Text accessibilityLiveRegion="polite" style={[styles.controlCenter, styles.controlValue]}>
          {hops === 0 ? 'At 0' : hopsLabel(hops)}
        </Text>
        <ActionButton
          accessibilityLabel="Hop forward"
          compact
          disabled={locked || hops >= maxHops}
          label="Hop"
          onPress={() => hopBy(1)}
          style={styles.controlButton}
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
  // Runs the line past the card's padding so eighths on a 0-2 line stay distinct.
  stageWrap: {
    alignItems: 'center',
    marginHorizontal: -STAGE_BLEED,
  },
  frogHit: {
    height: FROG_HIT_SIZE,
    position: 'absolute',
    width: FROG_HIT_SIZE,
  },
  controlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    minWidth: 96,
  },
  controlCenter: {
    alignItems: 'center',
    flex: 1,
    textAlign: 'center',
  },
  controlCaption: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  controlValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 18,
    fontWeight: '700',
  },
});
