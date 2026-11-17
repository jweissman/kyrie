import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ProtagonistNames } from '../src/world/protagonist-names';
import { FamilyNames } from '../src/world/family-names';
import type { CampaignManifest } from '../src/campaign/module-bundle';
import folk from '../data/generation/scenes/folk.json';
import naming from '../data/generation/scenes/naming.json';

// The family one comes home to is one family (PA-03, the owner, 17 November): a dwarf Morgran, in wren's dwarf
// country, came home to a brother Morgran Torunn and a mother Brannoc Holderhek, each named by a generator of their own
// (every dwarf man's name of ten had been some townsman's, so the brother was the protagonist's own name with a family
// name to tell it apart), and Morgran himself had none. Their names come from one model: none a given name another of
// them has, each called by what their people's family is known by (a family name, or a father's), the protagonist too.
class Home {
  static async come(seed: string, people: string, as: 'she' | 'he', name?: string) {
    const w0 = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
    // Unnamed, the name creation offers first, as the owner's Morgran was.
    const given = name ?? ProtagonistNames.drawn(w0.report.region, seed)[people]![as][0]!;
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: given, raceId: people as 'dwarf', classId: 'warrior', pronouns: as }] });
    const own = (JSON.parse(await w.source.read(w.path)) as CampaignManifest).party![0]!.name!;
    const s = await PlaySession.start(w.path, seed, w.source);
    const called = (id: string) => s.campaign.module.entities.find(e => e.id === id)!.name.split(', ')[0]!;
    return { given, own, mother: called('drover__wife'), brother: called('drover__son') };
  }
  // What one is called by beyond their given name: the family's name, or "son of Clay".
  static line(name: string): string { return name.split(' ').slice(1).join(' ').replace(/^(son|daughter|child) /, ''); }
}

describe('the family one comes home to', () => {
  for (const [seed, people, as] of [['wren', 'dwarf', 'he'], ['thorn', 'elf', 'she'], ['thorn', 'catfolk', 'he'],
    ['a1', 'human', 'he']] as const) {
    it(`is one family, the protagonist of it (${seed}, ${people})`, async () => {
      const { given, own, mother, brother } = await Home.come(seed, people, as);
      const first = (n: string) => n.split(' ')[0]!;
      expect(new Set([given, first(mother), first(brother)]).size).toBe(3);
      expect(first(own)).toBe(given);
      expect(Home.line(own)).not.toBe('');
      expect(Home.line(brother)).toBe(Home.line(own));
      // A mother of a people known by family name has the family's; of one known by a father, her own father's.
      const byFather = (naming.traditions as Record<string, { line: string }>)[people]!.line === 'father';
      if (!byFather) { expect(Home.line(mother)).toBe(Home.line(own)); }
    }, 120000);
  }
  it('takes the family name the player wrote for the protagonist', async () => {
    const { own, mother, brother } = await Home.come('wren', 'dwarf', 'he', 'Morgran Stonehelm');
    expect([own, Home.line(mother), Home.line(brother)]).toEqual(['Morgran Stonehelm', 'Stonehelm', 'Stonehelm']);
  }, 120000);
});

// The model alone, for every people and many families, in a country where every name of theirs is someone's.
describe('a family named together', () => {
  it('gives no two of its members one given name, and one line to the children', () => {
    const peoples = Object.keys(naming.traditions);
    for (const people of peoples) {
      const all = Object.values((folk.given as Record<string, Record<string, string[]>>)[people]!).flat();
      for (let i = 0; i < 40; i++) {
        const pool = FamilyNames.names(people, i % 2 ? 'he' : 'she'), own = pool[i % pool.length]!;
        const names = FamilyNames.household({ key: `town${i}:drover`, people, roster: 'she:wife:elder he:son they:child',
          taken: all, own, as: i % 2 ? 'he' : 'she' });
        const given = Object.values(names).map(n => n.split(' ')[0]);
        expect(new Set(given).size).toBe(4);
        expect(Home.line(names.son!)).toBe(Home.line(names.you!));
        expect(Home.line(names.child!)).toBe(Home.line(names.you!));
      }
    }
  });
});
