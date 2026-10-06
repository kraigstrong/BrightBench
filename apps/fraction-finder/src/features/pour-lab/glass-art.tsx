import React from 'react';
import { ClipPath, Defs, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { palette } from '@education/design';
import { fractionPalette } from '@/design/tokens';

const STROKE = 4;
const CORNER = 12;
const RIM_RY = 7;

export const WATER_COLOR = fractionPalette.water;
export const MARK_COLOR = palette.ink;
export const TARGET_COLOR = palette.coral;

export type GlassHighlight = {
  value: number;
  label: string;
};

type GlassProps = {
  id: string;
  cx: number;
  bottom: number;
  width: number;
  height: number;
  fill: number;
  /** Denominator of the equal parts to draw, or null to keep the glass unmarked. */
  parts: number | null;
  partsOpacity?: number;
  highlight?: GlassHighlight | null;
  /** Degrees, positive is clockwise. The glass pivots on the bottom corner it tips toward. */
  tilt?: number;
};

export function glassGeometry({ cx, bottom, width, height }: Pick<GlassProps, 'cx' | 'bottom' | 'width' | 'height'>) {
  const left = cx - width / 2;
  const right = cx + width / 2;
  const top = bottom - height;

  return { left, right, top, bottom, levelFor: (value: number) => bottom - height * value };
}

export function glassPivot(geometry: ReturnType<typeof glassGeometry>, tilt: number) {
  return { x: tilt >= 0 ? geometry.right : geometry.left, y: geometry.bottom };
}

/** Where the lip on the pouring side ends up once the glass is tipped. */
export function tippedLip(geometry: ReturnType<typeof glassGeometry>, tilt: number) {
  const pivot = glassPivot(geometry, tilt);
  const radians = (tilt * Math.PI) / 180;
  const dy = geometry.top - pivot.y;

  return { x: pivot.x - dy * Math.sin(radians), y: pivot.y + dy * Math.cos(radians) };
}

export function Glass({
  id,
  cx,
  bottom,
  width,
  height,
  fill,
  parts,
  partsOpacity = 1,
  highlight,
  tilt = 0,
}: GlassProps) {
  const geometry = glassGeometry({ cx, bottom, width, height });
  const { left, right, top } = geometry;
  const pivot = glassPivot(geometry, tilt);
  const transform = tilt ? `rotate(${tilt} ${pivot.x} ${pivot.y})` : undefined;
  const level = geometry.levelFor(Math.min(1, Math.max(0, fill)));
  const outline = [
    `M ${left} ${top}`,
    `L ${left} ${bottom - CORNER}`,
    `Q ${left} ${bottom} ${left + CORNER} ${bottom}`,
    `L ${right - CORNER} ${bottom}`,
    `Q ${right} ${bottom} ${right} ${bottom - CORNER}`,
    `L ${right} ${top}`,
  ].join(' ');
  const markLevels =
    parts && parts > 1
      ? Array.from({ length: parts - 1 }, (_, index) => geometry.levelFor((index + 1) / parts))
      : [];

  return (
    <G>
      <Defs>
        <ClipPath id={`${id}-inside`}>
          <Rect
            x={left + STROKE / 2}
            y={top - 40}
            width={width - STROKE}
            height={height + 40 - STROKE / 2}
            rx={CORNER - 2}
            transform={transform}
          />
        </ClipPath>
      </Defs>

      {fill > 0 ? (
        <G clipPath={`url(#${id}-inside)`}>
          {/* Water stays level in world space while the glass tips. */}
          <Rect
            x={left - height}
            y={level}
            width={width + height * 2}
            height={height + 80}
            fill={WATER_COLOR}
          />
          <Line
            x1={left - height}
            y1={level + 1}
            x2={right + height}
            y2={level + 1}
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={2}
          />
        </G>
      ) : null}

      <G transform={transform}>
        <Rect x={left + 9} y={top + 14} width={8} height={height - 30} rx={4} fill="rgba(255,255,255,0.4)" />

        {markLevels.map((y, index) => (
          <G key={`mark-${index}`} opacity={partsOpacity}>
            <Line
              x1={left + 8}
              y1={y}
              x2={right - 8}
              y2={y}
              stroke={MARK_COLOR}
              strokeOpacity={0.5}
              strokeWidth={2}
              strokeDasharray="7 5"
            />
            <Line x1={left - 12} y1={y} x2={left - 3} y2={y} stroke={MARK_COLOR} strokeWidth={3} strokeLinecap="round" />
          </G>
        ))}

        {highlight && parts ? (
          <PartNumbers geometry={geometry} parts={parts} count={Math.round(highlight.value * parts)} />
        ) : null}
        {highlight ? <TargetLine geometry={geometry} highlight={highlight} /> : null}

        <Path d={outline} fill="none" stroke={palette.ink} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round" />
        <Ellipse
          cx={cx}
          cy={top}
          rx={width / 2}
          ry={RIM_RY}
          fill="rgba(255,255,255,0.5)"
          stroke={palette.ink}
          strokeWidth={STROKE}
        />
      </G>
    </G>
  );
}

/** Counts the equal parts under the target line so "2 of 3 parts" can be read off the glass. */
function PartNumbers({
  geometry,
  parts,
  count,
}: {
  geometry: ReturnType<typeof glassGeometry>;
  parts: number;
  count: number;
}) {
  return (
    <G>
      {Array.from({ length: count }, (_, index) => (
        <SvgText
          key={`part-${index}`}
          x={geometry.right - 15}
          y={geometry.levelFor((index + 0.5) / parts) + 5}
          fill={palette.ink}
          fillOpacity={0.7}
          fontSize={14}
          fontWeight="700"
          textAnchor="middle">
          {index + 1}
        </SvgText>
      ))}
    </G>
  );
}

function TargetLine({
  geometry,
  highlight,
}: {
  geometry: ReturnType<typeof glassGeometry>;
  highlight: GlassHighlight;
}) {
  const y = geometry.levelFor(highlight.value);
  const center = (geometry.left + geometry.right) / 2;
  const pillWidth = 48;
  const pillHeight = 26;
  const roomAbove = y - geometry.top;
  const pillY = roomAbove > pillHeight + 12 ? y - pillHeight - 6 : y + 6;

  return (
    <G>
      <Line
        x1={geometry.left + 4}
        y1={y}
        x2={geometry.right - 4}
        y2={y}
        stroke={TARGET_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Rect
        x={center - pillWidth / 2}
        y={pillY}
        width={pillWidth}
        height={pillHeight}
        rx={pillHeight / 2}
        fill={palette.surface}
        stroke={TARGET_COLOR}
        strokeWidth={2}
      />
      <SvgText
        x={center}
        y={pillY + pillHeight / 2 + 6}
        fill={palette.ink}
        fontSize={17}
        fontWeight="700"
        textAnchor="middle">
        {highlight.label}
      </SvgText>
    </G>
  );
}

export function FallingStream({ x, from, to }: { x: number; from: number; to: number }) {
  if (to <= from) {
    return null;
  }

  return (
    <G>
      <Rect x={x - 4.5} y={from} width={9} height={to - from} rx={4.5} fill={WATER_COLOR} />
      <Ellipse cx={x} cy={to} rx={14} ry={4} fill="rgba(255,255,255,0.7)" />
    </G>
  );
}

export function ArcStream({
  from,
  to,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 36 };

  return (
    <G>
      <Path
        d={`M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`}
        fill="none"
        stroke={WATER_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <Ellipse cx={to.x} cy={to.y} rx={12} ry={3.5} fill="rgba(255,255,255,0.7)" />
    </G>
  );
}

/** A jug whose spout tip sits at (x, y); it rotates around that tip so the stream origin never moves. */
export function Pitcher({ x, y, tilt }: { x: number; y: number; tilt: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <Path
        d="M -96 22 C -126 24 -126 62 -95 64"
        fill="none"
        stroke={palette.ink}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Path
        d="M 0 0 L -16 8 L -92 8 Q -98 8 -98 16 L -96 72 Q -95 82 -85 82 L -24 82 Q -14 82 -14 72 L -14 22 Z"
        fill={palette.surface}
        stroke={palette.ink}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path
        d="M -95 36 L -16 36 L -16 70 Q -16 78 -24 78 L -86 78 Q -93.5 78 -94 70 Z"
        fill={WATER_COLOR}
      />
    </G>
  );
}
