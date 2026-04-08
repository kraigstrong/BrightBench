import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { palette, spacing } from '@education/design';

type AppShellProps = {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
  scroll?: boolean;
};

export function AppShell({
  children,
  contentStyle,
  maxWidth = 760,
  scroll = true,
}: AppShellProps) {
  const insets = useSafeAreaInsets();
  const edgePadding = {
    paddingBottom: Math.max(insets.bottom + spacing.lg, 28),
    paddingHorizontal: 12,
    paddingTop: Math.max(insets.top + spacing.sm, 28),
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.backgroundBubbleLarge} />
        <View style={styles.backgroundBubbleSmall} />

        {scroll ? (
          <ScrollView
            bounces={false}
            contentContainerStyle={[styles.scrollContent, edgePadding]}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}>
            <View style={[styles.content, { maxWidth }, contentStyle]}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.fixedContentWrap, edgePadding]}>
            <View style={[styles.content, styles.fixedContent, { maxWidth }, contentStyle]}>
              {children}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  root: {
    backgroundColor: palette.background,
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fixedContentWrap: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.lg,
    width: '100%',
  },
  fixedContent: {
    flex: 1,
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
    backgroundColor: 'rgba(46, 139, 139, 0.14)',
    borderRadius: 999,
    height: 140,
    left: -30,
    opacity: 0.9,
    position: 'absolute',
    top: '32%',
    width: 140,
  },
});
