import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';

// What a work's old name means reads as a gloss reads: "eagle spire", not "eagles spire" (play 11's Achilaspir).
describe('the old names of the works', () => {
  it('mean what they mean in the singular, as a landmark\'s do', () => {
    const glosses = ['kite', 'wren', 'thorn', 'mere', 'c3', 'b2'].flatMap(seed => WorldAssembler.region(seed, [0, 0])
      .sites.flatMap(s => s.gloss ? [s.gloss] : []));
    expect(glosses.length).toBeGreaterThan(10);
    expect(glosses.filter(g => /^(eagles|swans|wolves|bears) /.test(g))).toEqual([]);
  }, 60000);
});
