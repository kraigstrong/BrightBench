import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Ellipse, G, Rect } from 'react-native-svg';

import { palette, spacing } from '@education/design';
import { ActionButton } from '@education/ui';
import { clamp, getFraction } from '@/features/game/math';
import { FallingStream, Glass, glassGeometry, Pitcher, WATER_COLOR } from '@/features/game/pour/glass-art';
import { holdPressProps, MessageArea, PourHotspot } from '@/features/game/pour/pour-controls';
import {
  ADJUST_MESSAGE,
  GLASS_HEIGHT_SCALES,
  missMessage,
  nextGlassHeightIndex,
  PourDirection,
  PourMessage,
  successMessage,
} from '@/features/game/pour/pour-engine';
import { useTween } from '@/features/game/pour/use-motion';
import { usePour } from '@/features/game/pour/use-pour';
import { PourRound, RoundEvaluation } from '@/features/game/types';
import { useReduceMotion } from '@/lib/use-reduce-motion';

const GLASS_WIDTH = 116;
const STAGE_MAX_WIDTH = 420;
// The challenge screen does not scroll, so the stage shrinks with short windows.
const STAGE_MIN_HEIGHT = 240;
const STAGE_MAX_HEIGHT = 344;
const STAGE_WINDOW_SHARE = 0.38;
const FLOOR_INSET = 20;
const SPOUT_Y = 18;
// Room the pitcher needs above the tallest glass.
const PITCHER_CLEARANCE = 110;
const PITCHER_POUR_TILT = 32;

const IDLE_MESSAGE: PourMessage = { title: '', tone: 'hint' };

type PourPanelProps = {
  round: PourRound;
  onSubmit: (value: number) => void;
  disabled: boolean;
  onInteraction?: () => void;
  /** The latest wrong answer for this round. Once one arrives, the equal parts stay visible. */
  missEvaluation?: RoundEvaluation | null;
  /** The round was answered correctly: label the target and number its parts. */
  solved?: boolean;
  /**
   * The message line under the glass. The challenge hides it: it never shows misses
   * there, the glass label already says the answer, and its screen cannot scroll.
   */
  showMessages?: boolean;
};

/**
 * Pour & Peek: hold the pitcher to pour into an unmarked glass, check, and only then see
 * the glass split into equal parts. Hosts key this panel by round so each round starts empty.
 */
export function PourPanel({
  round,
  onSubmit,
  disabled,
  onInteraction,
  missEvaluation = null,
  solved = false,
  showMessages = true,
}: PourPanelProps) {
  const { value, activeDirection, start, stop } = usePour(0);
  const [glassHeightIndex] = useState(nextGlassHeightIndex);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);
  const [hadMiss, setHadMiss] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const reduceMotion = useReduceMotion();

  if (missEvaluation && !hadMiss) {
    setHadMiss(true);
  }

  useEffect(() => {
    // Never keep pouring once the round is locked (answered, advancing, or time is up).
    if (disabled || solved) {
      stop();
    }
  }, [disabled, solved, stop]);

  const partsRevealed = solved || hadMiss;
  const pitcherTilt = useTween(activeDirection === 1 ? PITCHER_POUR_TILT : 0, 140, reduceMotion);
  const partsOpacity = useTween(partsRevealed ? 1 : 0, 280, reduceMotion);

  const target = getFraction(round.targetFractionId);
  const locked = disabled || solved;
  const stageWidth = Math.min(availableWidth || STAGE_MAX_WIDTH, STAGE_MAX_WIDTH);
  const stageHeight = Math.round(
    clamp(windowHeight * STAGE_WINDOW_SHARE, STAGE_MIN_HEIGHT, STAGE_MAX_HEIGHT)
  );
  const floor = stageHeight - FLOOR_INSET;
  const glassHeight = Math.round(
    (floor - PITCHER_CLEARANCE) * GLASS_HEIGHT_SCALES[glassHeightIndex]
  );
  const cx = stageWidth * 0.6;
  const geometry = glassGeometry({ cx, bottom: floor, width: GLASS_WIDTH, height: glassHeight });
  const spoutX = cx - 24;
  const pouringIn = activeDirection === 1;
  const pouringOut = activeDirection === -1 && value > 0;
  const canCheck = !locked && activeDirection === null && value > 0 && value !== lastSubmitted;
  const message = solved
    ? successMessage(target.id)
    : missEvaluation && value === lastSubmitted
      ? missMessage(target.id, value, missEvaluation)
      : hadMiss
        ? ADJUST_MESSAGE
        : IDLE_MESSAGE;

  function startPour(direction: PourDirection) {
    if (!locked) {
      onInteraction?.();
      start(direction);
    }
  }

  function check() {
    setLastSubmitted(value);
    onSubmit(value);
  }

  return (
    <View style={styles.panel}>
      <View
        onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
        style={styles.stageWrap}>
        <View style={{ width: stageWidth, height: stageHeight }}>
          <Svg width={stageWidth} height={stageHeight}>
            <Ellipse cx={cx} cy={floor + 6} rx={GLASS_WIDTH / 2 + 16} ry={6} fill="rgba(18,53,91,0.08)" />
            <Spigot x={geometry.right} y={floor - 10} floor={floor} draining={pouringOut} />
            <Glass
              id={`pour-glass-${round.id}`}
              cx={cx}
              bottom={floor}
              width={GLASS_WIDTH}
              height={glassHeight}
              fill={value}
              parts={partsRevealed ? target.denominator : null}
              partsOpacity={partsOpacity}
              highlight={solved ? { value: target.value, label: target.label } : null}
            />
            {pouringIn ? (
              <FallingStream x={spoutX} from={SPOUT_Y + 2} to={geometry.levelFor(value)} />
            ) : null}
            <Pitcher x={spoutX} y={SPOUT_Y} tilt={pitcherTilt} />
          </Svg>
          <PourHotspot
            direction={1}
            disabled={locked}
            hint="Hold to pour into the glass. Tap to add a splash."
            label="Pitcher"
            onStart={startPour}
            onStop={stop}
            style={{ left: spoutX - 134, top: 0, width: 156, height: 124 }}
          />
        </View>
      </View>

      {showMessages ? <MessageArea message={message} /> : null}

      <View style={styles.actionsRow}>
        <ActionButton
          accessibilityHint="Hold to pour some water out. Tap to remove a splash."
          disabled={locked || value <= 0}
          {...holdPressProps}
          label="Pour out"
          onPressIn={() => startPour(-1)}
          onPressOut={() => stop(-1)}
          style={styles.actionButton}
          variant="secondary"
        />
        <ActionButton
          disabled={!canCheck}
          label="Check"
          onPress={check}
          style={styles.actionButton}
          variant="primary"
        />
      </View>
    </View>
  );
}

function Spigot({
  x,
  y,
  floor,
  draining,
}: {
  x: number;
  y: number;
  floor: number;
  draining: boolean;
}) {
  return (
    <G>
      {draining ? (
        <Rect x={x + 13} y={y + 4} width={6} height={floor + 14 - y} rx={3} fill={WATER_COLOR} />
      ) : null}
      <Rect
        x={x - 2}
        y={y - 5}
        width={22}
        height={10}
        rx={3}
        fill={palette.surfaceMuted}
        stroke={palette.ink}
        strokeWidth={3}
      />
      <Rect x={x + 10} y={y - 13} width={6} height={10} rx={2} fill={palette.ink} />
    </G>
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
