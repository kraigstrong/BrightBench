import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, spacing } from '@/design/theme';

type AppShellProps = ScrollViewProps & {
  children: React.ReactNode;
  maxWidth?: number;
};

export function AppShell({
  children,
  contentContainerStyle,
  maxWidth = 760,
  ...rest
}: AppShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom + spacing.lg, 28),
          paddingTop: Math.max(insets.top + spacing.sm, 28),
        },
        contentContainerStyle,
      ]}
      style={styles.scrollView}
      {...rest}>
      <View style={styles.backgroundBubbleLarge} />
      <View style={styles.backgroundBubbleSmall} />
      <View style={[styles.content, { maxWidth }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    width: '100%',
  },
  backgroundBubbleLarge: {
    backgroundColor: palette.backgroundAccent,
    borderRadius: 999,
    height: 220,
    opacity: 0.5,
    position: 'absolute',
    right: -50,
    top: -20,
    width: 220,
  },
  backgroundBubbleSmall: {
    backgroundColor: '#DDEFE8',
    borderRadius: 999,
    height: 140,
    left: -30,
    opacity: 0.8,
    position: 'absolute',
    top: '32%',
    width: 140,
  },
});
