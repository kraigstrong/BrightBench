import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { shadows, typography } from '@education/design/native';

type FeedbackTone = 'neutral' | 'warning' | 'success';

type FeedbackCalloutProps = {
  body: string;
  detail?: string;
  title: string;
  tone?: FeedbackTone;
};

const toneStyles = {
  neutral: {
    accent: palette.teal,
    backgroundColor: palette.surface,
    borderColor: palette.ring,
  },
  warning: {
    accent: '#F39A4A',
    backgroundColor: '#FFF8EE',
    borderColor: '#F3D2A8',
  },
  success: {
    accent: '#5FAF74',
    backgroundColor: '#F2FBF4',
    borderColor: '#B9E0C3',
  },
} as const;

export function FeedbackCallout({
  body,
  detail,
  title,
  tone = 'neutral',
}: FeedbackCalloutProps) {
  const colors = toneStyles[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}>
      <View style={[styles.accent, { backgroundColor: colors.accent }]} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  accent: {
    alignSelf: 'stretch',
    borderRadius: radii.pill,
    width: 6,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 21,
  },
  detail: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
  },
});
