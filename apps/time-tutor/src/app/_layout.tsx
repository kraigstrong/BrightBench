import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getWebHead, OG_IMAGE } from '@/lib/web-head';
import { AppStateProvider } from '@/state/app-state';

// Its own component so only the head tags re-render when the route changes.
function WebHeadTags() {
  const { canonical, description, title } = getWebHead(usePathname());

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:site_name" content="Time Tutor" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          {/* Web-only: on native, expo-router/head's Head throws unless an
              "origin" is configured for its Handoff/Universal-Links feature,
              which this app doesn't use. The tags below are for web SEO only. */}
          {Platform.OS === 'web' ? <WebHeadTags /> : null}
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
