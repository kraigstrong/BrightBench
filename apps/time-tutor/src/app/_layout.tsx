import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider } from '@/state/app-state';

const SITE_URL = 'https://timetutor.app';
const TITLE = 'Time Tutor — Learn to Tell Time | Analog & Digital Clock Practice';
const DESCRIPTION =
  'Time Tutor helps children practice reading analog and digital time with simple, hands-on activities. No account required.';
const OG_IMAGE = `${SITE_URL}/favicon.png`;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          {/* Web-only: on native, expo-router/head's Head throws unless an
              "origin" is configured for its Handoff/Universal-Links feature,
              which this app doesn't use. The tags below are for web SEO only. */}
          {Platform.OS === 'web' ? (
            <Head>
              <title>{TITLE}</title>
              <meta name="description" content={DESCRIPTION} />
              <link rel="canonical" href={SITE_URL} />

              <meta property="og:type" content="website" />
              <meta property="og:title" content={TITLE} />
              <meta property="og:description" content={DESCRIPTION} />
              <meta property="og:url" content={SITE_URL} />
              <meta property="og:image" content={OG_IMAGE} />
              <meta property="og:site_name" content="Time Tutor" />

              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={TITLE} />
              <meta name="twitter:description" content={DESCRIPTION} />
              <meta name="twitter:image" content={OG_IMAGE} />
            </Head>
          ) : null}
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
