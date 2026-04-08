import { fractionsForMode } from '@/features/game/fractions';
import { compareFractionIds, shuffle } from '@/features/game/math';
import { CompareRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateCompareRound(options: GenerateRoundOptions): CompareRound {
  const pool = shuffle(fractionsForMode('compare', options.difficultyLevel));
  const [left, right] = pool.slice(0, 2);

  return {
    id: `compare-${Date.now()}`,
    mode: 'compare',
    prompt: 'Which one is bigger?',
    targetFractionId: compareFractionIds(left.id, right.id) >= 0 ? left.id : right.id,
    representation: 'bar',
    difficultyLevel: options.difficultyLevel,
    leftFractionId: left.id,
    rightFractionId: right.id,
    leftRepresentation: left.denominator <= 4 ? 'bar' : 'meter',
    rightRepresentation: right.denominator <= 4 ? 'bar' : 'meter',
  };
}

export function evaluateCompareRound(
  round: CompareRound,
  answer: 'left' | 'right'
): RoundEvaluation {
  const winningSide = round.targetFractionId === round.leftFractionId ? 'left' : 'right';

  return {
    isCorrect: answer === winningSide,
    scoreBand: answer === winningSide ? 'exact' : 'almost',
    feedbackKey: answer === winningSide ? 'compare-correct' : 'compare-check-size',
  };
}
