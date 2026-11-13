import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { CatalogFields } from '../src/canon/catalog-fields';
import { Content } from '../src/content';
import { CreatureVariants, type Variation } from '../src/creature-variants';
import { KindDefenses } from '../src/kind-defenses';
import { Parties } from '../src/world/parties';

// A variation may carry Hit Dice and defenses (the lead's decision, 13 November): a golem's material or a kind's
// variation that is a stat block of its own makes the kind composed with it a fixed stat block, through the canon's
// variation machinery, and the honest catalog checks its fields as any record's. Proved here on a variation written
// for this spec alone (t_basalt, a golem's material), taken out after; the catalog's own are in srd-slices.
const variations = CreatureVariants.variations as Record<string, Variation>;
variations.t_basalt = { axis: 'material', word: 'basalt', says: 'of black basalt', kinds: ['monster'],
  types: ['construct'], hitDice: '6d10+20', attacks: ['tail', 'slam'], armor: 'shell',
  defenses: [{ kind: 'reduction', amount: 4, unless: ['adamantine'] }, { kind: 'immunity', to: ['fire'] }],
  forgoes: { abilities: ['smash'] }, unplaced: true };
afterAll(() => { delete variations.t_basalt; });
const content = new Content('srd-variations');

describe('a variation that is a stat block', () => {
  it('makes the composed kind its Hit Dice, routine, hide and defenses, less what it goes without', () => {
    const k = Canon.creature('golem/t_basalt');
    expect([k.statistics?.hitDice, k.statistics?.growth, k.statistics?.attacks, k.statistics?.weapon,
      k.statistics?.armor]).toEqual(['6d10+20', undefined, ['tail', 'slam'], 'tail', 'shell']);
    expect(k.abilities).toEqual(['defend']);
    // Its base's own (the golem's proof against poison) and then its own.
    expect(k.defenses).toEqual([...Canon.creature('golem').defenses!, ...variations.t_basalt!.defenses!]);
  });
  it('has its listed average at any level, whether named composed or given as a variation', () => {
    const at = (level: number, asked: object) => content.createCreature(`b${level}`, { level, ...asked });
    const named = [1, 4, 9].map(l => at(l, { raceId: 'golem/t_basalt' }));
    const given = [1, 4, 9].map(l => at(l, { raceId: 'golem', variations: ['t_basalt'] }));
    expect([...named, ...given].map(c => c.base.maxHp)).toEqual([53, 53, 53, 53, 53, 53]);
    expect(given.map(c => c.raceId)).toEqual(['golem/t_basalt', 'golem/t_basalt', 'golem/t_basalt']);
    expect(new Set([...named, ...given].map(c => c.base.strength)).size).toBe(1);
  });
  it('fights with its defenses and its routine', () => {
    const f = content.creature('golem/t_basalt', 'b', 'goblins');
    expect(KindDefenses.of(f)).toEqual(variations.t_basalt!.defenses!);
    expect(f.equipment.routine?.map(w => [w.id, !!w.lesser])).toEqual([['tail', false], ['slam', true]]);
  });
  it('is placed nowhere when it says so, and leaves every other variation as it was', () => {
    expect(CreatureVariants.structurals('golem')).not.toContain('t_basalt');
    expect(Parties.kinds()).not.toContain('golem/t_basalt');
    for (const kind of Parties.kinds().filter(k => k.includes('/'))) {
      const base = Canon.creature(kind.split('/')[0]!);
      expect([kind, Canon.creature(kind).statistics]).toEqual([kind, base.statistics]);
    }
  });
});

describe('the honest catalog over variations', () => {
  it('has no unknown field in any variation, and refuses one', () => {
    expect(CatalogFields.problems()).toEqual([]);
    (variations.t_basalt as unknown as Record<string, unknown>).stamina = 3;
    try {
      expect(CatalogFields.problems()).toEqual(['variation t_basalt: unknown field stamina']);
    } finally { delete (variations.t_basalt as unknown as Record<string, unknown>).stamina; }
  });
  it('refuses a stat block that is not one: dice that are not dice, a routine of no natural weapon, a defense malformed', () => {
    const was = structuredClone(variations.t_basalt!);
    Object.assign(variations.t_basalt!, { hitDice: 'many', attacks: ['longsword'], armor: 'tail',
      defenses: [{ kind: 'reduction', amount: 4, unless: ['silvery'] }], forgoes: { abilities: ['t_none'] } });
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('variation t_basalt'))
        .map(p => p.replace(/defense \{.*\}/, 'defense'))).toEqual(['variation t_basalt: hit dice many are not dice',
        'variation t_basalt: defense: unknown attack tag silvery', 'variation t_basalt: longsword is no natural weapon',
        'variation t_basalt: hide tail is not armour', 'variation t_basalt: forgoes unknown ability t_none']);
    } finally { variations.t_basalt = was; }
  });
});
