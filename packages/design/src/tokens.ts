export const palette = {
  background: '#F6EFE3',
  backgroundAccent: '#FBE0C8',
  surface: '#FFF9F2',
  surfaceMuted: '#F3E6D5',
  surfaceOverlay: 'rgba(255, 249, 242, 0.96)',
  ink: '#12355B',
  inkMuted: '#5B6C7D',
  coral: '#E97A5F',
  teal: '#2E8B8B',
  gold: '#F1BD63',
  success: '#2E8B57',
  danger: '#B64757',
  ring: '#D6C3AE',
  white: '#FFFFFF',
  confettiRed: '#F05D5E',
  confettiGold: '#F6BD39',
  confettiTeal: '#0FA3B1',
  confettiInk: '#2D3142',
  confettiMint: '#7ED6A5',
  confettiPink: '#FF7AA2',
  confettiViolet: '#7A5CFA',
  confettiOrange: '#FF9F1C',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 40,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const motion = {
  quick: 180,
  smooth: 320,
  celebratory: 700,
};

export const fontFamilies = {
  iosDisplay: 'Avenir Next',
  iosBody: 'Avenir Next',
  androidDisplay: 'sans-serif-medium',
  androidBody: 'sans-serif',
  fallback: 'System',
  mono: 'Menlo',
};

export const confettiPalette = [
  palette.confettiRed,
  palette.confettiGold,
  palette.confettiTeal,
  palette.confettiInk,
  palette.confettiMint,
  palette.confettiPink,
  palette.confettiViolet,
  palette.confettiOrange,
] as const;

export type DesignPalette = typeof palette;
