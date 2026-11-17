import { describe, expect, it } from 'bun:test';
import { Draw } from '../../src/world/land/draw';

// The wild's stretches are chosen by a draw of each one's own (AR-17: a province added re-seeded every world's wild,
// 11 of a1's 17 animals elsewhere, because the animals, the meetings and the rovers each shuffled the whole list of
// open stretches, and the new way in took some). Ranked by its own draw, a stretch taken out or put in moves no other.
describe('a stretch of the wild', () => {
  const cells = Array.from({ length: 400 }, (_, i) => i * 3 + 1);
  const ranked = Draw.ranked('a1:animals', cells);
  it('keeps its place among the rest when another is taken', () => {
    for (const gone of [cells[0]!, cells[137]!, cells[399]!]) {
      expect(Draw.ranked('a1:animals', cells.filter(c => c !== gone))).toEqual(ranked.filter(c => c !== gone));
    }
    expect(Draw.ranked('a1:animals', [...cells, 2000])).toEqual(expect.arrayContaining(ranked));
    expect(Draw.ranked('a1:animals', [...cells, 2000]).filter(c => c !== 2000)).toEqual(ranked);
  });
  it('is drawn, not counted: by key, whatever order the list comes in', () => {
    expect(Draw.ranked('a1:animals', [...cells].reverse())).toEqual(ranked);
    expect(ranked).not.toEqual(cells);
    expect(Draw.ranked('kite:animals', cells)).not.toEqual(ranked);
    // Neighbouring stretches are not ranked together: the first forty are spread over the country.
    const first = ranked.slice(0, 40), spread = Math.max(...first) - Math.min(...first);
    expect(spread).toBeGreaterThan(cells.at(-1)! / 2);
  });
});
