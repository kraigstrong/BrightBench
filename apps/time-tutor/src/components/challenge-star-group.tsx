import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { palette } from '@/design/theme';
import type { StarCount } from '@/types/time';

type ChallengeStarGroupProps = {
  starSize?: number;
  stars: StarCount;
};

export function ChallengeStarGroup({
  starSize = 14,
  stars,
}: ChallengeStarGroupProps) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((index) => (
        <ChallengeStarIcon key={index} filled={index < stars} size={starSize} />
      ))}
    </View>
  );
}

export function ChallengeStarIcon({
  filled,
  size,
}: {
  filled: boolean;
  size: number;
}) {
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
