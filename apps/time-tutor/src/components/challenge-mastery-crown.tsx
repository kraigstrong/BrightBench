import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { palette } from '@/design/theme';

export function ChallengeMasteryCrown() {
  return (
    <View accessibilityLabel="Mastered" style={styles.wrap}>
      <Svg fill="none" height={22} viewBox="0 0 24 24" width={22}>
        <Path
          d="M4 17.5 5.8 7.9l4 3.8L12 5l2.2 6.7 4-3.8 1.8 9.6H4Z"
          fill={palette.gold}
          stroke={palette.ink}
          strokeLinejoin="round"
          strokeWidth={1.4}
        />
        <Path
          d="M6.2 19.5h11.6"
          stroke={palette.ink}
          strokeLinecap="round"
          strokeWidth={1.6}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: '#FFF7E2',
    borderColor: '#EAC66A',
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
