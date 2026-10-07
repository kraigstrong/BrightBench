import { getFraction } from '@/features/game/math';

// The ways a child can split a whole: exactly the denominators in the fraction pools.
// Every target still has a choice that cannot make it (thirds for 3/4).
export const PART_CHOICES = [2, 3, 4, 6, 8] as const;

const PART_NAMES: Record<number, string> = {
  2: 'halves',
  3: 'thirds',
  4: 'fourths',
  5: 'fifths',
  6: 'sixths',
  7: 'sevenths',
  8: 'eighths',
};

/** "fourths" for 4 equal parts. */
export function partName(parts: number) {
  return PART_NAMES[parts] ?? `${parts} parts`;
}

export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Whether a whole split into `parts` equal parts can show the target exactly. */
export function canMakeTarget(targetFractionId: string, parts: number) {
  return parts % getFraction(targetFractionId).denominator === 0;
}
