import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { palette } from '@education/design';
import { fractionPalette } from '@/design/tokens';

export function FractionMeter({
  fillRatio,
  width = 260,
  height = 52,
  fillColor = fractionPalette.mint,
}: {
  fillRatio: number;
  width?: number;
  height?: number;
  fillColor?: string;
}) {
  const safeFill = Math.min(1, Math.max(0, fillRatio));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={2} y={2} width={width - 4} height={height - 4} rx={height / 2} fill="#FFFFFF" stroke={palette.ink} strokeWidth={3} />
        <Rect x={6} y={6} width={(width - 12) * safeFill} height={height - 12} rx={(height - 12) / 2} fill={fillColor} />
      </Svg>
    </View>
  );
}
