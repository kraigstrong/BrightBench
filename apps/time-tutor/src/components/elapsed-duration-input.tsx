import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '@/design/theme';
import type { ElapsedDurationValue, PracticeInterval } from '@/types/time';
import { cycleElapsedHours, cycleMinuteForInterval } from '@/lib/time';

type Props = {
  compact?: boolean;
  disabled?: boolean;
  onChange: (value: ElapsedDurationValue) => void;
  practiceInterval?: PracticeInterval;
  value: ElapsedDurationValue;
};

type ControlProps = {
  compact: boolean;
  decrementTestID: string;
  disabled: boolean;
  incrementTestID: string;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  value: string;
  valueTestID: string;
};

export function ElapsedDurationInput({
  compact = false,
  disabled = false,
  onChange,
  practiceInterval = '5-minute',
  value,
}: Props) {
  const showMinuteControls = practiceInterval !== 'hours-only';
  const webNoSelectStyle =
    Platform.OS === 'web'
      ? ({ touchAction: 'manipulation', userSelect: 'none' } as const)
      : null;
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const commitNextValue = useCallback(
    (nextValue: ElapsedDurationValue) => {
      latestValueRef.current = nextValue;
      onChange(nextValue);
    },
    [onChange],
  );

  const stepHours = useCallback(
    (direction: 1 | -1) => {
      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        hours: cycleElapsedHours(currentValue.hours, direction),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue],
  );

  const stepMinutes = useCallback(
    (direction: 1 | -1) => {
      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        minutes: cycleMinuteForInterval(
          currentValue.minutes,
          direction,
          practiceInterval,
        ),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue, practiceInterval],
  );

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        webNoSelectStyle,
      ]}>
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        <Control
          compact={compact}
          decrementTestID="elapsed-hours-decrement-button"
          disabled={disabled}
          incrementTestID="elapsed-hours-increment-button"
          label="Hours"
          onDecrement={() => stepHours(-1)}
          onIncrement={() => stepHours(1)}
          value={String(value.hours)}
          valueTestID="elapsed-hours-value"
        />
        <Text
          selectable={false}
          style={[
            styles.separator,
            compact && styles.separatorCompact,
            webNoSelectStyle,
          ]}>
          :
        </Text>
        <Control
          compact={compact}
          decrementTestID="elapsed-minutes-decrement-button"
          disabled={disabled || !showMinuteControls}
          incrementTestID="elapsed-minutes-increment-button"
          label="Minutes"
          onDecrement={() => stepMinutes(-1)}
          onIncrement={() => stepMinutes(1)}
          value={String(value.minutes).padStart(2, '0')}
          valueTestID="elapsed-minutes-value"
        />
      </View>
      <Text
        selectable={false}
        style={[styles.tipText, compact && styles.tipTextCompact, webNoSelectStyle]}>
        Tip: press and hold + or - to adjust faster.
      </Text>
    </View>
  );
}

function Control({
  compact,
  decrementTestID,
  disabled,
  incrementTestID,
  label,
  onDecrement,
  onIncrement,
  value,
  valueTestID,
}: ControlProps) {
  const webNoSelectStyle =
    Platform.OS === 'web'
      ? ({ touchAction: 'manipulation', userSelect: 'none' } as const)
      : null;
  const holdDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const stopRepeating = useCallback(() => {
    if (holdDelayTimeoutRef.current) {
      clearTimeout(holdDelayTimeoutRef.current);
      holdDelayTimeoutRef.current = null;
    }
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => stopRepeating, [stopRepeating]);

  const startRepeating = useCallback(
    (action: () => void) => {
      stopRepeating();
      longPressTriggeredRef.current = true;

      const startedAt = Date.now();

      const tick = () => {
        action();

        const elapsed = Date.now() - startedAt;
        const nextDelay = elapsed >= 1200 ? 55 : elapsed >= 550 ? 90 : 140;

        repeatTimeoutRef.current = setTimeout(tick, nextDelay);
      };

      tick();
    },
    [stopRepeating],
  );

  const scheduleRepeating = useCallback(
    (action: () => void) => {
      stopRepeating();
      longPressTriggeredRef.current = false;

      holdDelayTimeoutRef.current = setTimeout(() => {
        holdDelayTimeoutRef.current = null;
        startRepeating(action);
      }, 220);
    },
    [startRepeating, stopRepeating],
  );

  const handlePress = useCallback((action: () => void) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    action();
  }, []);

  return (
    <View style={[styles.controlGroup, compact && styles.controlGroupCompact]}>
      <Text
        selectable={false}
        style={[
          styles.controlLabel,
          compact && styles.controlLabelCompact,
          webNoSelectStyle,
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.controlShell,
          compact && styles.controlShellCompact,
          disabled && styles.controlShellDisabled,
          webNoSelectStyle,
        ]}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handlePress(onDecrement)}
          onPressIn={() => scheduleRepeating(onDecrement)}
          onPressOut={stopRepeating}
          style={[
            styles.controlStepper,
            compact && styles.controlStepperCompact,
            disabled && styles.controlButtonDisabled,
            webNoSelectStyle,
          ]}
          testID={decrementTestID}>
          <Text
            selectable={false}
            style={[
              styles.controlButtonText,
              compact && styles.controlButtonTextCompact,
              webNoSelectStyle,
            ]}>
            -
          </Text>
        </Pressable>
        <Text
          numberOfLines={1}
          selectable={false}
          style={[styles.controlValue, compact && styles.controlValueCompact]}
          testID={valueTestID}>
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => handlePress(onIncrement)}
          onPressIn={() => scheduleRepeating(onIncrement)}
          onPressOut={stopRepeating}
          style={[
            styles.controlStepper,
            compact && styles.controlStepperCompact,
            styles.controlStepperAccent,
            disabled && styles.controlButtonDisabled,
            webNoSelectStyle,
          ]}
          testID={incrementTestID}>
          <Text
            selectable={false}
            style={[
              styles.controlButtonText,
              compact && styles.controlButtonTextCompact,
              webNoSelectStyle,
            ]}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  containerCompact: {
    gap: 10,
  },
  controlsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  controlsRowCompact: {
    gap: 10,
  },
  separator: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 64,
    paddingTop: 24,
  },
  separatorCompact: {
    fontSize: 34,
    lineHeight: 54,
    paddingTop: 20,
  },
  controlGroup: {
    alignItems: 'center',
    gap: 8,
  },
  controlGroupCompact: {
    gap: 6,
  },
  controlLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  controlLabelCompact: {
    fontSize: 12,
  },
  controlShell: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  controlShellCompact: {
    gap: 6,
    minHeight: 54,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  controlShellDisabled: {
    opacity: 0.8,
  },
  controlStepper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlStepperCompact: {
    height: 36,
    width: 36,
  },
  controlStepperAccent: {
    backgroundColor: palette.teal,
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlButtonText: {
    color: palette.white,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
  },
  controlButtonTextCompact: {
    fontSize: 20,
  },
  controlValue: {
    color: palette.white,
    fontFamily: typography.displayFamily,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'center',
  },
  controlValueCompact: {
    fontSize: 30,
    minWidth: 44,
  },
  tipText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  tipTextCompact: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 240,
  },
});
