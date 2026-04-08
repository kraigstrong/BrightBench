import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState, type SetStateAction } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { AnalogClock } from '@/components/analog-clock';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { DigitalTimeInput } from '@/components/digital-time-input';
import { HeaderSettingsButton } from '@/components/header-settings-button';
import { Card } from '@education/ui';
import { palette, typography } from '@/design/theme';
import {
  digitalValueToTimeValue,
  normalizeAnalogTimeFor24Hour,
  randomTimeValueForInterval,
  stepDigitalTimeValue,
  timeValueToDigitalValue,
} from '@/lib/time';
import { useAppState } from '@/state/app-state';
import type { DigitalTimeValue, TimeValue } from '@/types/time';

export default function ExploreScreen() {
  const { practiceInterval, timeFormat } = useAppState();
  const { width } = useWindowDimensions();
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [time, setTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );

  useEffect(() => {
    setTime(randomTimeValueForInterval(practiceInterval));
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
        leftAction={<BackButton onPress={() => router.replace('/')} />}
        rightAction={<HeaderSettingsButton onPress={() => router.push('/settings')} />}
      />

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
  exploreLayout: {
    gap: 16,
  },
  exploreColumn: {
    gap: 16,
  },
  clockCard: {
    gap: 16,
  },
  digitalCard: {
    alignItems: 'center',
    gap: 16,
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
