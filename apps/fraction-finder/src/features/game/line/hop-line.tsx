import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { palette } from '@education/design';
import { fractionPalette } from '@/design/tokens';

// Room on each side so the frog fits at 0 and at the far end.
export const LINE_PAD_X = 22;
// Space above the line for the frog's jump, the hop numbers, and the success label.
export const LINE_Y = 82;
export const HOP_LINE_HEIGHT = LINE_Y + 40;

// Where the frog's hit area sits, relative to its feet.
export const FROG_HIT_SIZE = 60;
export const FROG_HIT_RISE = 44;

const TRAIL_COLOR = fractionPalette.accent;
const GUIDE_COLOR = palette.coral;
const FROG_COLOR = palette.confettiMint;
const MAX_ARC_HEIGHT = 22;
// One row for the hop numbers: under the success label, above the frog's eyes.
const NUMBER_Y = LINE_Y - 35;

export function lineGeometry(width: number, lineMax: number, parts: number) {
  const left = LINE_PAD_X;
  const length = Math.max(0, width - LINE_PAD_X * 2);
  const hopWidth = length / (lineMax * parts);

  return {
    left,
    length,
    hopWidth,
    /** x for a position measured in hops from 0 (may be fractional mid-jump). */
    xForHops: (hops: number) => left + hopWidth * hops,
    xForValue: (value: number) => left + (length * value) / lineMax,
    arcHeight: Math.min(MAX_ARC_HEIGHT, hopWidth * 0.45),
  };
}

type HopLineProps = {
  width: number;
  lineMax: number;
  parts: number;
  /** Hops taken so far. */
  hops: number;
  /** The frog's position in hops, animated between whole hops while it jumps. */
  frogAt: number;
  /** 0..1: how far the hop marks have grown in after the hop size changed. */
  marksProgress: number;
  /** Denominator to draw as dashed guide marks, or null for none. */
  guideParts: number | null;
  guideOpacity: number;
  /** The true spot, shown after a miss. */
  flagValue: number | null;
  /** Labels the landing spot and numbers the hops. */
  solvedLabel: string | null;
};

export function HopLine({
  width,
  lineMax,
  parts,
  hops,
  frogAt,
  marksProgress,
  guideParts,
  guideOpacity,
  flagValue,
  solvedLabel,
}: HopLineProps) {
  const { left, length, hopWidth, xForHops, xForValue, arcHeight } = lineGeometry(width, lineMax, parts);
  const right = left + length;
  const totalHops = lineMax * parts;
  // Only hops the frog has finished leave a trail.
  const trailCount = Math.min(hops, Math.floor(frogAt + 1e-6));
  const jump = frogAt - Math.floor(frogAt);
  const lift = Math.sin(Math.PI * jump) * (arcHeight + 8);
  const markHalf = 8 * marksProgress;

  return (
    <Svg width={width} height={HOP_LINE_HEIGHT}>
      <Line
        x1={left}
        y1={LINE_Y}
        x2={right}
        y2={LINE_Y}
        stroke={palette.ink}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {parts > 1
        ? Array.from({ length: totalHops - 1 }, (_, index) => {
            const step = index + 1;
            if (step % parts === 0) {
              return null;
            }
            const x = xForHops(step);
            return (
              <Line
                key={`mark-${step}`}
                x1={x}
                y1={LINE_Y - markHalf}
                x2={x}
                y2={LINE_Y + markHalf}
                stroke={palette.ink}
                strokeOpacity={0.7}
                strokeWidth={2.5}
              />
            );
          })
        : null}

      {Array.from({ length: lineMax + 1 }, (_, whole) => {
        const x = xForValue(whole);
        return (
          <G key={`whole-${whole}`}>
            <Line x1={x} y1={LINE_Y - 13} x2={x} y2={LINE_Y + 13} stroke={palette.ink} strokeWidth={3} strokeLinecap="round" />
            <SvgText
              x={x}
              y={LINE_Y + 34}
              fill={palette.ink}
              fontSize={18}
              fontWeight="700"
              textAnchor="middle">
              {String(whole)}
            </SvgText>
          </G>
        );
      })}

      {guideParts && guideParts > 1 ? (
        <G opacity={guideOpacity}>
          {Array.from({ length: lineMax * guideParts - 1 }, (_, index) => {
            const step = index + 1;
            if (step % guideParts === 0) {
              return null;
            }
            const x = xForValue(step / guideParts);
            return (
              <Line
                key={`guide-${step}`}
                x1={x}
                y1={LINE_Y - 20}
                x2={x}
                y2={LINE_Y + 18}
                stroke={GUIDE_COLOR}
                strokeWidth={3}
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
            );
          })}
        </G>
      ) : null}

      {flagValue !== null && !solvedLabel ? (
        <Flag x={xForValue(flagValue)} opacity={guideOpacity} />
      ) : null}

      {Array.from({ length: trailCount }, (_, index) => {
        const x0 = xForHops(index);
        const x1 = xForHops(index + 1);
        const y0 = LINE_Y - 5;
        return (
          <G key={`hop-${index}`}>
            <Path
              d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${y0 - arcHeight * 2} ${x1} ${y0}`}
              fill="none"
              stroke={TRAIL_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {solvedLabel && hopWidth >= 18 ? (
              <SvgText
                x={(x0 + x1) / 2}
                y={NUMBER_Y}
                fill={TRAIL_COLOR}
                fontSize={13}
                fontWeight="700"
                textAnchor="middle">
                {String(index + 1)}
              </SvgText>
            ) : null}
          </G>
        );
      })}

      <Frog x={xForHops(frogAt)} y={LINE_Y - 2 - lift} />

      {solvedLabel ? <LandingLabel x={xForHops(hops)} label={solvedLabel} /> : null}
    </Svg>
  );
}

/** A small round frog whose feet sit at (x, y). */
function Frog({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={y - 11} rx={17} ry={12} fill={FROG_COLOR} stroke={palette.ink} strokeWidth={2.5} />
      <Circle cx={x - 8} cy={y - 23} r={6} fill={palette.white} stroke={palette.ink} strokeWidth={2} />
      <Circle cx={x + 8} cy={y - 23} r={6} fill={palette.white} stroke={palette.ink} strokeWidth={2} />
      <Circle cx={x - 7} cy={y - 23} r={2.5} fill={palette.ink} />
      <Circle cx={x + 9} cy={y - 23} r={2.5} fill={palette.ink} />
      <Path
        d={`M ${x - 6} ${y - 10} Q ${x} ${y - 5} ${x + 6} ${y - 10}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </G>
  );
}

function Flag({ x, opacity }: { x: number; opacity: number }) {
  const top = LINE_Y - 50;
  return (
    <G opacity={opacity}>
      <Line x1={x} y1={LINE_Y} x2={x} y2={top} stroke={palette.ink} strokeWidth={2.5} strokeLinecap="round" />
      <Path d={`M ${x} ${top} L ${x + 22} ${top + 7} L ${x} ${top + 14} Z`} fill={GUIDE_COLOR} />
    </G>
  );
}

function LandingLabel({ x, label }: { x: number; label: string }) {
  const pillWidth = 52;
  const pillHeight = 26;
  const top = LINE_Y - 78;

  return (
    <G>
      <Rect
        x={x - pillWidth / 2}
        y={top}
        width={pillWidth}
        height={pillHeight}
        rx={pillHeight / 2}
        fill={palette.surface}
        stroke={GUIDE_COLOR}
        strokeWidth={2}
      />
      <SvgText
        x={x}
        y={top + pillHeight / 2 + 6}
        fill={palette.ink}
        fontSize={17}
        fontWeight="700"
        textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}
