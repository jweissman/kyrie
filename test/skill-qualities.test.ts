import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Checks } from '../src/rules/checks';

// Wapshott's Circus (WPC-X03): a new skill had to be written in four shared places, one of them engine code, the
// quality its check rests on. The catalog says it (skills.json's `rests`), and the check reads it from there.
describe('the quality a skill rests on', () => {
  it('is the catalog\'s, for every skill that is tried', () => {
    const tried = Object.entries(Canon.skills).filter(([, s]) => s.rests);
    expect(tried.length).toBeGreaterThan(15);
    expect(tried.every(([id, s]) => Checks.qualities[id] === s.rests)).toBe(true);
    expect(Object.keys(Checks.qualities).filter(id => !Canon.skills[id])).toEqual(['perception']);
    expect([Checks.qualities.performance, Checks.qualities.tumbling, Checks.qualities.lore])
      .toEqual(['charisma', 'dexterity', 'intelligence']);
  });
});
