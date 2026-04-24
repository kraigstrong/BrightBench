import { GameMode } from '@/features/game/types';
import { letterPalette } from '@/design/tokens';

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
  match: {
    title: 'Letter Match',
    shortTitle: 'Match',
    description: 'Listen for a clue like lowercase m, then tap the matching letter.',
    promptHint: 'Use Play clue as many times as you need, then tap the letter.',
    accent: letterPalette.coral,
    surface: letterPalette.peach,
  },
  case: {
    title: 'Case Pair',
    shortTitle: 'Case',
    description: 'Pair uppercase and lowercase letters together.',
    promptHint: 'Find the same letter in the other case.',
    accent: letterPalette.gold,
    surface: letterPalette.cream,
  },
  tap: {
    title: 'Tap the Letter',
    shortTitle: 'Tap',
    description: 'Catch the target letter before it falls away.',
    promptHint: 'Watch the falling letters and tap the target.',
    accent: letterPalette.teal,
    surface: letterPalette.mint,
  },
  sound: {
    title: 'Sound Match',
    shortTitle: 'Sounds',
    description: 'Listen for a letter sound, then choose a matching letter.',
    promptHint: 'Play the sound as many times as you need.',
    accent: letterPalette.purple,
    surface: letterPalette.lavender,
  },
};
