import React from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, Line, Path, Rect } from 'react-native-svg';

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
  // Strokes are centered on the outline; the "inner" edge is half a stroke in.
  // Using a full stroke inset here leaves a visible gap at the bottom.
  const innerInset = strokeWidth / 2;
  const innerLeft = glassLeft + innerInset;
  const innerWidth = glassWidth - innerInset * 2;
  const innerBottomRadiusY = rimHeight / 2 - innerInset;
  const innerRight = innerLeft + innerWidth;
  const hasFill = safeFill > 0;
  const glassInteriorPath = [
    `M ${innerLeft} ${bodyTop}`,
    `L ${innerRight} ${bodyTop}`,
    `L ${innerRight} ${bodyBottom}`,
    `A ${innerWidth / 2} ${innerBottomRadiusY} 0 0 1 ${innerLeft} ${bodyBottom}`,
    'Z',
  ].join(' ');
  const waterBodyPath = [
    `M ${innerLeft} ${fillTop}`,
    `L ${innerRight} ${fillTop}`,
    `L ${innerRight} ${bodyBottom}`,
    `A ${innerWidth / 2} ${innerBottomRadiusY} 0 0 1 ${innerLeft} ${bodyBottom}`,
    `L ${innerLeft} ${fillTop}`,
    'Z',
  ].join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id="glass-body">
            <Path d={glassInteriorPath} />
          </ClipPath>
        </Defs>

        {hasFill ? (
          <Path d={waterBodyPath} fill={fillColor} opacity={0.95} clipPath="url(#glass-body)" />
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
          fill="none"
          stroke={palette.ink}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}
