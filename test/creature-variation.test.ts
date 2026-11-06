import { describe, expect, it } from 'bun:test';
import registry from '../data/sources/orsino/registry.json';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Effects } from '../src/effects';
import { ItemCatalog } from '../src/item-catalog';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { OrsinoBestiary } from '../src/registry/orsino-bestiary';
import { PlaySession } from '../src/session/play-session';
import type { RegistryEntry } from '../src/registry/orsino-extract';

// What a creature is beside its kind, as structure (the owner, 5 November, late: a golem's material, a dragon's
// lineage, an elemental's element, a stag's sex are variations of one base, not species of their own): each made by the
// one way creatures are made, from its kind's record with its variations laid over it (data/catalog/variations.json),
// with mechanical consequences, kept with the creature as it was made, and refused where it does not fit.
const make = (raceId: string, variations?: string[], level?: number) => new Content('variation').createCreature('c',
  { raceId, ...variations ? { variations } : {}, ...level ? { level } : {} } as never, 'c');
const scores = (c: ReturnType<typeof make>) => [c.base.strength, c.base.dexterity, c.base.constitution];
const orsino = (id: string) => (registry.entries as unknown as RegistryEntry[]).find(e => e.id === id)!
  .definition as Record<string, number>;

describe('a creature and its variations', () => {
  it('makes a golem of two materials by one pathway, each as Orsino\'s substance makes it', () => {
    const golem = make('golem'), iron = make('golem', ['iron']), clay = make('golem', ['clay']);
    for (const [made, stuff] of [[iron, 'iron'], [clay, 'clay']] as const) {
      const d = orsino(`golemSubstance:${stuff}`);
      expect(scores(made)).toEqual([golem.base.strength + (d.str ?? 0), golem.base.dexterity + (d.dex ?? 0),
        golem.base.constitution + (d.con ?? 0)]);
      expect([made.raceId, made.variations]).toEqual(['golem', [stuff]]);
    }
    expect(scores(iron)).not.toEqual(scores(clay));
    // The name the works have used is the golem with its material, made the same way.
    expect(scores(make('iron_golem'))).toEqual(scores(iron));
    expect(Canon.materials.iron!.kind).toBe('metal');
  });
  it('gives a dragon its lineage\'s breath and its proof against what it breathes', () => {
    const red = CombatProjection.fighter(make('dragon', ['red_lineage']), 'goblins');
    const white = CombatProjection.fighter(make('dragon', ['white_lineage']), 'goblins');
    expect([red.equipment.weapon.id, white.equipment.weapon.id, red.abilities.includes('breathe_fire')])
      .toEqual(['bite', 'ice_breath', true]);
    expect([Effects.modifiers(red).resistances?.fire, Effects.modifiers(white).resistances?.cold])
      .toEqual([0.75, 0.75]);
    expect(make('red_dragon').variations).toEqual(['red_lineage']);
    expect(ItemCatalog.equipment(make('dragon')).weapon.id).toBe('bite');
  });
  it('makes each of Orsino\'s seventeen elementals the Elemental of an element, and calls them up by that', () => {
    const fire = make('fire_elemental'), water = make('water_elemental');
    expect([fire.raceId, fire.variations, water.variations]).toEqual(['fire_elemental', ['fire_element'], ['water_element']]);
    expect(fire.base.abilities).toContain('burning_hands');
    expect([fire.traits, water.traits]).toEqual([expect.arrayContaining(['fire_affinity', 'water_vulnerability']),
      expect.arrayContaining(['water_affinity', 'earth_vulnerability'])]);
    const called = OrsinoBestiary.vocabulary(registry.entries as unknown as RegistryEntry[]).byType.elemental!;
    expect(called).toEqual(expect.arrayContaining(['fire_elemental', 'water_elemental']));
    expect(called).not.toContain('elemental');
  });
  it('refuses what does not fit: a material on a wolf, a lineage on a golem, two of one axis', () => {
    expect(() => make('wolf', ['iron'])).toThrow('not for a wolf');
    expect(() => make('golem', ['red_lineage'])).toThrow('not for a golem');
    expect(() => make('golem', ['iron', 'clay'])).toThrow('two variations of its material');
  });
  it('makes a stag the deer, the male, and grows an animal with its level from Orsino\'s first', () => {
    const deer = make('deer'), stag = make('stag'), d = orsino('animal:deer');
    expect(stag.variations).toEqual(['male']);
    expect(stag.base.strength).toBeGreaterThan(deer.base.strength);
    expect(deer.base.maxHp).toBe(Number(d.hp));
    expect(make('deer', undefined, 6).base.maxHp).toBeGreaterThan(deer.base.maxHp);
  });
  it('keeps an authored stone golem and a dragon of words as they were made, across a save and its reading again', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'g/site.kyr': `Module g "Guardians" { Place hall "the hall" is room. Company party "You" of 1 at hall.
        Person warden "the warden" at hall { Role "a guardian of the hall". Species golem. Variant stone. }
        Person drake "a drake" at hall { Creature lineage green, maturity wyrmling. } }`,
      'g/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'g.campaign.json': JSON.stringify({ version: 1, name: 'g', modules: [{ id: 'p', bundle: 'g/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('g.campaign.json'), 'g', source);
    const shape = (c: ReturnType<typeof make>) => ({ kind: c.raceId, variations: c.variations, hp: c.base.maxHp,
      con: c.base.constitution, weapon: ItemCatalog.equipment(c).weapon.id });
    const made = () => s.campaign.readout.creatures.filter(c => ['golem', 'dragon'].includes(c.raceId)).map(shape);
    expect(made().map(m => [m.kind, m.variations, m.weapon])).toEqual([['golem', ['stone'], 'slam'],
      ['dragon', ['green_lineage', 'young'], 'poison_breath']]);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(again.campaign.readout.creatures.filter(c => ['golem', 'dragon'].includes(c.raceId)).map(shape)).toEqual(made());
  }, 60000);
});
