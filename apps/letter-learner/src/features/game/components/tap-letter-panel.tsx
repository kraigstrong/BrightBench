import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { shadows, typography } from '@education/design/native';
import { FallingLetter, TapLetterRound } from '@/features/game/types';

export function TapLetterPanel({
  accent,
  disabled,
  onSubmit,
  reducedMotion,
  round,
}: {
  accent: string;
  disabled?: boolean;
  onSubmit: (answerValue: string) => void;
  reducedMotion: boolean;
  round: TapLetterRound;
}) {
  return (
    <View style={styles.column}>
      <View style={[styles.targetBadge, { borderColor: accent }]}>
        <Text style={styles.targetCopy}>Target</Text>
        <Text style={styles.targetLetter}>{round.target.label}</Text>
      </View>
      <View style={styles.playArea}>
        {round.fallingLetters.map((letter) => (
          <FallingLetterButton
            key={letter.id}
            accent={accent}
            disabled={disabled}
            letter={letter}
            onPress={() => onSubmit(letter.value)}
            reducedMotion={reducedMotion}
          />
        ))}
      </View>
    </View>
  );
}

function FallingLetterButton({
  accent,
  disabled,
  letter,
  onPress,
  reducedMotion,
}: {
  accent: string;
  disabled?: boolean;
  letter: FallingLetter;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    if (reducedMotion) {
      return;
    }

    const animation = Animated.timing(progress, {
      delay: letter.delayMs,
      duration: letter.durationMs,
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [letter.delayMs, letter.durationMs, progress, reducedMotion]);

  const translateY = reducedMotion
    ? 0
    : progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 260],
      });

  return (
    <Animated.View
      style={[
        styles.fallingWrap,
        {
          left: `${letter.leftPercent}%`,
          transform: [{ translateY }],
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.fallingTile,
          {
            borderColor: accent,
            height: letter.size,
            width: letter.size,
          },
          pressed && !disabled ? styles.pressed : null,
          disabled ? styles.disabled : null,
        ]}>
        <Text style={styles.fallingLabel}>{letter.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.md,
  },
  targetBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  targetCopy: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  targetLetter: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 34,
    fontWeight: '800',
  },
  playArea: {
    backgroundColor: '#EDF5FF',
    borderColor: palette.ring,
    borderRadius: radii.xl,
    borderWidth: 1,
    height: 330,
    overflow: 'hidden',
    position: 'relative',
  },
  fallingWrap: {
    position: 'absolute',
    top: 0,
  },
  fallingTile: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 3,
    justifyContent: 'center',
    ...shadows.card,
  },
  fallingLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 32,
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
