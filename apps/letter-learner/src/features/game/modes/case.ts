import {
  EASY_LETTERS,
  LETTERS,
  VISUAL_CONFUSABLES,
  makeLetterOption,
  oppositeCaseOption,
} from '@/features/game/letters';
import { makeRoundId, sample, shuffle, takeRandom } from '@/features/game/math';
import { CasePairRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateCasePairRound(options: GenerateRoundOptions): CasePairRound {
  const pool =
    options.difficultyLevel === 'easy'
      ? EASY_LETTERS
      : options.difficultyLevel === 'hard'
        ? shuffle([...new Set([...VISUAL_CONFUSABLES, ...LETTERS])])
        : LETTERS;
  const targetLetter = sample(pool);
  const targetCase = Math.random() > 0.5 ? 'upper' : 'lower';
  const target = makeLetterOption(targetLetter, targetCase, 'case-target');
  const answer = oppositeCaseOption(targetLetter, target.label);
  const distractors = takeRandom(pool, 3, [targetLetter]).map((letter) =>
    makeLetterOption(letter, answer.label === answer.label.toUpperCase() ? 'upper' : 'lower', 'case-option')
  );

  return {
    id: makeRoundId('case'),
    mode: 'case',
    prompt: `Find the match for ${target.label}`,
    hint: 'Choose the same letter in the other case.',
    difficultyLevel: options.difficultyLevel,
    target,
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

export function evaluateCasePairRound(
  round: CasePairRound,
  answerValue: string
): RoundEvaluation {
  const isCorrect = answerValue === round.answer.value;

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'case-correct' : 'case-try-again',
    detailLabel: isCorrect ? undefined : `${round.target.label} pairs with ${round.answer.label}.`,
  };
}
