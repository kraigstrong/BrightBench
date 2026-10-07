import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@education/design';
import { typography } from '@education/design/native';

/** A short line under a play area: a hint, what to adjust, or what the child just made. */
export type PanelMessage = {
  title: string;
  body?: string;
  tone: 'hint' | 'adjust' | 'success';
};

export function MessageArea({ message }: { message: PanelMessage }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.messageArea}>
      <Text
        style={[
          styles.messageTitle,
          message.tone === 'hint' ? styles.messageHint : null,
          message.tone === 'success' ? styles.messageSuccess : null,
        ]}>
        {message.title}
      </Text>
      {message.body ? <Text style={styles.messageBody}>{message.body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  messageArea: {
    gap: 2,
    justifyContent: 'center',
    minHeight: 52,
  },
  messageTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    textAlign: 'center',
  },
  messageHint: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  messageSuccess: {
    color: palette.success,
  },
  messageBody: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
});
