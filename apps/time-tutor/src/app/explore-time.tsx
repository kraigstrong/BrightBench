import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@education/ui';

import { PRACTICE_INTERVAL_OPTIONS } from '@/config/practice-intervals';
import { palette, shadows, typography } from '@/design/theme';

export default function ExploreTimeLaunchScreen() {
  function launchExploreTime(interval: (typeof PRACTICE_INTERVAL_OPTIONS)[number]['value']) {
    router.replace(`/explore?interval=${interval}`);
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          animation: 'fade',
          gestureEnabled: true,
          headerShown: false,
          presentation: 'transparentModal',
        }}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backdrop}
        testID="explore-time-launch-backdrop"
      />

      <View pointerEvents="box-none" style={styles.centerWrap}>
        <Card style={styles.modalCard}>
          <Text style={styles.eyebrow}>Explore Time</Text>
          <Text style={styles.title}>Choose your interval</Text>
          <Text style={styles.body}>Set the pace before you start exploring.</Text>

          <View style={styles.optionsColumn}>
            {PRACTICE_INTERVAL_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => launchExploreTime(option.value)}
                style={styles.optionButton}
                testID={`explore-time-interval-${option.value}`}>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionMeta}>{option.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.cancelButton}
            testID="explore-time-cancel-button">
            <Text style={styles.cancelButtonText}>Not now</Text>
          </Pressable>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'rgba(20, 27, 34, 0.3)',
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    gap: 16,
    maxWidth: 460,
    width: '100%',
    ...shadows.card,
  },
  eyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  optionsColumn: {
    gap: 12,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.ring,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  optionMeta: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
});
