import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Content } from '../src/content';
import { CreatureVariants } from '../src/creature-variants';
import { RegionEcology } from '../src/world/region-ecology';
import type { Site } from '../src/world/region-writer';

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
    const drawn = Array.from({ length: 200 }, (_, i) => RegionEcology.variant({ id: `w${i}` } as Site, wolf, 'barrow'));
    expect(RegionEcology.variant({ id: 'w7' } as Site, wolf, 'barrow')).toEqual(drawn[7]!);
    const dead = drawn.filter(d => d.template), aspected = drawn.filter(d => d.aspect);
    expect(dead.length).toBeGreaterThan(40);
    expect(dead.every(d => d.nature === 'unquiet' && /^a (skeletal|zombie) wolf$/.test(d.role))).toBe(true);
    // Common aspects are met far more than legendary ones.
    const tier = (a: string) => Object.entries(CreatureVariants.table.rarity).find(([, list]) => list.includes(a))![0];
    const counts = aspected.map(d => tier(d.aspect!));
    expect(counts.filter(t => t === 'common').length).toBeGreaterThan(counts.filter(t => t === 'legendary').length);
  });
});
