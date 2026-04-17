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
    accent: '#E7A54B',
    surface: '#FFF4E8',
  },
  compare: {
    title: 'Compare Fractions',
    shortTitle: 'Compare',
    description: 'Choose the fraction that is larger.',
    promptHint: 'Look for the bigger amount.',
    accent: '#8A96A8',
    surface: '#F3F5F8',
  },
  estimate: {
    title: 'Estimate the Fraction',
    shortTitle: 'Estimate',
    description: 'Guess about how full the container is.',
    promptHint: 'Think about benchmark fractions like 1/2.',
    accent: '#3F9B8B',
    surface: '#ECF8F4',
  },
  pour: {
    title: 'Pour to Target',
    shortTitle: 'Pour',
    description: 'Fill a container until it feels just right.',
    promptHint: 'Drag to pour, then stop when it looks close.',
    accent: '#7086D8',
    surface: '#EEF1FF',
  },
  line: {
    title: 'Number Line',
    shortTitle: 'Line',
    description: 'Drag the marker to match the fraction.',
    promptHint: 'Place the marker, then check how close you are.',
    accent: '#8B6BC7',
    surface: '#F4EEFF',
  },
};
