import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Rect } from 'react-native-svg';

import { palette, spacing } from '@education/design';
import { ActionButton, CelebrationOverlay } from '@education/ui';
import { getFraction } from '@/features/game/math';
import { DifficultyLevel } from '@/features/game/types';
import { FallingStream, Glass, glassGeometry, Pitcher, WATER_COLOR } from '@/features/pour-lab/glass-art';
import { holdPressProps, MessageArea, PourHotspot, TargetCard } from '@/features/pour-lab/lab-chrome';
import { LabMessage, PourDirection } from '@/features/pour-lab/pour-engine';
import { useTween } from '@/features/pour-lab/use-lab-motion';
import { ADJUST_MESSAGE, useLabRounds } from '@/features/pour-lab/use-lab-rounds';
import { usePour } from '@/features/pour-lab/use-pour';

// Three glass heights so a remembered screen position never answers the next round.
const GLASS_HEIGHTS = [140, 175, 210];
const GLASS_WIDTH = 116;
const STAGE_HEIGHT = 344;
const STAGE_MAX_WIDTH = 420;
const FLOOR = STAGE_HEIGHT - 20;
const SPOUT_Y = 18;
const PITCHER_POUR_TILT = 32;

const HINT: LabMessage = {
  title: 'Hold the pitcher to pour. Tap it for a splash.',
  tone: 'hint',
};

export function PourAndPeek({
  difficultyLevel,
  reduceMotion,
}: {
  difficultyLevel: DifficultyLevel;
  reduceMotion: boolean;
}) {
  const lab = useLabRounds('peek', difficultyLevel);
  const { value, activeDirection, start, stop, reset } = usePour(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  const solved = lab.phase === 'solved';
  const pitcherTilt = useTween(activeDirection === 1 ? PITCHER_POUR_TILT : 0, 140, reduceMotion);
  const partsOpacity = useTween(lab.partsRevealed ? 1 : 0, 280, reduceMotion);

  if (!lab.round) {
    return <View style={styles.placeholder} />;
  }

  const target = getFraction(lab.round.pourRound.targetFractionId);
  const stageWidth = Math.min(availableWidth || STAGE_MAX_WIDTH, STAGE_MAX_WIDTH);
  const glassHeight = GLASS_HEIGHTS[lab.round.glassHeightIndex];
  const cx = stageWidth * 0.6;
  const geometry = glassGeometry({ cx, bottom: FLOOR, width: GLASS_WIDTH, height: glassHeight });
  const spoutX = cx - 24;
  const level = geometry.levelFor(value);
  const pouringIn = activeDirection === 1;
  const pouringOut = activeDirection === -1 && value > 0;
  const message =
    lab.message && lab.phase === 'missed' && value !== lab.lastCheckedValue
      ? ADJUST_MESSAGE
      : lab.message ?? HINT;
  const canCheck =
    !solved && activeDirection === null && value > 0 && value !== lab.lastCheckedValue;

  function startPour(direction: PourDirection) {
    if (!solved) {
      start(direction);
    }
  }

  return (
    <View style={styles.column}>
      <TargetCard eyebrow={`Glass ${lab.round.number}`} fraction={target.label} caption="of the glass" />

      <View style={styles.playCard}>
        <CelebrationOverlay visible={solved && !reduceMotion} showMessage={false} />
        <View
          onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
          style={styles.stageWrap}>
          <View style={{ width: stageWidth, height: STAGE_HEIGHT }}>
            <Svg width={stageWidth} height={STAGE_HEIGHT}>
              <Ellipse cx={cx} cy={FLOOR + 6} rx={GLASS_WIDTH / 2 + 16} ry={6} fill="rgba(18,53,91,0.08)" />
              <Spigot x={geometry.right} y={FLOOR - 10} draining={pouringOut} />
              <Glass
                id="peek-glass"
                cx={cx}
                bottom={FLOOR}
                width={GLASS_WIDTH}
                height={glassHeight}
                fill={value}
                parts={lab.partsRevealed ? target.denominator : null}
                partsOpacity={partsOpacity}
                highlight={solved ? { value: target.value, label: target.label } : null}
              />
              {pouringIn ? <FallingStream x={spoutX} from={SPOUT_Y + 2} to={level} /> : null}
              <Pitcher x={spoutX} y={SPOUT_Y} tilt={pitcherTilt} />
            </Svg>
            <PourHotspot
              direction={1}
              disabled={solved}
              hint="Hold to pour into the glass. Tap to add a splash."
              label="Pitcher"
              onStart={startPour}
              onStop={stop}
              style={{ left: spoutX - 134, top: 0, width: 156, height: 124 }}
            />
          </View>
        </View>

        <MessageArea message={message} />

        {solved ? (
          <ActionButton
            label="Next glass"
            onPress={() => {
              // Empty the glass in the same update as the new round so it never flashes old water.
              reset(0);
              lab.next();
            }}
            variant="primary"
          />
        ) : (
          <View style={styles.actionsRow}>
            <ActionButton
              accessibilityHint="Hold to pour some water out. Tap to remove a splash."
              disabled={value <= 0}
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
              onPress={() => lab.check(value)}
              style={styles.actionButton}
              variant="primary"
            />
          </View>
        )}
      </View>
    </View>
  );
}

function Spigot({ x, y, draining }: { x: number; y: number; draining: boolean }) {
  return (
    <G>
      {draining ? (
        <Rect x={x + 13} y={y + 4} width={6} height={FLOOR + 14 - y} rx={3} fill={WATER_COLOR} />
      ) : null}
      <Rect x={x - 2} y={y - 5} width={22} height={10} rx={3} fill={palette.surfaceMuted} stroke={palette.ink} strokeWidth={3} />
      <Rect x={x + 10} y={y - 13} width={6} height={10} rx={2} fill={palette.ink} />
    </G>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.md,
  },
  placeholder: {
    minHeight: STAGE_HEIGHT,
  },
  playCard: {
    backgroundColor: palette.surface,
    borderColor: palette.ring,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    position: 'relative',
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
