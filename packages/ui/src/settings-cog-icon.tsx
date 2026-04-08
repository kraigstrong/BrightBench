import React from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';

import { palette } from '@education/design';

type SettingsCogIconProps = {
  size?: number;
};

const COG_CENTER = 12;
const COG_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export function SettingsCogIcon({ size = 24 }: SettingsCogIconProps) {
  const webAccessibilityProps =
    Platform.OS === 'web'
      ? ({
          'aria-hidden': true,
        } as const)
      : {};

  return (
    <Svg
      focusable={false}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...webAccessibilityProps}>
      {COG_ANGLES.map((angle) => (
        <G key={angle} transform={`rotate(${angle} ${COG_CENTER} ${COG_CENTER})`}>
          <Rect
            fill={palette.ink}
            height={5.2}
            rx={1.1}
            width={2.4}
            x={10.8}
            y={0.9}
          />
        </G>
      ))}

      <Circle cx={12} cy={12} fill={palette.ink} r={7.15} />
      <Circle cx={12} cy={12} fill={palette.surface} r={3.4} />
      <Circle cx={12} cy={12} fill={palette.teal} r={1.45} />
    </Svg>
  );
}
