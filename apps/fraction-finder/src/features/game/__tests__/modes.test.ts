import { generateEstimateRound, evaluateEstimateRound } from '@/features/game/modes/estimate';
import { generateFindRound } from '@/features/game/modes/find';
import { evaluatePourRound } from '@/features/game/modes/pour';

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
});
