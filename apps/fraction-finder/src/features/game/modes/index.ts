import { generateBuildRound, evaluateBuildRound } from '@/features/game/modes/build';
import { generateCompareRound, evaluateCompareRound } from '@/features/game/modes/compare';
import { generateEstimateRound, evaluateEstimateRound } from '@/features/game/modes/estimate';
import { generateFindRound, evaluateFindRound } from '@/features/game/modes/find';
import { generateLineRound, evaluateLineRound } from '@/features/game/modes/line';
import { generatePourRound, evaluatePourRound } from '@/features/game/modes/pour';
import { AnyRound, GameMode, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateRound(mode: GameMode, options: GenerateRoundOptions): AnyRound {
  switch (mode) {
    case 'find':
      return generateFindRound(options);
    case 'build':
      return generateBuildRound(options);
    case 'compare':
      return generateCompareRound(options);
    case 'estimate':
      return generateEstimateRound(options);
    case 'pour':
      return generatePourRound(options);
    case 'line':
      return generateLineRound(options);
  }
}

export function evaluateRound(mode: GameMode, round: AnyRound, input: unknown): RoundEvaluation {
  switch (mode) {
    case 'find':
      return evaluateFindRound(round as Extract<AnyRound, { mode: 'find' }>, input as string);
    case 'build':
      return evaluateBuildRound(round as Extract<AnyRound, { mode: 'build' }>, input as number);
    case 'compare':
      return evaluateCompareRound(
        round as Extract<AnyRound, { mode: 'compare' }>,
        input as 'left' | 'right'
      );
    case 'estimate':
      return evaluateEstimateRound(
        round as Extract<AnyRound, { mode: 'estimate' }>,
        input as string
      );
    case 'pour':
      return evaluatePourRound(round as Extract<AnyRound, { mode: 'pour' }>, input as number);
    case 'line':
      return evaluateLineRound(round as Extract<AnyRound, { mode: 'line' }>, input as number);
  }
}
