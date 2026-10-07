import { missMessage, packFilled, successMessage } from '@/features/game/build/build-engine';
import { canMakeTarget, partName } from '@/features/game/equal-parts';
import { evaluateBuildRound } from '@/features/game/modes/build';
import { BuildRound } from '@/features/game/types';

const threeQuarters: BuildRound = {
  id: 'build-test',
  mode: 'build',
  prompt: 'Make 3/4.',
  targetFractionId: '3-4',
  representation: 'bar',
  difficultyLevel: 'medium',
  partitions: 4,
};

describe('Build scoring', () => {
  it("accepts the target's own parts", () => {
    expect(evaluateBuildRound(threeQuarters, { pieces: 4, filled: 3 })).toEqual(
      expect.objectContaining({ isCorrect: true, scoreBand: 'exact', feedbackKey: 'build-correct' })
    );
  });

  it('accepts an equivalent build', () => {
    expect(evaluateBuildRound(threeQuarters, { pieces: 8, filled: 6 }).isCorrect).toBe(true);
  });

  it('rejects other amounts and says which way to adjust', () => {
    expect(evaluateBuildRound(threeQuarters, { pieces: 4, filled: 2 })).toEqual(
      expect.objectContaining({ isCorrect: false, detailLabel: 'Try shading a little more.' })
    );
    expect(evaluateBuildRound(threeQuarters, { pieces: 8, filled: 7 }).detailLabel).toBe(
      'Try shading a little less.'
    );
    expect(evaluateBuildRound(threeQuarters, { pieces: 3, filled: 2 }).isCorrect).toBe(false);
  });
});

describe('Build messages', () => {
  it('names parts and knows which cuts can make a target', () => {
    expect(partName(4)).toBe('fourths');
    expect(canMakeTarget('3-4', 8)).toBe(true);
    expect(canMakeTarget('3-4', 6)).toBe(false);
  });

  it("explains when a cut can't make the target", () => {
    expect(missMessage('3-4', 3, 2)).toEqual({
      title: "Thirds can't make exactly 3/4.",
      body: 'The dashed lines show fourths. Try a cut that lines up with them.',
      tone: 'adjust',
    });
    expect(missMessage('3-4', 1, 1).title).toBe("One whole piece can't make exactly 3/4.");
  });

  it('says which way a workable cut was off', () => {
    expect(missMessage('3-4', 8, 4).title).toBe('Less than 3/4.');
    expect(missMessage('3-4', 4, 4).title).toBe('More than 3/4.');
  });

  it('names an equivalent build on success', () => {
    expect(successMessage('3-4', 4, 3)).toEqual({
      title: "That's 3/4!",
      body: '3 of 4 equal parts.',
      tone: 'success',
    });
    expect(successMessage('3-4', 8, 6)).toEqual({
      title: '6 eighths is the same as 3/4!',
      body: '6 of 8 equal parts fill the same space as 3 of 4.',
      tone: 'success',
    });
  });

  it('packs filled pieces to the left', () => {
    expect(packFilled(4, 3)).toEqual([true, true, true, false]);
  });
});
