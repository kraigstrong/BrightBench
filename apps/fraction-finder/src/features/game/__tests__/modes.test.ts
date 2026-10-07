import { generateEstimateRound, evaluateEstimateRound } from '@/features/game/modes/estimate';
import { generateFindRound } from '@/features/game/modes/find';
import { generateLineRound, evaluateLineRound } from '@/features/game/modes/line';
import { evaluatePourRound } from '@/features/game/modes/pour';
import { getFraction } from '@/features/game/math';
import { LineRound } from '@/features/game/types';

describe('mode engines', () => {
  it('creates find rounds with the target inside the choices', () => {
    const round = generateFindRound({ difficultyLevel: 'medium' });

    expect(round.options).toContain(round.targetFractionId);
    expect(round.options.length).toBeGreaterThanOrEqual(3);
  });

  it('evaluates estimate answers against the generated nearest target', () => {
    const round = generateEstimateRound({ difficultyLevel: 'medium' });
    const result = evaluateEstimateRound(round, round.targetFractionId);

    expect(result.isCorrect).toBe(true);
    expect(result.nearestFractionId).toBe(round.targetFractionId);
  });

  it('keeps easy rounds within the benchmark fraction set', () => {
    const allowed = new Set(['1-2', '1-4', '3-4']);

    for (let index = 0; index < 12; index += 1) {
      const round = generateFindRound({ difficultyLevel: 'easy' });
      expect(allowed.has(round.targetFractionId)).toBe(true);
      expect(round.options.every((option) => allowed.has(option))).toBe(true);
    }
  });

  it('scores pours by closeness to the target fraction', () => {
    const close = evaluatePourRound(
      {
        id: 'pour-test',
        mode: 'pour',
        prompt: 'Fill to about 1/2.',
        targetFractionId: '1-2',
        representation: 'container',
        difficultyLevel: 'easy',
        tolerance: 0.08,
      },
      0.52
    );
    const far = evaluatePourRound(
      {
        id: 'pour-test',
        mode: 'pour',
        prompt: 'Fill to about 1/2.',
        targetFractionId: '1-2',
        representation: 'container',
        difficultyLevel: 'easy',
        tolerance: 0.08,
      },
      0.18
    );

    expect(close.isCorrect).toBe(true);
    expect(close.scoreBand).toBe('exact');
    expect(far.isCorrect).toBe(false);
    expect(far.scoreBand).toBe('far');
  });

  it('builds number-line rounds from the existing pools, running to 2 on Hard', () => {
    const easyRound = generateLineRound({ difficultyLevel: 'easy' });
    const mediumRound = generateLineRound({ difficultyLevel: 'medium' });
    const hardRound = generateLineRound({ difficultyLevel: 'hard' });

    expect(easyRound.lineMax).toBe(1);
    expect(['1-2', '1-4', '3-4']).toContain(easyRound.targetFractionId);
    expect(easyRound.prompt).toBe(`Hop the frog to ${getFraction(easyRound.targetFractionId).label}.`);
    expect(mediumRound.lineMax).toBe(1);
    expect(hardRound.lineMax).toBe(2);
  });

  it('scores number-line hops only when they land exactly, equivalents included', () => {
    const round: LineRound = {
      id: 'line-test',
      mode: 'line',
      prompt: 'Hop the frog to 5/4.',
      targetFractionId: '5-4',
      representation: 'line',
      difficultyLevel: 'hard',
      lineMax: 2,
    };
    const own = evaluateLineRound(round, { parts: 4, hops: 5 });
    const equivalent = evaluateLineRound(round, { parts: 8, hops: 10 });
    const near = evaluateLineRound(round, { parts: 6, hops: 7 });
    const far = evaluateLineRound({ ...round, targetFractionId: '1-2', lineMax: 1 }, { parts: 8, hops: 7 });

    expect(own).toEqual(expect.objectContaining({ isCorrect: true, scoreBand: 'exact', actualValue: 1.25 }));
    expect(equivalent).toEqual(expect.objectContaining({ isCorrect: true, scoreBand: 'exact' }));
    // 7/6 is 0.083 from 5/4, inside the old Hard tolerance of 0.1. Hop It does not accept it.
    expect(near.isCorrect).toBe(false);
    expect(near.scoreBand).toBe('almost');
    expect(near.detailLabel).toBe('Try a little farther right.');
    expect(far.isCorrect).toBe(false);
    expect(far.scoreBand).toBe('far');
    expect(far.detailLabel).toBe('Try a little farther left.');
  });

  it('never calls a wrong landing exact, even when it sits very near the target', () => {
    const round: LineRound = {
      id: 'line-test',
      mode: 'line',
      prompt: 'Hop the frog to 1/6.',
      targetFractionId: '1-6',
      representation: 'line',
      difficultyLevel: 'medium',
      lineMax: 1,
    };
    const result = evaluateLineRound(round, { parts: 7, hops: 1 });

    expect(result.isCorrect).toBe(false);
    expect(result.scoreBand).toBe('close');
  });
});
