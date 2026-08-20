import { Animated, Easing } from 'react-native';

// Shared so Practice and Challenge modes' wrong-answer shake+flash feel stays in sync.
export const WRONG_ANSWER_SHAKE_KEYFRAMES = [0, -8, 8, -6, 6, -3, 0] as const;
export const WRONG_ANSWER_SHAKE_DURATIONS = [0, 55, 50, 45, 40, 35, 30] as const;
export const WRONG_ANSWER_FLASH_OPACITY = 0.5;

export function buildWrongAnswerShakeAnimation(
  shake: Animated.Value,
): Animated.CompositeAnimation {
  return Animated.sequence(
    WRONG_ANSWER_SHAKE_KEYFRAMES.map((offset, index) =>
      Animated.timing(shake, {
        duration: WRONG_ANSWER_SHAKE_DURATIONS[index],
        easing: Easing.out(Easing.quad),
        toValue: offset,
        useNativeDriver: true,
      }),
    ),
  );
}

export function buildWrongAnswerFlashAnimation(
  flashOpacity: Animated.Value,
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(flashOpacity, {
      duration: 80,
      toValue: WRONG_ANSWER_FLASH_OPACITY,
      useNativeDriver: true,
    }),
    Animated.timing(flashOpacity, {
      duration: 220,
      toValue: 0,
      useNativeDriver: true,
    }),
  ]);
}
