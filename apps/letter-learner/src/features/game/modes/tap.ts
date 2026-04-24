import {
  labelForLetter,
  letterCaseForDifficulty,
  lettersForDifficulty,
  makeLetterOption,
} from '@/features/game/letters';
import { makeRoundId, sample, shuffle, takeRandom } from '@/features/game/math';
import {
  FallingLetter,
  GenerateRoundOptions,
  LetterOption,
  RoundEvaluation,
  TapLetterRound,
} from '@/features/game/types';

export function generateTapLetterRound(options: GenerateRoundOptions): TapLetterRound {
  const letterCase = letterCaseForDifficulty(options.difficultyLevel);
  const pool = lettersForDifficulty(options.difficultyLevel);
  const targetLetter = sample(pool);
  const target = makeLetterOption(targetLetter, letterCase, 'tap-target');
  const distractorValues = takeRandom(pool, 7, [targetLetter]);
  const optionPool = shuffle([
    target,
    target,
    ...distractorValues.map((letter) => makeLetterOption(letter, letterCase, 'tap-option')),
  ]);

  return {
    id: makeRoundId('tap'),
    mode: 'tap',
    prompt: `Tap ${labelForLetter(target.value, target.label === target.label.toUpperCase() ? 'upper' : 'lower')}`,
    hint: 'Catch the matching letter before it reaches the bottom.',
    difficultyLevel: options.difficultyLevel,
    target,
    fallingLetters: optionPool.map((option, index) => createFallingLetter(option, index)),
  };
}

export function evaluateTapLetterRound(round: TapLetterRound, answerValue: string): RoundEvaluation {
  const isCorrect = answerValue === round.target.value;

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'tap-correct' : 'tap-try-again',
    detailLabel: isCorrect ? undefined : `Look for ${round.target.label}.`,
  };
}

function createFallingLetter(option: LetterOption, index: number): FallingLetter {
  return {
    ...option,
    id: `${option.id}-${index}`,
    delayMs: index * 420,
    durationMs: 5200 + (index % 3) * 450,
    leftPercent: 8 + ((index * 23) % 78),
    size: index % 2 === 0 ? 64 : 56,
  };
}
