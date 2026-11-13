import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Content } from '../src/content';
import { CreatureVariants } from '../src/creature-variants';
import { RegionEcology } from '../src/world/region-ecology';
import { Draw } from '../src/world/land/draw';
import { Canon } from '../src/canon/canon';
import type { Region, Site } from '../src/world/region-writer';

// What makes one creature of a kind other than the rest: Orsino's aspects (a venomous wolf has a poisonous bite and
// a tougher hide) and its undead templates (a skeletal wolf is undead, brittle, and shrugs off arrows). An author
// writes them in a Person; a den draws them, an aspect by rarity, and in a barrow or a ruin sometimes the dead of the
// beast, which rites lay down.
describe('a creature other than its kind', () => {
  it('is written as an aspect or as the dead of its kind, and is made so', () => {
    const m = ModuleParser.parse(`Module t "T" {
  Place den "The den" is room.
  Person hounds "the hounds" at den { Role "hounds". Species wolf. Aspect venomous. Numbers 2. }
  Person bones "the bones" at den { Role "a dead wolf". Species wolf. Undead skeletal. }
}`);
    const [hounds, bones] = m.people!;
    expect([hounds!.aspect, bones!.template]).toEqual(['venomous', 'skeletal']);
    expect(ModuleWriter.person(hounds!)).toContain('Aspect venomous.');
    expect(ModuleWriter.person(bones!)).toContain('Undead skeletal.');
    const plain = new Content('x').createCreature('w', { raceId: 'wolf' }, 'w');
    const venomous = new Content('x').createCreature('w', { raceId: 'wolf', aspect: 'venomous' }, 'w');
    const skeletal = new Content('x').createCreature('w', { raceId: 'wolf', template: 'skeletal' }, 'w');
    expect(venomous.base.abilities).toContain('poison_bite');
    expect(venomous.base.constitution).toBeGreaterThan(plain.base.constitution);
    expect(skeletal.traits).toEqual(expect.arrayContaining(['undead', 'skeletal']));
    expect(skeletal.base.strength).toBeLessThan(plain.base.strength);
    expect(() => new Content('x').createCreature('w', { raceId: 'wolf', aspect: 'purple' }, 'w')).toThrow(/purple/);
  });
  it('is drawn for a den by rarity, the same for the same den, and the dead of a beast are laid by rites', () => {
    const wolf = { species: 'wolf', count: 2, label: 'the wolves', role: 'a wolf', nature: 'wild' };
    const at = { habitat: 'barrow', region: { name: 'Test', terrain: 'forest' } as Region };
    const drawn = Array.from({ length: 200 }, (_, i) => RegionEcology.variant({ id: `w${i}` } as Site, wolf, at));
    expect(RegionEcology.variant({ id: 'w7' } as Site, wolf, at)).toEqual(drawn[7]!);
    const dead = drawn.filter(d => d.template), aspected = drawn.filter(d => d.aspect);
    expect(dead.length).toBeGreaterThan(40);
    expect(dead.every(d => d.nature === 'unquiet' && /^a (skeletal|spectral|vampiric|zombie) wolf$/.test(d.role))).toBe(true);
    // Common aspects are met far more than legendary ones.
    const tier = (a: string) => Object.entries(CreatureVariants.table.rarity).find(([, list]) => list.includes(a))![0];
    const counts = aspected.map(d => tier(d.aspect!));
    expect(counts.filter(t => t === 'common').length).toBeGreaterThan(counts.filter(t => t === 'legendary').length);
  });
});

// Not a species for each way a creature differs from its kind (a frost wolf, a buck rat, a spiders' mother), but its
// kind with variations laid over it, one of each axis: age, size, its part among its kind, the country it was bred
// in, how it is disposed, what has got into it (data/catalog/variations.json; the owner, 4 November night). An author
// writes them in a Person; a generated country lays them on its dens' beasts where its hints say they fit.
describe('a creature of its kind, varied', () => {
  it('is written with its variations, made with what they add, and called by them', () => {
    const m = ModuleParser.parse(`Module t "T" {
  Place nest "The nest" is room.
  Person buck "the buck" at nest { Role "a rat". Species great_rat. Variant elder. Variant great. Level 2. }
}`);
    const buck = m.people![0]!;
    expect(buck.variations).toEqual(['elder', 'great']);
    expect(ModuleWriter.person(buck)).toContain('Variant elder. Variant great.');
    // A wolf, which grows as Orsino's do (the rat is the SRD's fixed block, which an age does not grow).
    const plain = new Content('x').createCreature('r', { raceId: 'wolf', level: 2 }, 'r');
    const old = new Content('x').createCreature('r', { raceId: 'wolf', level: 2, variations: ['elder', 'great'] }, 'r');
    expect(old.base.strength).toBe(plain.base.strength + 4);
    expect(old.base.maxHp).toBe(plain.base.maxHp + 6);
    expect(old.traits).toContain('sturdy');
    expect(CreatureVariants.called('a great rat', ['elder'])).toBe('an old great rat');
    expect(() => new Content('x').createCreature('r', { raceId: 'wolf', variations: ['young', 'elder'] }, 'r'))
      .toThrow(/two variations of its age/);
    expect(() => new Content('x').createCreature('r', { raceId: 'wolf', variations: ['purple'] }, 'r')).toThrow(/purple/);
  });
  it('is laid on by its country: frost where the winters are long, and none where nothing hints at it', () => {
    const wolf = { species: 'wolf', count: 2, label: 'the wolves', role: 'a wolf', nature: 'wild' };
    const draws = Array.from({ length: 60 }, (_, i) => new Draw(`v${i}`));
    const cold = draws.map(d => RegionEcology.varied(wolf, { habitat: 'snow', climate: 'cold' }, d));
    expect(cold.some(b => b.variations?.includes('frost') && /^a .*frost wolf$/.test(b.role))).toBe(true);
    expect(cold.every(b => !b.variations?.includes('marsh'))).toBe(true);
    const mild = Array.from({ length: 60 }, (_, i) => RegionEcology.varied(wolf, { habitat: 'meadow',
      climate: 'temperate' }, new Draw(`m${i}`)));
    expect(mild.every(b => !b.variations)).toBe(true);
  });
  it('holds only what Kyr has: each variation\'s traits and abilities are known ones, on a kind of creature', () => {
    for (const [id, v] of Object.entries(CreatureVariants.variations)) {
      expect([id, (v.traits ?? []).filter(t => !Canon.traits[t])]).toEqual([id, []]);
      expect([id, (v.abilities ?? []).filter(a => !Canon.abilities[a])]).toEqual([id, []]);
      expect([id, v.kinds.every(k => ['animal', 'monster', 'spirit'].includes(k))]).toEqual([id, true]);
    }
  });
});
