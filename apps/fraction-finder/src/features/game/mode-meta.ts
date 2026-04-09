import { GameMode } from '@/features/game/types';

export const MODE_META: Record<
  GameMode,
  {
    title: string;
    shortTitle: string;
    description: string;
    promptHint: string;
    accent: string;
    surface: string;
  }
> = {
  find: {
    title: 'Find the Fraction',
    shortTitle: 'Find',
    description: 'Match a picture to the right fraction.',
    promptHint: 'Look first, then tap the matching fraction.',
    accent: '#E56B5D',
    surface: '#FFF0ED',
  },
  build: {
    title: 'Build the Fraction',
    shortTitle: 'Build',
    description: 'Fill the right number of equal parts.',
    promptHint: 'Tap the pieces you want to shade.',
    accent: '#F39A4A',
    surface: '#FFF2E6',
  },
  compare: {
    title: 'Compare Fractions',
    shortTitle: 'Compare',
    description: 'Choose the fraction that is larger.',
    promptHint: 'Look for the bigger amount.',
    accent: '#4E8FD1',
    surface: '#EAF3FF',
  },
  estimate: {
    title: 'Estimate the Fraction',
    shortTitle: 'Estimate',
    description: 'Guess about how full the container is.',
    promptHint: 'Think about benchmark fractions like 1/2.',
    accent: '#5FAF74',
    surface: '#EEF9F1',
  },
  pour: {
    title: 'Pour to Target',
    shortTitle: 'Pour',
    description: 'Fill a container until it feels just right.',
    promptHint: 'Drag to pour, then stop when it looks close.',
    accent: '#7B5BC7',
    surface: '#F3EDFF',
  },
  line: {
    title: 'Place on the Number Line',
    shortTitle: 'Line',
    description: 'Drag the marker to where the fraction belongs.',
    promptHint: 'Place the marker, then check how close you are.',
    accent: '#2F9C95',
    surface: '#EAF8F6',
  },
};
