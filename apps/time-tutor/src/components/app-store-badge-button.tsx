import React from 'react';
import { Image, Linking, Pressable, StyleSheet } from 'react-native';

import { getTimeTutorAppStoreUrl } from '@/lib/site-links';

export function AppStoreBadgeButton() {
  const appStoreUrl = getTimeTutorAppStoreUrl();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Download on the App Store"
      onPress={() => Linking.openURL(appStoreUrl).catch(() => {})}
      style={styles.button}
      testID="app-store-badge-button">
      <Image
        alt="Download on the App Store"
        source={{
          uri: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
        }}
        style={styles.badge}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  badge: {
    height: 40,
    width: 120,
  },
});
