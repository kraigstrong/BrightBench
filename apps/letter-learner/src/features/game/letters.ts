import { AudioKey, DifficultyLevel, LetterCase, LetterOption } from '@/features/game/types';

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const EASY_LETTERS = ['a', 'm', 's', 't', 'p', 'f', 'c', 'r', 'b', 'h', 'n', 'd'];
export const VISUAL_CONFUSABLES = ['b', 'd', 'p', 'q', 'm', 'w', 'n', 'u', 'i', 'l'];

export const DIGRAPHS = ['sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng'] as const;

export type SoundGroup = {
  id: string;
  label: string;
  audioKey: AudioKey;
  acceptedValues: string[];
  includeInHardOnly?: boolean;
};

export const SOUND_GROUPS: SoundGroup[] = [
  { id: 'a-short', label: 'short a', audioKey: 'sound:a', acceptedValues: ['a'] },
  { id: 'b', label: 'b', audioKey: 'sound:b', acceptedValues: ['b'] },
  { id: 'k', label: 'k sound', audioKey: 'sound:k', acceptedValues: ['c', 'k'] },
  { id: 'd', label: 'd', audioKey: 'sound:d', acceptedValues: ['d'] },
  { id: 'e-short', label: 'short e', audioKey: 'sound:e', acceptedValues: ['e'] },
  { id: 'f', label: 'f sound', audioKey: 'sound:f', acceptedValues: ['f', 'ph'] },
  { id: 'g-hard', label: 'hard g', audioKey: 'sound:g', acceptedValues: ['g'] },
  { id: 'h', label: 'h', audioKey: 'sound:h', acceptedValues: ['h'] },
  { id: 'i-short', label: 'short i', audioKey: 'sound:i', acceptedValues: ['i'] },
  { id: 'j', label: 'j sound', audioKey: 'sound:j', acceptedValues: ['j', 'g'] },
  { id: 'l', label: 'l', audioKey: 'sound:l', acceptedValues: ['l'] },
  { id: 'm', label: 'm', audioKey: 'sound:m', acceptedValues: ['m'] },
  { id: 'n', label: 'n', audioKey: 'sound:n', acceptedValues: ['n'] },
  { id: 'o-short', label: 'short o', audioKey: 'sound:o', acceptedValues: ['o'] },
  { id: 'p', label: 'p', audioKey: 'sound:p', acceptedValues: ['p'] },
  { id: 'kw', label: 'q sound', audioKey: 'sound:q', acceptedValues: ['q'] },
  { id: 'r', label: 'r', audioKey: 'sound:r', acceptedValues: ['r'] },
  { id: 's', label: 's sound', audioKey: 'sound:s', acceptedValues: ['s', 'c'] },
  { id: 't', label: 't', audioKey: 'sound:t', acceptedValues: ['t'] },
  { id: 'u-short', label: 'short u', audioKey: 'sound:u', acceptedValues: ['u'] },
  { id: 'v', label: 'v', audioKey: 'sound:v', acceptedValues: ['v'] },
  { id: 'w', label: 'w', audioKey: 'sound:w', acceptedValues: ['w'] },
  { id: 'ks', label: 'x sound', audioKey: 'sound:x', acceptedValues: ['x'] },
  { id: 'y', label: 'y', audioKey: 'sound:y', acceptedValues: ['y'] },
  { id: 'z', label: 'z sound', audioKey: 'sound:z', acceptedValues: ['z', 's'] },
  { id: 'sh', label: 'sh', audioKey: 'digraph:sh', acceptedValues: ['sh'], includeInHardOnly: true },
  { id: 'ch', label: 'ch', audioKey: 'digraph:ch', acceptedValues: ['ch'], includeInHardOnly: true },
  { id: 'th', label: 'th', audioKey: 'digraph:th', acceptedValues: ['th'], includeInHardOnly: true },
  { id: 'wh', label: 'wh', audioKey: 'digraph:wh', acceptedValues: ['wh'], includeInHardOnly: true },
  { id: 'ph', label: 'ph', audioKey: 'digraph:ph', acceptedValues: ['ph', 'f'], includeInHardOnly: true },
  { id: 'ck', label: 'ck', audioKey: 'digraph:ck', acceptedValues: ['ck', 'c', 'k'], includeInHardOnly: true },
  { id: 'ng', label: 'ng', audioKey: 'digraph:ng', acceptedValues: ['ng'], includeInHardOnly: true },
];

export function lettersForDifficulty(difficultyLevel: DifficultyLevel) {
  if (difficultyLevel === 'easy') {
    return EASY_LETTERS;
  }

  return LETTERS;
}

export function letterCaseForDifficulty(difficultyLevel: DifficultyLevel): LetterCase {
  if (difficultyLevel === 'easy') {
    return 'lower';
  }

  if (difficultyLevel === 'medium') {
    return 'upper';
  }

  return 'mixed';
}

export function labelForLetter(letter: string, letterCase: LetterCase) {
  if (letter.length > 1) {
    return letter.toLowerCase();
  }

  if (letterCase === 'upper') {
    return letter.toUpperCase();
  }

  if (letterCase === 'mixed') {
    return Math.random() > 0.5 ? letter.toUpperCase() : letter.toLowerCase();
  }

  return letter.toLowerCase();
}

export function makeLetterOption(letter: string, letterCase: LetterCase, idPrefix = letter): LetterOption {
  const value = letter.toLowerCase();
  const label = labelForLetter(value, letterCase);

  return {
    id: `${idPrefix}-${label}`,
    label,
    value,
  };
}

export function oppositeCaseOption(letter: string, label: string): LetterOption {
  const value = letter.toLowerCase();
  const nextLabel = label === label.toUpperCase() ? value : value.toUpperCase();

  return {
    id: `case-${value}-${nextLabel}`,
    label: nextLabel,
    value,
  };
}

export function soundGroupsForDifficulty(difficultyLevel: DifficultyLevel) {
  return SOUND_GROUPS.filter((group) => difficultyLevel === 'hard' || !group.includeInHardOnly);
}
