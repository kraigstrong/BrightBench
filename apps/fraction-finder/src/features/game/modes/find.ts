import { fractionsForMode } from '@/features/game/fractions';
import { distractorsForFraction, sample, shuffle } from '@/features/game/math';
import { FindRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateFindRound(options: GenerateRoundOptions): FindRound {
  const pool = fractionsForMode('find', options.difficultyLevel);
  const target = sample(pool);
  const distractors = distractorsForFraction(target.id, pool, Math.min(3, pool.length - 1));

  return {
    id: `find-${Date.now()}`,
    mode: 'find',
    prompt: 'Which fraction matches this picture?',
    targetFractionId: target.id,
    representation: 'bar',
    difficultyLevel: options.difficultyLevel,
    options: shuffle([target.id, ...distractors]),
  };
}

export function evaluateFindRound(round: FindRound, answerId: string): RoundEvaluation {
  return {
    isCorrect: answerId === round.targetFractionId,
    scoreBand: answerId === round.targetFractionId ? 'exact' : 'almost',
    feedbackKey: answerId === round.targetFractionId ? 'find-correct' : 'find-try-again',
  };
}
