import { generateEstimateRound, evaluateEstimateRound } from '@/features/game/modes/estimate';
import { generateFindRound } from '@/features/game/modes/find';
import { generateLineRound, evaluateLineRound } from '@/features/game/modes/line';
import { evaluatePourRound } from '@/features/game/modes/pour';
import { getFraction } from '@/features/game/math';

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

  it('builds easy number-line rounds with quarter marks', () => {
    const round = generateLineRound({ difficultyLevel: 'easy' });

    expect(round.lineMax).toBe(1);
    expect(round.segmentCount).toBe(4);
    expect(['1-2', '1-4', '3-4']).toContain(round.targetFractionId);
  });

  it('builds medium and hard number-line rounds from denominator-based partitions', () => {
    const mediumRound = generateLineRound({ difficultyLevel: 'medium' });
    const hardRound = generateLineRound({ difficultyLevel: 'hard' });
    const mediumTarget = getFraction(mediumRound.targetFractionId);
    const hardTarget = getFraction(hardRound.targetFractionId);

    expect(mediumRound.lineMax).toBe(1);
    expect(mediumRound.segmentCount).toBe(mediumTarget.denominator);
    expect(hardRound.lineMax).toBe(2);
    expect(hardRound.segmentCount).toBe(hardTarget.denominator * 2);
  });

  it('scores number-line placement by closeness to the target point', () => {
    const close = evaluateLineRound(
      {
        id: 'line-test',
        mode: 'line',
        prompt: 'Where does 5/4 go on the number line?',
        targetFractionId: '5-4',
        representation: 'line',
        difficultyLevel: 'hard',
        lineMax: 2,
        segmentCount: 8,
        tolerance: 0.1,
      },
      1.29
    );
    const far = evaluateLineRound(
      {
        id: 'line-test',
        mode: 'line',
        prompt: 'Where does 1/2 go on the number line?',
        targetFractionId: '1-2',
        representation: 'line',
        difficultyLevel: 'easy',
        lineMax: 1,
        segmentCount: 4,
        tolerance: 0.08,
      },
      0.82
    );

    expect(close.isCorrect).toBe(true);
    expect(close.scoreBand).toBe('close');
    expect(close.nearestFractionId).toBe('5-4');
    expect(far.isCorrect).toBe(false);
    expect(far.scoreBand).toBe('far');
  });
});
