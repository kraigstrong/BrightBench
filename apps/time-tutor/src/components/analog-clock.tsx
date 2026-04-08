import React, { useMemo, useRef, type SetStateAction } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { palette, shadows, typography } from '@/design/theme';
import type {
  Hour12,
  Meridiem,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '@/types/time';
import {
  angleFromTouch,
  applyMinuteDrag,
  deriveHourFromAngle,
  formatTimeValue,
  getClockHandAngles,
  snapMinuteFromAngleForInterval,
} from '@/lib/time';

type AnalogClockProps = {
  interactive?: boolean;
  onChange?: (value: SetStateAction<TimeValue>) => void;
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
  onMeridiemChange?: (meridiem: Meridiem) => void;
  practiceInterval?: PracticeInterval;
  previewIncludeMeridiem?: boolean;
  showInteractionHint?: boolean;
  showMeridiemToggle?: boolean;
  showTimePreview?: boolean;
  size: number;
  time: TimeValue;
  timeFormat?: TimeFormat;
};

type HandName = 'hour' | 'minute';

export function AnalogClock({
  interactive = false,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  onMeridiemChange,
  practiceInterval = '5-minute',
  previewIncludeMeridiem = true,
  showInteractionHint,
  showMeridiemToggle = false,
  showTimePreview = false,
  size,
  time,
  timeFormat = '12-hour',
}: AnalogClockProps) {
  const activeHandRef = useRef<HandName | null>(null);
  const minuteInteractionEnabled = practiceInterval !== 'hours-only';
  const shellPadding = Platform.OS === 'web' ? 0 : 6;
  const webClockInteractionStyle =
    Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        } as const)
      : undefined;
  const webSvgStyle =
    Platform.OS === 'web'
      ? ({
          userSelect: 'none',
        } as const)
      : undefined;
  const radius = size / 2;
  const hourLength = size * 0.2;
  const minuteLength = size * 0.29;
  const numeralRadius = size * 0.324;
  const { hourAngle, minuteAngle } = getClockHandAngles(time);

  const hourTip = useMemo(
    () => getTipPoint(hourAngle, hourLength, radius),
    [hourAngle, hourLength, radius],
  );
  const minuteTip = useMemo(
    () => getTipPoint(minuteAngle, minuteLength, radius),
    [minuteAngle, minuteLength, radius],
  );

  function updateFromTouch(event: GestureResponderEvent, hand: HandName) {
    if (!onChange) {
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const angle = angleFromTouch(locationX, locationY, size);

    if (hand === 'minute') {
      if (!minuteInteractionEnabled) {
        return;
      }

      onChange((currentTime) =>
        applyMinuteDrag(
          currentTime,
          snapMinuteFromAngleForInterval(angle, practiceInterval),
        ),
      );

      return;
    }

    onChange((currentTime) => ({
      ...currentTime,
      hour12: deriveHourFromAngle(angle),
    }));
  }

  function handleGrant(event: GestureResponderEvent) {
    if (!interactive) {
      return;
    }

    onInteractionStart?.();
    activeHandRef.current = minuteInteractionEnabled
      ? pickHand(event, size, hourTip, minuteTip, radius)
      : 'hour';

    if (activeHandRef.current) {
      updateFromTouch(event, activeHandRef.current);
    }
  }

  function handleMove(event: GestureResponderEvent) {
    if (activeHandRef.current) {
      updateFromTouch(event, activeHandRef.current);
    }
  }

  function handleEnd() {
    activeHandRef.current = null;
    onInteractionEnd?.();
  }

  return (
    <View style={styles.container}>
      <View
        onMoveShouldSetResponder={interactive ? () => true : undefined}
        onMoveShouldSetResponderCapture={interactive ? () => true : undefined}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={handleEnd}
        onResponderTerminate={handleEnd}
        onStartShouldSetResponder={interactive ? () => true : undefined}
        onStartShouldSetResponderCapture={interactive ? () => true : undefined}
        style={[
          styles.clockShell,
          interactive && webClockInteractionStyle,
          { height: size, padding: shellPadding, width: size },
        ]}
        testID="analog-clock-surface">
        <Svg
          height={size}
          pointerEvents="none"
          style={webSvgStyle}
          width={size}>
          <Circle
            cx={radius}
            cy={radius}
            fill={palette.surface}
            r={radius - 4}
            stroke={palette.ring}
            strokeWidth={6}
          />
          {Array.from({ length: 60 }).map((_, index) => {
            const angle = index * 6;
            const outer = getTipPoint(angle, radius - 18, radius);
            const inner = getTipPoint(
              angle,
              radius - (index % 5 === 0 ? 38 : 28),
              radius,
            );

            return (
              <Line
                key={`tick-${index}`}
                stroke={index % 5 === 0 ? palette.ink : palette.ring}
                strokeLinecap="round"
                strokeWidth={index % 5 === 0 ? 4 : 2}
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
              />
            );
          })}
          {Array.from({ length: 12 }).map((_, index) => {
            const hour = (index + 1) as Hour12;
            const point = getTipPoint(hour * 30, numeralRadius, radius);

            return (
              <SvgText
                fill={palette.ink}
                fontFamily={typography.displayFamily}
                fontSize={size * 0.058}
                fontWeight="700"
                key={`numeral-${hour}`}
                textAnchor="middle"
                x={point.x}
                y={point.y + size * 0.02}>
                {hour}
              </SvgText>
            );
          })}
          <Line
            stroke={palette.ink}
            strokeLinecap="round"
            strokeWidth={size * 0.04}
            x1={radius}
            x2={hourTip.x}
            y1={radius}
            y2={hourTip.y}
          />
          <Line
            stroke={palette.coral}
            strokeLinecap="round"
            strokeWidth={size * 0.026}
            x1={radius}
            x2={minuteTip.x}
            y1={radius}
            y2={minuteTip.y}
          />
          <Circle
            cx={radius}
            cy={radius}
            fill={palette.teal}
            r={size * 0.04}
          />
        </Svg>
      </View>

      {showInteractionHint ?? interactive ? (
        <Text style={styles.helperText}>Tap a hand and drag it around the clock.</Text>
      ) : null}

      {showTimePreview ? (
        <Text style={styles.timePreview} testID="analog-clock-time-preview">
          {formatTimeValue(time, {
            includeMeridiem: previewIncludeMeridiem,
            timeFormat,
          })}
        </Text>
      ) : null}

      {showMeridiemToggle ? (
        <View style={styles.meridiemRow}>
          {(['AM', 'PM'] as const).map((option) => {
            const isSelected = option === time.meridiem;

            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onMeridiemChange?.(option)}
                style={[
                  styles.meridiemChip,
                  isSelected && styles.meridiemChipSelected,
                ]}
                testID={`clock-meridiem-${option.toLowerCase()}-button`}>
                <Text
                  style={[
                    styles.meridiemText,
                    isSelected && styles.meridiemTextSelected,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function getTipPoint(angle: number, length: number, radius: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: radius + Math.sin(radians) * length,
    y: radius - Math.cos(radians) * length,
  };
}

function pickHand(
  event: GestureResponderEvent,
  size: number,
  hourTip: { x: number; y: number },
  minuteTip: { x: number; y: number },
  radius: number,
): HandName {
  const isWeb = Platform.OS === 'web';
  const { locationX, locationY } = event.nativeEvent;
  const shaftThreshold = Math.max(size * (isWeb ? 0.045 : 0.035), isWeb ? 18 : 12);
  const distanceToHour = getDistance(locationX, locationY, hourTip.x, hourTip.y);
  const distanceToMinute = getDistance(
    locationX,
    locationY,
    minuteTip.x,
    minuteTip.y,
  );
  const hourShaftDistance = getDistanceToSegment(
    locationX,
    locationY,
    radius,
    radius,
    hourTip.x,
    hourTip.y,
  );
  const minuteShaftDistance = getDistanceToSegment(
    locationX,
    locationY,
    radius,
    radius,
    minuteTip.x,
    minuteTip.y,
  );
  const centerDistance = getDistance(locationX, locationY, radius, radius);
  const touchThreshold = Math.max(size * (isWeb ? 0.16 : 0.11), isWeb ? 42 : 28);
  const isNearHourShaft = hourShaftDistance <= shaftThreshold;
  const isNearMinuteShaft = minuteShaftDistance <= shaftThreshold;

  if (isNearHourShaft || isNearMinuteShaft) {
    if (isNearHourShaft && isNearMinuteShaft) {
      const hourReach = getDistance(radius, radius, hourTip.x, hourTip.y);
      const minuteReach = getDistance(radius, radius, minuteTip.x, minuteTip.y);

      if (Math.abs(hourShaftDistance - minuteShaftDistance) <= 2) {
        return centerDistance <= hourReach + (minuteReach - hourReach) * 0.35
          ? 'hour'
          : 'minute';
      }

      return hourShaftDistance < minuteShaftDistance ? 'hour' : 'minute';
    }

    return isNearMinuteShaft ? 'minute' : 'hour';
  }

  if (distanceToHour <= touchThreshold || distanceToMinute <= touchThreshold) {
    if (Math.abs(distanceToHour - distanceToMinute) <= 2) {
      return 'minute';
    }

    return distanceToHour < distanceToMinute ? 'hour' : 'minute';
  }

  return centerDistance < radius * (isWeb ? 0.64 : 0.58) ? 'hour' : 'minute';
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function getDistanceToSegment(
  pointX: number,
  pointY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const segmentLengthSquared = deltaX ** 2 + deltaY ** 2;

  if (segmentLengthSquared === 0) {
    return getDistance(pointX, pointY, startX, startY);
  }

  const projection =
    ((pointX - startX) * deltaX + (pointY - startY) * deltaY) /
    segmentLengthSquared;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closestX = startX + clampedProjection * deltaX;
  const closestY = startY + clampedProjection * deltaY;

  return getDistance(pointX, pointY, closestX, closestY);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  clockShell: {
    alignItems: 'center',
    backgroundColor: palette.backgroundAccent,
    borderRadius: 999,
    justifyContent: 'center',
    ...shadows.card,
  },
  helperText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    textAlign: 'center',
  },
  timePreview: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  meridiemRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  meridiemChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 12,
  },
  meridiemChipSelected: {
    backgroundColor: palette.coral,
  },
  meridiemText: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  meridiemTextSelected: {
    color: palette.white,
  },
});
