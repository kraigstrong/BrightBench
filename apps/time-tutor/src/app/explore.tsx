import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppShell } from '@/components/app-shell';
import { AnalogClock } from '@/components/analog-clock';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { DigitalTimeInput } from '@/components/digital-time-input';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { Card } from '@education/ui';
import { palette, typography } from '@/design/theme';
import {
  DEFAULT_PRACTICE_INTERVAL,
  isPracticeInterval,
} from '@/config/practice-intervals';
import {
  currentTimeValueForInterval,
  digitalValueToTimeValue,
  normalizeAnalogTimeFor24Hour,
  stepDigitalTimeValue,
  timeValueToDigitalValue,
} from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type { DigitalTimeValue, TimeValue } from '@/types/time';

export default function ExploreScreen() {
  const { timeFormat } = useAppState();
  const params = useLocalSearchParams<{ interval?: string }>();
  const { width } = useWindowDimensions();
  const practiceInterval = isPracticeInterval(params.interval)
    ? params.interval
    : DEFAULT_PRACTICE_INTERVAL;
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [time, setTime] = useState<TimeValue>(() =>
    currentTimeValueForInterval(practiceInterval),
  );

  useEffect(() => {
    setTime(currentTimeValueForInterval(practiceInterval));
  }, [practiceInterval]);

  const setCurrentTime = useCallback(() => {
    setTime(currentTimeValueForInterval(practiceInterval));
  }, [practiceInterval]);

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactDigitalInput = !isTablet;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(
      contentMaxWidth * (isTablet ? 0.48 : 0.78),
      isTablet ? 420 : 340,
    ),
    260,
  );

  const digitalValue = useMemo(
    () => timeValueToDigitalValue(time, timeFormat),
    [time, timeFormat],
  );

  function handleClockChange(value: SetStateAction<TimeValue>) {
    setTime((currentTime) => {
      const nextTime =
        typeof value === 'function' ? value(currentTime) : value;

      return timeFormat === '24-hour'
        ? normalizeAnalogTimeFor24Hour(currentTime, nextTime)
        : nextTime;
    });
  }

  function handleDigitalChange(value: DigitalTimeValue) {
    setTime((currentTime) =>
      digitalValueToTimeValue(value, timeFormat, currentTime.meridiem),
    );
  }

  function handleDigitalStep(unit: 'hour' | 'minute', direction: 1 | -1) {
    setTime((currentTime) => {
      const nextDigitalValue = stepDigitalTimeValue(
        timeValueToDigitalValue(currentTime, timeFormat),
        unit,
        direction,
        {
          practiceInterval,
          timeFormat,
        },
      );

      return digitalValueToTimeValue(
        nextDigitalValue,
        timeFormat,
        currentTime.meridiem,
      );
    });
  }

  return (
    <AppShell maxWidth={contentMaxWidth} scrollEnabled={!clockInteractionActive}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <HeaderBar
        title="Explore Time"
        leftAction={<BackButton onPress={() => router.back()} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={setCurrentTime}
          style={styles.currentTimeButton}
          testID="set-current-time-button">
          <Text style={styles.currentTimeButtonText}>Set current time</Text>
        </Pressable>
      </View>

      <View style={styles.exploreLayout}>
        <View style={styles.exploreColumn}>
          <Card style={styles.clockCard}>
            <Text style={styles.cardEyebrow}>Analog clock</Text>
            <AnalogClock
              interactive
              onChange={handleClockChange}
              onInteractionEnd={() => setClockInteractionActive(false)}
              onInteractionStart={() => setClockInteractionActive(true)}
              practiceInterval={practiceInterval}
              previewIncludeMeridiem={false}
              showInteractionHint
              showTimePreview
              size={clockSize}
              time={time}
              timeFormat={timeFormat}
            />
          </Card>
        </View>

        <View style={styles.exploreColumn}>
          <Card style={styles.digitalCard}>
            <Text style={styles.cardEyebrow}>Digital time</Text>
            <DigitalTimeInput
              compact={useCompactDigitalInput}
              onChange={handleDigitalChange}
              onStep={handleDigitalStep}
              practiceInterval={practiceInterval}
              timeFormat={timeFormat}
              value={digitalValue}
            />
          </Card>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    marginBottom: 2,
  },
  currentTimeButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.coral,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  currentTimeButtonText: {
    color: palette.white,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  exploreLayout: {
    gap: 12,
  },
  exploreColumn: {
    gap: 12,
  },
  clockCard: {
    gap: 12,
  },
  digitalCard: {
    alignItems: 'center',
    gap: 12,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
