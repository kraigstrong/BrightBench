import {
  ADJUST_MESSAGE,
  hopSizeLabel,
  hopsLabel,
  missMessage,
  successMessage,
} from '@/features/game/line/hop-engine';

describe('Hop It engine', () => {
  it('names hop sizes and counts', () => {
    expect(hopSizeLabel(1)).toBe('1 whole');
    expect(hopSizeLabel(4)).toBe('1/4');
    expect(hopsLabel(1)).toBe('1 hop');
    expect(hopsLabel(3)).toBe('3 hops');
  });

  it('explains a hop size that cannot land on the target', () => {
    expect(missMessage('3-4', 3, 2)).toEqual({
      title: "Thirds can't land exactly on 3/4.",
      body: 'The dashed marks show fourths. Try hops that line up with them.',
      tone: 'adjust',
    });
    expect(missMessage('1-2', 1, 1).title).toBe("Whole hops can't land exactly on 1/2.");
  });

  it('says whether a workable hop size fell short or went past', () => {
    expect(missMessage('3-4', 8, 5)).toEqual({
      title: 'Not quite to 3/4.',
      body: 'The flag shows where 3/4 is.',
      tone: 'adjust',
    });
    expect(missMessage('5-4', 4, 6).title).toBe("That's past 5/4.");
    expect(ADJUST_MESSAGE.title).toBe('Hop to the flag.');
  });

  it("names the target's own hops, and explains an equivalent landing", () => {
    expect(successMessage('3-4', 4, 3)).toEqual({
      title: "That's 3/4!",
      body: '3 hops of 1/4.',
      tone: 'success',
    });
    expect(successMessage('1-2', 2, 1).body).toBe('1 hop of 1/2.');
    expect(successMessage('3-4', 8, 6)).toEqual({
      title: '6 eighths is the same as 3/4!',
      body: '6 hops of 1/8 land on the same spot as 3 hops of 1/4.',
      tone: 'success',
    });
  });
});
