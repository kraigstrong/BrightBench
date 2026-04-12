import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@education/ui';

import { palette, shadows, typography } from '@/design/theme';
import type { ChallengeCountdownValue } from '@/lib/challenge-countdown';

type Props = {
  value: ChallengeCountdownValue | null;
};

export function ChallengeCountdownOverlay({ value }: Props) {
  if (value === null) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Card style={styles.card}>
        <Text style={styles.value} testID="challenge-countdown-value">
          {value === 'go' ? 'GO' : String(value)}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    backgroundColor: 'rgba(20, 27, 34, 0.20)',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 128,
    minWidth: 128,
    paddingHorizontal: 28,
    ...shadows.card,
  },
  value: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
