import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { palette, spacing } from '@education/design';
import { ActionButton, CelebrationOverlay } from '@education/ui';
import { getFraction } from '@/features/game/math';
import { DifficultyLevel } from '@/features/game/types';
import { ArcStream, Glass, glassGeometry, tippedLip } from '@/features/pour-lab/glass-art';
import { MessageArea, PourHotspot, TargetCard } from '@/features/pour-lab/lab-chrome';
import { complementLabel, LabMessage, PourDirection } from '@/features/pour-lab/pour-engine';
import { useTween } from '@/features/pour-lab/use-lab-motion';
import { ADJUST_MESSAGE, useLabRounds } from '@/features/pour-lab/use-lab-rounds';
import { usePour } from '@/features/pour-lab/use-pour';

const GLASS_WIDTH = 88;
const GLASS_HEIGHT = 190;
const STAGE_HEIGHT = 276;
const STAGE_MAX_WIDTH = 420;
const FLOOR = STAGE_HEIGHT - 24;
const TIP_ANGLE = 14;

const HINT: LabMessage = {
  title: 'Hold a glass to pour it into the other.',
  tone: 'hint',
};

/**
 * Both glasses are the same size and share one glassful of water, so the new glass and
 * the glass left behind always show a part and the rest of the same whole.
 * `value` is the amount in the right-hand (new) glass.
 */
export function SplitTheGlass({
  difficultyLevel,
  reduceMotion,
}: {
  difficultyLevel: DifficultyLevel;
  reduceMotion: boolean;
}) {
  const lab = useLabRounds('split', difficultyLevel);
  const { value, activeDirection, start, stop, reset } = usePour(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  const solved = lab.phase === 'solved';
  const leftTilt = useTween(activeDirection === 1 ? TIP_ANGLE : 0, 140, reduceMotion);
  const rightTilt = useTween(activeDirection === -1 ? -TIP_ANGLE : 0, 140, reduceMotion);
  const partsOpacity = useTween(lab.partsRevealed ? 1 : 0, 280, reduceMotion);

  if (!lab.round) {
    return <View style={styles.placeholder} />;
  }

  const target = getFraction(lab.round.pourRound.targetFractionId);
  const stageWidth = Math.min(availableWidth || STAGE_MAX_WIDTH, STAGE_MAX_WIDTH);
  const left = glassGeometry({ cx: stageWidth * 0.25, bottom: FLOOR, width: GLASS_WIDTH, height: GLASS_HEIGHT });
  const right = glassGeometry({ cx: stageWidth * 0.75, bottom: FLOOR, width: GLASS_WIDTH, height: GLASS_HEIGHT });
  const leftValue = 1 - value;
  const parts = lab.partsRevealed ? target.denominator : null;
  const pouringRight = activeDirection === 1 && leftValue > 0 && value < 1;
  const pouringLeft = activeDirection === -1 && value > 0 && leftValue < 1;
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
      <TargetCard
        eyebrow={`Round ${lab.round.number}`}
        fraction={target.label}
        caption="of the water into the empty glass"
      />

      <View style={styles.playCard}>
        <CelebrationOverlay visible={solved && !reduceMotion} showMessage={false} />
        <View
          onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
          style={styles.stageWrap}>
          <View style={{ width: stageWidth, height: STAGE_HEIGHT }}>
            <Svg width={stageWidth} height={STAGE_HEIGHT}>
              {[left, right].map((geometry, index) => (
                <Ellipse
                  key={`shadow-${index}`}
                  cx={(geometry.left + geometry.right) / 2}
                  cy={FLOOR + 6}
                  rx={GLASS_WIDTH / 2 + 14}
                  ry={6}
                  fill="rgba(18,53,91,0.08)"
                />
              ))}
              <Glass
                id="split-left"
                cx={(left.left + left.right) / 2}
                bottom={FLOOR}
                width={GLASS_WIDTH}
                height={GLASS_HEIGHT}
                fill={leftValue}
                parts={parts}
                partsOpacity={partsOpacity}
                highlight={
                  solved ? { value: 1 - target.value, label: complementLabel(target.id) } : null
                }
                tilt={leftTilt}
              />
              <Glass
                id="split-right"
                cx={(right.left + right.right) / 2}
                bottom={FLOOR}
                width={GLASS_WIDTH}
                height={GLASS_HEIGHT}
                fill={value}
                parts={parts}
                partsOpacity={partsOpacity}
                highlight={solved ? { value: target.value, label: target.label } : null}
                tilt={rightTilt}
              />
              {pouringRight ? (
                <ArcStream
                  from={tippedLip(left, leftTilt)}
                  to={{ x: right.left + 22, y: right.levelFor(value) }}
                />
              ) : null}
              {pouringLeft ? (
                <ArcStream
                  from={tippedLip(right, rightTilt)}
                  to={{ x: left.right - 22, y: left.levelFor(leftValue) }}
                />
              ) : null}
            </Svg>
            <PourHotspot
              direction={1}
              disabled={solved}
              hint="Hold to pour this glass into the other one. Tap to pour a splash."
              label="Left glass"
              onStart={startPour}
              onStop={stop}
              style={{
                left: left.left - 20,
                top: left.top - 34,
                width: GLASS_WIDTH + 40,
                height: GLASS_HEIGHT + 58,
              }}
            />
            <PourHotspot
              direction={-1}
              disabled={solved}
              hint="Hold to pour this glass back. Tap to pour a splash."
              label="Right glass"
              onStart={startPour}
              onStop={stop}
              style={{
                left: right.left - 20,
                top: right.top - 34,
                width: GLASS_WIDTH + 40,
                height: GLASS_HEIGHT + 58,
              }}
            />
          </View>
        </View>

        <MessageArea message={message} />

        {solved ? (
          <ActionButton
            label="Next round"
            onPress={() => {
              // Empty the glass in the same update as the new round so it never flashes old water.
              reset(0);
              lab.next();
            }}
            variant="primary"
          />
        ) : (
          <ActionButton
            disabled={!canCheck}
            label="Check"
            onPress={() => lab.check(value)}
            variant="primary"
          />
        )}
      </View>
    </View>
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
});
