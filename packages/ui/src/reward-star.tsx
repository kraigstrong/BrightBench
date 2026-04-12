import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { palette } from '@education/design';

type RewardStarIconProps = {
  filled: boolean;
  size: number;
};

type RewardStarGroupProps = {
  maxStars?: number;
  starSize?: number;
  stars: number;
};

export function RewardStarGroup({
  maxStars = 3,
  starSize = 14,
  stars,
}: RewardStarGroupProps) {
  const filledStars = Math.max(0, Math.min(maxStars, Math.floor(stars)));

  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, index) => (
        <RewardStarIcon key={index} filled={index < filledStars} size={starSize} />
      ))}
    </View>
  );
}

export function RewardStarIcon({ filled, size }: RewardStarIconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="m12 3.8 2.5 5.1 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8Z"
        fill={filled ? palette.gold : '#F5EFE4'}
        stroke={filled ? '#CC9A35' : palette.ring}
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
});
