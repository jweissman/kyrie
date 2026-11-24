import { describe, expect, it } from 'bun:test';
import { DeepLayouts } from '../../src/world/deep/deep-layout';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import { DeepSites } from '../../src/world/deep/deep-sites';

// Every town answers its own dungeon (sprint 3: a settlement that responds): for each of the deep purposes (the
// Delvers' mine, the barrow, the cisterns, the singing hall), what the company sold out of it is shown where its buyer
// keeps it, for as long as he does, by every kind it could be (its ore, or what its makers left); and the inn's keeper
// hears, once, that the company has been below its first level, and gives it a night on the house. Each purpose says
// it in words of its own.
const values = { w: 'x', name: 'the old place', merchant: 'm', keeper: 'k', keeperat: 'inn' };
describe('the town answering its dungeon', () => {
  const said = DeepPurposes.order.map(art => {
    const purpose = DeepPurposes.of(art)!, layout = DeepLayouts.make(purpose, 'x', `answers:${art}`);
    return { art, purpose, layout, lines: DeepSites.answers(purpose, values, layout) };
  });
  for (const { art, purpose, layout, lines } of said) {
    it(`for the ${art} purpose: what was sold, shown; and below the first level, heard`, () => {
      const shown = lines.find(l => l.includes('Observe x_ore_shown near m'))!;
      const kinds = purpose.ore ? [purpose.ore.kind] : Object.values(purpose.valuables ?? {}).flat().map(v => v.id);
      expect(kinds.length).toBeGreaterThan(0);
      for (const k of kinds) { expect(shown).toContain(`itemKind(?o, ${k})`); }
      const below = lines.find(l => l.includes('Rule x_below_talk'))!;
      expect(below).toContain(`been(party, ${layout.levels[1]!.rooms[0]!.id})`);
      expect(below).toContain('at(party, inn) and at(k, inn) and not x_below_told()');
      expect(below).toContain('Assert onTheHouse(k, party).');
      expect(shown + below).not.toMatch(/\{(merchant|keeper|name)\}/);
    });
  }
  it('says it differently for each purpose', () => {
    const words = said.flatMap(x => x.lines.map(l => /"([^"]+)"/.exec(l)?.[1]).filter(Boolean));
    expect(new Set(words).size).toBe(words.length);
    expect(words.length).toBe(2 * DeepPurposes.order.length);
  });
});
