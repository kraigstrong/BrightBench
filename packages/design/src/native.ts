import { Platform, type ViewStyle } from 'react-native';

import { fontFamilies, palette } from './tokens';

export const typography = {
  displayFamily: Platform.select({
    ios: fontFamilies.iosDisplay,
    android: fontFamilies.androidDisplay,
    default: fontFamilies.fallback,
  }),
  bodyFamily: Platform.select({
    ios: fontFamilies.iosBody,
    android: fontFamilies.androidBody,
    default: fontFamilies.fallback,
  }),
  monoFamily: fontFamilies.mono,
  sizes: {
    caption: 14,
    body: 16,
    bodyLarge: 18,
    title: 26,
    display: 32,
  },
};

export const shadows = {
  card: {
    shadowColor: palette.ink,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  } satisfies ViewStyle,
  overlay: {
    shadowColor: palette.ink,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  } satisfies ViewStyle,
};
