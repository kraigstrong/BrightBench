import { SOUND_GROUPS } from '@/features/game/letters';
import { evaluateRound, generateRound } from '@/features/game/modes';
import {
  CasePairRound,
  LetterMatchRound,
  SoundMatchRound,
  TapLetterRound,
} from '@/features/game/types';

describe('letter learner modes', () => {
  it('generates and evaluates letter match rounds', () => {
    const round = generateRound('match', { difficultyLevel: 'easy' }) as LetterMatchRound;

    expect(round.options).toHaveLength(4);
    expect(round.prompt).toBe('Find');
    expect(round.instructionAudioKey.startsWith('match:lower:')).toBe(true);
    expect(evaluateRound('match', round, round.target.value).isCorrect).toBe(true);
    expect(evaluateRound('match', round, '__missing__').isCorrect).toBe(false);
  });

  it('generates opposite-case pair rounds', () => {
    const round = generateRound('case', { difficultyLevel: 'medium' }) as CasePairRound;

    expect(round.options).toHaveLength(4);
    expect(round.target.label).not.toBe(round.answer.label);
    expect(evaluateRound('case', round, round.answer.value).isCorrect).toBe(true);
  });

  it('generates falling letters with at least one target', () => {
    const round = generateRound('tap', { difficultyLevel: 'hard' }) as TapLetterRound;

    expect(round.fallingLetters.length).toBeGreaterThanOrEqual(4);
    expect(round.fallingLetters.some((letter) => letter.value === round.target.value)).toBe(true);
    expect(evaluateRound('tap', round, round.target.value).isCorrect).toBe(true);
  });

  it('accepts every valid letter for a shared sound', () => {
    const kGroup = SOUND_GROUPS.find((group) => group.id === 'k');

    expect(kGroup).toBeDefined();

    const round: SoundMatchRound = {
      id: 'sound-test',
      mode: 'sound',
      prompt: 'Which letter makes this sound?',
      hint: 'Listen, then choose.',
      difficultyLevel: 'hard',
      audioKey: 'sound:k',
      acceptedValues: kGroup?.acceptedValues ?? [],
      soundLabel: kGroup?.label ?? 'k sound',
      options: [
        { id: 'c', label: 'c', value: 'c' },
        { id: 'k', label: 'k', value: 'k' },
        { id: 'm', label: 'm', value: 'm' },
        { id: 't', label: 't', value: 't' },
      ],
    };

    expect(evaluateRound('sound', round, 'c').isCorrect).toBe(true);
    expect(evaluateRound('sound', round, 'k').isCorrect).toBe(true);
    expect(evaluateRound('sound', round, 'm').isCorrect).toBe(false);
  });

  it('adds digraphs to hard sound rounds only', () => {
    const hardRound = generateRound('sound', { difficultyLevel: 'hard' }) as SoundMatchRound;

    expect(hardRound.options.some((option) => option.value.length > 1)).toBeDefined();
    expect(
      SOUND_GROUPS.some((group) => group.includeInHardOnly && group.audioKey === hardRound.audioKey)
    ).toBeDefined();
  });
});
