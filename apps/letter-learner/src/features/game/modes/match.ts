import {
  labelForLetter,
  letterCaseForDifficulty,
  lettersForDifficulty,
  makeLetterOption,
} from '@/features/game/letters';
import { makeRoundId, sample, shuffle, takeRandom } from '@/features/game/math';
import { GenerateRoundOptions, LetterMatchRound, RoundEvaluation } from '@/features/game/types';

export function generateLetterMatchRound(options: GenerateRoundOptions): LetterMatchRound {
  const letterCase = letterCaseForDifficulty(options.difficultyLevel);
  const pool = lettersForDifficulty(options.difficultyLevel);
  const targetLetter = sample(pool);
  const target = makeLetterOption(targetLetter, letterCase, 'target');
  const distractors = takeRandom(pool, 3, [targetLetter]).map((letter) =>
    makeLetterOption(letter, letterCase, 'option')
  );

  const spokenCase = target.label === target.label.toUpperCase() ? 'uppercase' : 'lowercase';

  return {
    id: makeRoundId('match'),
    mode: 'match',
    prompt: `Find ${spokenCase} ${target.label}`,
    hint: 'Tap the exact letter from the clue.',
    difficultyLevel: options.difficultyLevel,
    target,
    options: shuffle([target, ...distractors]),
  };
}

export function evaluateLetterMatchRound(
  round: LetterMatchRound,
  answerValue: string
): RoundEvaluation {
  const isCorrect = answerValue === round.target.value;

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'match-correct' : 'match-try-again',
    detailLabel: isCorrect ? undefined : `That was ${labelForLetter(answerValue, 'lower')}.`,
  };
}
