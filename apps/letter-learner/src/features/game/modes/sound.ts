import {
  DIGRAPHS,
  LETTERS,
  makeLetterOption,
  soundGroupsForDifficulty,
} from '@/features/game/letters';
import { makeRoundId, sample, shuffle, takeRandom } from '@/features/game/math';
import { GenerateRoundOptions, LetterOption, RoundEvaluation, SoundMatchRound } from '@/features/game/types';

export function generateSoundMatchRound(options: GenerateRoundOptions): SoundMatchRound {
  const groups = soundGroupsForDifficulty(options.difficultyLevel);
  const targetGroup = sample(groups);
  const optionValues: string[] = options.difficultyLevel === 'hard' ? [...LETTERS, ...DIGRAPHS] : LETTERS;
  const acceptedInPool = targetGroup.acceptedValues.filter((value) => optionValues.includes(value));
  const correctValue = sample(acceptedInPool.length ? acceptedInPool : targetGroup.acceptedValues);
  const distractors = takeRandom(optionValues, 3, targetGroup.acceptedValues as readonly string[]);
  const optionCase = options.difficultyLevel === 'medium' ? 'upper' : 'lower';
  const optionsList: LetterOption[] = shuffle([correctValue, ...distractors]).map((value) =>
    makeLetterOption(value, value.length > 1 ? 'lower' : optionCase, 'sound-option')
  );

  return {
    id: makeRoundId('sound'),
    mode: 'sound',
    prompt: 'Which letter makes this sound?',
    hint: 'Play the sound, then tap any matching letter.',
    difficultyLevel: options.difficultyLevel,
    audioKey: targetGroup.audioKey,
    acceptedValues: targetGroup.acceptedValues,
    options: optionsList,
    soundLabel: targetGroup.label,
  };
}

export function evaluateSoundMatchRound(
  round: SoundMatchRound,
  answerValue: string
): RoundEvaluation {
  const isCorrect = round.acceptedValues.includes(answerValue.toLowerCase());

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'sound-correct' : 'sound-try-again',
    detailLabel: isCorrect ? undefined : `Listen again for the ${round.soundLabel} sound.`,
  };
}
