import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { palette } from '@education/design';
import { primeSystemReduceMotion } from '@/lib/use-reduce-motion';
import { AppStateProvider } from '@/state/app-state';

export default function RootLayout() {
  useEffect(() => {
    // Learn the OS reduce-motion preference before any screen needs it for a transition.
    primeSystemReduceMotion();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.background },
            }}
          />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
