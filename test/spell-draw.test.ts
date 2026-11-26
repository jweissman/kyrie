import { ItemCatalog } from '../src/item-catalog';
import { afterEach, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content, type CreatureGenerationContext } from '../src/content';
import { SpellSelection } from '../src/rules/spell-selection';
import type { Ability } from '../src/rules/catalog-schema';

// The spell draw is each spell's own (doc/architecture/mission-22/srd-proving-cases.md, case 11): a drawn caster's
// spells are the least of their options ranked by a hash of its seed and each spell's id. So one spell added to a
// level, or taken from it, changes only the casters who gain or lose that spell, and each of them by that spell
// alone: a draw by index into the level's sorted list had moved three mages in four (case 10).
const made = (who: CreatureGenerationContext, n: number) => Array.from({ length: n }, (_, i) =>
  new Set(new Content(`draw-${i}`).createCreature(ItemCatalog.canon, `c${i}`, { raceId: 'human', ...who }, `seed-${i}`).base.abilities));
const dummy = (level: number, school = 'evocation', tradition = 'arcane'): Ability => ({ name: 'Dummy', kind: 'spell',
  description: 'A spell that is only there to be drawn.', cost: 1, spell: { tradition, level, school },
  effects: [{ kind: 'damage', amount: { kind: 'literal', value: 1 }, damageType: 'fire', target: 'enemy' }] } as Ability);
const added: string[] = [];
const add = (id: string, a: Ability) => { Canon.abilities[id] = a; added.push(id); };
afterEach(() => { for (const id of added.splice(0)) { delete Canon.abilities[id]; } });
// Who moved, of casters made before and after: each must differ by the one spell exactly, gained.
const moved = (before: Set<string>[], after: Set<string>[], id: string) => before.flatMap((b, i) => {
  const a = after[i]!, lost = [...b].filter(s => !a.has(s)), gained = [...a].filter(s => !b.has(s));
  return lost.length || gained.length ? [{ lost: lost.length, gained }] : [];
}).map(m => { expect(m.gained).toEqual([id]); expect(m.lost).toBeLessThanOrEqual(1); return m; });
describe('the spell draw', () => {
  it('ranks each option by the seed and its id, whatever else is offered', () => {
    const pick = SpellSelection.ranked('a seed');
    expect(pick(['a', 'b', 'c'])).toBe(pick(['c', 'b', 'a']));
    // One more offered either wins or leaves the choice as it was.
    expect([pick(['a', 'b', 'c']), 'd']).toContain(pick(['a', 'b', 'c', 'd']));
  });
  for (const [who, level, spell] of [[{ classId: 'mage', traits: ['evoker'] }, 1, 1], [{ classId: 'mage' }, 7, 3],
    [{ classId: 'cleric', traits: ['vitalist'] }, 3, 2]] as const) {
    it(`moves only the ${who.classId}s of level ${level} who gain a spell added at level ${spell}`, () => {
      const at = { ...who, level, traits: [...'traits' in who ? who.traits : []] }, before = made(at, 60);
      add('test_dummy', who.classId === 'cleric' ? { ...dummy(spell, 'life', 'divine'),
        spell: { tradition: 'divine', level: spell, domain: 'life' } } : dummy(spell));
      const after = made(at, 60), changed = moved(before, after, 'test_dummy');
      expect(changed.length).toBe(after.filter(a => a.has('test_dummy')).length);
      expect(changed.length).toBeGreaterThan(0);
      expect(changed.length).toBeLessThan(30);
    });
  }
});
