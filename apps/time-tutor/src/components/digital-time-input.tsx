import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '@/design/theme';
import type {
  DigitalTimeValue,
  PracticeInterval,
  TimeFormat,
} from '@/types/time';
import { cycleDigitalHour, cycleMinuteForInterval } from '@/lib/time';

type DigitalTimeInputProps = {
  compact?: boolean;
  disabled?: boolean;
  onChange: (value: DigitalTimeValue) => void;
  onStep?: (unit: 'hour' | 'minute', direction: 1 | -1) => void;
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
  value: DigitalTimeValue;
};

type ControlCardProps = {
  compact?: boolean;
  decrementTestID: string;
  disabled?: boolean;
  incrementTestID: string;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  value: string;
  valueTestID: string;
};

export function DigitalTimeInput({
  compact = false,
  disabled = false,
  onChange,
  onStep,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
  value,
}: DigitalTimeInputProps) {
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
    (nextValue: DigitalTimeValue) => {
      latestValueRef.current = nextValue;
      onChange(nextValue);
    },
    [onChange],
  );

  const stepHour = useCallback(
    (direction: 1 | -1) => {
      if (onStep) {
        onStep('hour', direction);
        return;
      }

      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        hour: cycleDigitalHour(currentValue.hour, direction, timeFormat),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue, onStep, timeFormat],
  );

  const stepMinute = useCallback(
    (direction: 1 | -1) => {
      if (onStep) {
        onStep('minute', direction);
        return;
      }

      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        minute: cycleMinuteForInterval(
          currentValue.minute,
          direction,
          practiceInterval,
        ),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue, onStep, practiceInterval],
  );

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        webNoSelectStyle,
      ]}>
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        <ControlCard
          compact={compact}
          decrementTestID="hour-decrement-button"
          disabled={disabled}
          incrementTestID="hour-increment-button"
          label="Hour"
          onDecrement={() => stepHour(-1)}
          onIncrement={() => stepHour(1)}
          value={
            timeFormat === '24-hour'
              ? String(value.hour).padStart(2, '0')
              : String(value.hour)
          }
          valueTestID="hour-value"
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
        <ControlCard
          compact={compact}
          decrementTestID="minute-decrement-button"
          disabled={disabled || !showMinuteControls}
          incrementTestID="minute-increment-button"
          label="Minute"
          onDecrement={() => stepMinute(-1)}
          onIncrement={() => stepMinute(1)}
          value={String(value.minute).padStart(2, '0')}
          valueTestID="minute-value"
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

function ControlCard({
  compact = false,
  decrementTestID,
  disabled = false,
  incrementTestID,
  label,
  onDecrement,
  onIncrement,
  value,
  valueTestID,
}: ControlCardProps) {
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
            compact && styles.controlButtonCompact,
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
            compact && styles.controlButtonCompact,
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
  controlStepper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlButtonCompact: {
    height: 36,
    width: 36,
  },
  controlStepperAccent: {
    backgroundColor: palette.teal,
  },
  controlButtonDisabled: {
    opacity: 0.35,
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
  controlButtonText: {
    color: palette.white,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
  },
  controlButtonTextCompact: {
    fontSize: 20,
  },
});
