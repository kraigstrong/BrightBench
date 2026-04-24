import { evaluateCasePairRound, generateCasePairRound } from '@/features/game/modes/case';
import { evaluateLetterMatchRound, generateLetterMatchRound } from '@/features/game/modes/match';
import { evaluateSoundMatchRound, generateSoundMatchRound } from '@/features/game/modes/sound';
import { evaluateTapLetterRound, generateTapLetterRound } from '@/features/game/modes/tap';
import {
  AnyRound,
  CasePairRound,
  GameMode,
  GenerateRoundOptions,
  LetterMatchRound,
  RoundEvaluation,
  SoundMatchRound,
  TapLetterRound,
} from '@/features/game/types';

export function generateRound(mode: GameMode, options: GenerateRoundOptions): AnyRound {
  switch (mode) {
    case 'match':
      return generateLetterMatchRound(options);
    case 'case':
      return generateCasePairRound(options);
    case 'tap':
      return generateTapLetterRound(options);
    case 'sound':
      return generateSoundMatchRound(options);
  }
}

export function evaluateRound(mode: GameMode, round: AnyRound, input: unknown): RoundEvaluation {
  const answerValue = typeof input === 'string' ? input.toLowerCase() : '';

  switch (mode) {
    case 'match':
      return evaluateLetterMatchRound(round as LetterMatchRound, answerValue);
    case 'case':
      return evaluateCasePairRound(round as CasePairRound, answerValue);
    case 'tap':
      return evaluateTapLetterRound(round as TapLetterRound, answerValue);
    case 'sound':
      return evaluateSoundMatchRound(round as SoundMatchRound, answerValue);
  }
}
