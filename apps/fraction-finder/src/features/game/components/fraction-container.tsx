import React from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, Line, Rect } from 'react-native-svg';

import { palette } from '@education/design';
import { fractionPalette } from '@/design/tokens';

type FractionContainerProps = {
  fillRatio: number;
  width?: number;
  height?: number;
  fillColor?: string;
};

export function FractionContainer({
  fillRatio,
  width = 180,
  height = 260,
  fillColor = fractionPalette.sky,
}: FractionContainerProps) {
  const safeFill = Math.min(1, Math.max(0, fillRatio));
  const inset = 30;
  const rimHeight = 18;
  const strokeWidth = 4;
  const glassLeft = inset;
  const glassRight = width - inset;
  const glassWidth = glassRight - glassLeft;
  const bodyTop = 22;
  const bodyBottom = height - 20;
  const bodyHeight = bodyBottom - bodyTop;
  const fillTop = bodyBottom - bodyHeight * safeFill;
  const innerLeft = glassLeft + strokeWidth;
  const innerWidth = glassWidth - strokeWidth * 2;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id="glass-body">
            <Rect x={innerLeft} y={bodyTop} width={innerWidth} height={bodyHeight} />
          </ClipPath>
        </Defs>

        <Rect
          x={innerLeft}
          y={fillTop}
          width={innerWidth}
          height={bodyBottom - fillTop}
          fill={fillColor}
          clipPath="url(#glass-body)"
        />
        <Ellipse
          cx={width / 2}
          cy={bodyBottom}
          rx={innerWidth / 2}
          ry={rimHeight / 2 - 2}
          fill={fillColor}
          opacity={0.9}
          clipPath="url(#glass-body)"
        />
        {safeFill > 0 ? (
          <Ellipse
            cx={width / 2}
            cy={fillTop}
            rx={innerWidth / 2}
            ry={rimHeight / 2 - 2}
            fill={fillColor}
            opacity={0.95}
            clipPath="url(#glass-body)"
          />
        ) : null}

        <Rect
          x={glassLeft + 10}
          y={bodyTop + 14}
          width={10}
          height={bodyHeight - 28}
          rx={6}
          fill="rgba(255,255,255,0.32)"
        />

        <Line
          x1={glassLeft}
          y1={bodyTop}
          x2={glassLeft}
          y2={bodyBottom}
          stroke={palette.ink}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1={glassRight}
          y1={bodyTop}
          x2={glassRight}
          y2={bodyBottom}
          stroke={palette.ink}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Ellipse
          cx={width / 2}
          cy={bodyTop}
          rx={glassWidth / 2}
          ry={rimHeight / 2}
          fill="rgba(255,255,255,0.58)"
          stroke={palette.ink}
          strokeWidth={strokeWidth}
        />
        <Ellipse
          cx={width / 2}
          cy={bodyBottom}
          rx={glassWidth / 2}
          ry={rimHeight / 2}
          fill="rgba(255,255,255,0.08)"
          stroke={palette.ink}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}
