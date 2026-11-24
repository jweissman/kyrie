import { describe, expect, it } from 'bun:test';
import { Marks } from '../../src/ui/marks';

// A fight that can end the life of the one who plays asks before it is begun (OR-322): one that could be lost, or one
// in which the reckoning's own fights felled the one who plays, however often the company won them. The quantity
// gate's census reads this one rule.
describe('a fight that can kill', () => {
  it('asks when it could be lost, or could fell the one who plays', () => {
    expect(Marks.asks({ danger: 'grave' })).toBe(true);
    expect(Marks.asks({ danger: 'deadly' })).toBe(true);
    expect(Marks.asks({ danger: 'hard', mortal: true })).toBe(true);
    expect(Marks.asks({ danger: 'hard' })).toBe(false);
    expect(Marks.asks({ danger: 'fair' })).toBe(false);
  });
});
