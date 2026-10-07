import React from 'react';
import Svg, { ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { palette } from '@education/design';
import { fractionPalette } from '@/design/tokens';

export const BAR_PAD_X = 10;
export const BAR_TOP = 46;
export const BAR_HEIGHT = 78;
// Room below the bar for the dashed guide lines, which run 10 past its bottom edge.
export const CUT_BAR_HEIGHT = BAR_TOP + BAR_HEIGHT + 12;

const BAR_RADIUS = 22;
const FILL_COLOR = fractionPalette.accent;
const GUIDE_COLOR = palette.coral;

export function barGeometry(width: number, pieces: number) {
  const left = BAR_PAD_X;
  const barWidth = Math.max(0, width - BAR_PAD_X * 2);
  const pieceWidth = barWidth / pieces;

  return {
    left,
    barWidth,
    pieceWidth,
    pieceLeft: (index: number) => left + pieceWidth * index,
  };
}

type CutBarProps = {
  width: number;
  pieces: number;
  filled: boolean[];
  /** 0..1: how far the cut lines have slid down into the bar. */
  cutProgress: number;
  /** Denominator to draw as dashed guide lines, or null for none. */
  guideParts: number | null;
  guideOpacity: number;
  /** Labels the filled stretch from the left edge, e.g. "3/4". */
  highlight: { value: number; label: string } | null;
  numberFilled: boolean;
  id: string;
};

export function CutBar({
  width,
  pieces,
  filled,
  cutProgress,
  guideParts,
  guideOpacity,
  highlight,
  numberFilled,
  id,
}: CutBarProps) {
  const { left, barWidth, pieceWidth, pieceLeft } = barGeometry(width, pieces);
  const bottom = BAR_TOP + BAR_HEIGHT;
  let filledNumber = 0;

  return (
    <Svg width={width} height={CUT_BAR_HEIGHT}>
      <Defs>
        <ClipPath id={`${id}-bar`}>
          <Rect x={left} y={BAR_TOP} width={barWidth} height={BAR_HEIGHT} rx={BAR_RADIUS} />
        </ClipPath>
      </Defs>

      <G clipPath={`url(#${id}-bar)`}>
        <Rect x={left} y={BAR_TOP} width={barWidth} height={BAR_HEIGHT} fill={palette.white} />
        {filled.map((isFilled, index) => {
          if (!isFilled) {
            return null;
          }

          filledNumber += 1;
          const x = pieceLeft(index);

          return (
            <G key={`piece-${index}`}>
              <Rect x={x} y={BAR_TOP} width={pieceWidth} height={BAR_HEIGHT} fill={FILL_COLOR} />
              {numberFilled && pieceWidth >= 22 ? (
                <SvgText
                  x={x + pieceWidth / 2}
                  y={BAR_TOP + BAR_HEIGHT / 2 + 6}
                  fill={palette.white}
                  fontSize={17}
                  fontWeight="700"
                  textAnchor="middle">
                  {filledNumber}
                </SvgText>
              ) : null}
            </G>
          );
        })}
        {Array.from({ length: pieces - 1 }, (_, index) => {
          const x = pieceLeft(index + 1);
          return (
            <Line
              key={`cut-${index}`}
              x1={x}
              y1={BAR_TOP}
              x2={x}
              y2={BAR_TOP + BAR_HEIGHT * cutProgress}
              stroke={palette.ink}
              strokeOpacity={0.75}
              strokeWidth={3}
            />
          );
        })}
      </G>

      <Rect
        x={left}
        y={BAR_TOP}
        width={barWidth}
        height={BAR_HEIGHT}
        rx={BAR_RADIUS}
        fill="none"
        stroke={palette.ink}
        strokeWidth={3}
      />

      {guideParts && guideParts > 1 ? (
        <G opacity={guideOpacity}>
          {Array.from({ length: guideParts - 1 }, (_, index) => {
            const x = left + (barWidth * (index + 1)) / guideParts;
            return (
              <Line
                key={`guide-${index}`}
                x1={x}
                y1={BAR_TOP - 10}
                x2={x}
                y2={bottom + 10}
                stroke={GUIDE_COLOR}
                strokeWidth={3}
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
            );
          })}
        </G>
      ) : null}

      {highlight ? <Bracket left={left} right={left + barWidth * highlight.value} label={highlight.label} /> : null}
    </Svg>
  );
}

function Bracket({ left, right, label }: { left: number; right: number; label: string }) {
  const y = BAR_TOP - 10;
  const pillWidth = 48;
  const pillHeight = 26;
  const center = (left + right) / 2;

  return (
    <G>
      <Path
        d={`M ${left + 2} ${y + 6} V ${y} H ${right - 2} V ${y + 6}`}
        fill="none"
        stroke={GUIDE_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x={center - pillWidth / 2}
        y={y - pillHeight - 4}
        width={pillWidth}
        height={pillHeight}
        rx={pillHeight / 2}
        fill={palette.surface}
        stroke={GUIDE_COLOR}
        strokeWidth={2}
      />
      <SvgText
        x={center}
        y={y - pillHeight / 2 + 2}
        fill={palette.ink}
        fontSize={17}
        fontWeight="700"
        textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}
