import React from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radii } from '@education/design';
import { shadows } from '@education/design/native';

type ChallengeTimerBarProps = {
  accentColor?: string;
  fillTestID?: string;
  progress: number;
  testID?: string;
};

export function ChallengeTimerBar({
  accentColor = palette.coral,
  fillTestID,
  progress,
  testID,
}: ChallengeTimerBarProps) {
  const normalizedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.rail} testID={testID}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: accentColor,
            width: `${normalizedProgress * 100}%`,
          },
        ]}
        testID={fillTestID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    backgroundColor: '#E8EDF3',
    borderRadius: radii.pill,
    height: 14,
    overflow: 'hidden',
    ...shadows.card,
  },
  fill: {
    borderRadius: radii.pill,
    height: '100%',
  },
});
