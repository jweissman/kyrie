import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Effects } from '../src/effects';
import { Challenge } from '../src/world/challenge';
import { Parties } from '../src/world/parties';
import { Draw } from '../src/world/land/draw';
import { RegionGrowth } from '../src/world/region-growth';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { CreatureVariants } from '../src/creature-variants';
import { BestiaryTool } from '../src/cli/bestiary-tool';
import type { Region } from '../src/world/region-writer';

// The bestiary as a coherent ontology that generated play uses (the owner, 6 November): base kinds and what varies
// them as structure; each kind's danger measured; encounters composed from the canon by habitat, abundance and a budget
// of danger, as Orsino composed its parties; and a kind or a plant added by its record alone met in a generated world.
const made = (kind: string, level = 1) => new Content('bestiary').createCreature(kind, { raceId: kind, level } as never);
const worlds = async (seeds: string[]) => Promise.all(seeds.map(async seed => {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
  return { w, session: await PlaySession.start(w.path, seed, w.source) };
}));

describe('the bestiary', () => {
  it('makes a qualified kind from its base and what varies it, keeping the ids content uses', () => {
    const base = (id: string) => [Canon.creature(id).variantOf, Canon.creature(id).variations ?? []];
    expect(base('dog')).toEqual(['hound', []]);
    expect(base('cave_hound')).toEqual(['hound', ['cave']]);
    expect(base('bone_hound')).toEqual(['hound', ['skeletal']]);
    expect(base('great_rat')).toEqual(['rat', ['great']]);
    expect(base('great_centipede')).toEqual(['centipede', ['great']]);
    expect(base('great_snake')).toEqual(['snake', ['great']]);
    expect(base('great_pike')).toEqual(['pike', ['great', 'elder']]);
    expect(base('frost_wolf')).toEqual(['wolf', ['frost', 'great']]);
    expect(base('bronze_construct')).toEqual(['golem', ['bronze']]);
    expect(base('iron_golem')).toEqual(['golem', ['iron']]);
    expect(base('red_dragon')).toEqual(['dragon', ['red_lineage']]);
    expect(base('fire_elemental')).toEqual(['elemental', ['fire_element']]);
    // Orsino's small animal wyrm is a dragon of the animal template, not the great Wyrm; its old id still means it.
    expect([Canon.creature('wyrmling').type, Canon.resolve('species', 'wyrm_animal')]).toEqual(['dragon', 'wyrmling']);
    // No body's ability is a spell: the dragon-class types fly by their trait.
    for (const id of ['drake', 'wyrm', 'wyvern']) { expect(Canon.creature(id).abilities).not.toContain('flight'); }
  });
  it('makes the dead of any kind by Orsino\'s templates, which are variations, with what the dead are hurt by', () => {
    expect(CreatureVariants.templates).toEqual(['skeletal', 'spectral', 'vampiric', 'zombie']);
    const hound = made('bone_hound');
    expect([hound.variations, hound.traits]).toEqual([['skeletal'], expect.arrayContaining(['undead', 'skeletal'])]);
    const resist = (kind: string) => Effects.modifiers(CombatProjection.fighter(made(kind), 'goblins')).resistances ?? {};
    expect([resist('bone_hound').radiant, resist('hound').radiant ?? 0]).toEqual([-1, 0]);
    // The frost's proof against cold is the frost's (its trait, frost_adapted): any frost creature has it.
    expect([resist('frost_wolf').cold, resist('wolf').cold ?? 0]).toEqual([0.5, 0]);
  });
  it('has measured how dangerous every kind that fights is', () => {
    expect(BestiaryTool.measurable().filter(id => !Challenge.measured(id))).toEqual([]);
    // As fought by the game's own fights against a lone warrior: a rat is a share of one, a wolf about one, and the
    // great kinds more than their bases.
    expect(Challenge.of('rat')).toBeLessThan(Challenge.of('great_rat') + 0.01);
    expect(Challenge.of('drake')).toBeGreaterThan(Challenge.of('wolf') * 4);
  });
  it('composes a party within its budget from what lives in the habitats, rarely one beyond it, alone', () => {
    let beyond = 0, mixed = 0;
    const kinds = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const party = Parties.compose({ habitats: ['cave'], challenge: 2, draw: new Draw(`party:${i}`) })!;
      party.members.forEach(m => kinds.add(m.species));
      if (party.overwhelming) { beyond++; expect(party.members).toHaveLength(1); continue; }
      if (party.members.length > 1) { mixed++; }
      const spent = party.members.reduce((n, m) => n + m.count * Challenge.of(m.species, m.level), 0);
      expect(spent).toBeLessThanOrEqual(4 + 1e-9);
    }
    expect(beyond).toBeGreaterThan(10);
    expect(beyond).toBeLessThan(70);
    expect(mixed).toBeGreaterThan(80);
    // Nothing tame, nothing bare that requires what varies it, none that lives elsewhere.
    for (const k of kinds) {
      expect([k, Canon.creature(k).habitats]).toEqual([k, expect.arrayContaining(['cave'])]);
      expect([k, Canon.temperament(k) === 'tame' || CreatureVariants.wanting(k)]).toEqual([k, false]);
    }
    expect(kinds.size).toBeGreaterThan(8);
    // The composer names no kind: what takes part is what the records say.
    expect(readFileSync('src/world/parties.ts', 'utf8')).not.toMatch(/'(rat|wolf|ghoul|goblin|spider)'/);
  });
  it('meets a varied selection of the canon in a generated country\'s deep sites, the parties fought together', async () => {
    const met = new Map<string, number>(), written = new Set<string>();
    for (const p of ['barrow', 'deep', 'singing', 'waterworks']) {
      const purpose = JSON.parse(readFileSync(`data/generation/deep/${p}.json`, 'utf8')) as
        { dwellers: { groups: { species?: string }[] }[]; elites?: { groups: { species?: string }[] }[] };
      for (const g of [...purpose.dwellers, ...purpose.elites ?? []].flatMap(d => d.groups)) {
        if (g.species) { written.add(g.species); }
      }
    }
    for (const { session } of await worlds(['a1', 'b2', 'kite', 'ash'])) {
      const read = session.campaign.readout;
      for (const [group, ids] of Object.entries(read.inhabitants)) {
        if (!/_(dwellers|beside)$/.test(group)) { continue; }
        const kind = read.creatures.find(c => c.id === ids[0])?.raceId;
        if (kind && Canon.isSpecies(kind)) { met.set(kind, (met.get(kind) ?? 0) + 1); }
      }
      expect(session.campaign.world.related('beside').length).toBeGreaterThan(0);
    }
    const beyondWritten = [...met.keys()].filter(k => !written.has(k));
    expect(met.size).toBeGreaterThan(15);
    expect(beyondWritten.length).toBeGreaterThan(8);
  }, 600000);
  it('takes a kind written into monsters.json alone into a generated deep site (the hollow-stalker)', async () => {
    // Its record says it lives in caves, how common it is, and how it fights; nothing else names it.
    expect(Parties.eligible(['cave']).map(([id]) => id)).toContain('hollow_stalker');
    const parties = Array.from({ length: 300 }, (_, i) =>
      Parties.compose({ habitats: ['cave'], challenge: 2, draw: new Draw(`stalker:${i}`) })!);
    expect(parties.some(p => p.members.some(m => m.species === 'hollow_stalker'))).toBe(true);
    const seen = (await worlds(['a1', 'b2', 'kite', 'ash', 'wren', 'mere'])).flatMap(({ session }) =>
      session.campaign.readout.creatures.filter(c => c.raceId === 'hollow_stalker'));
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0]!.base.abilities).toEqual(expect.arrayContaining(Canon.creature('hollow_stalker').abilities!));
  }, 600000);
  it('grows a plant written into plants.json in a generated country, gathered as the item it gives (self-heal)', async () => {
    const lines = (await Promise.all(['a1', 'b2', 'kite'].map(async seed =>
      (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.region as Region)))
      .flatMap(r => RegionGrowth.lines(r)).filter(l => l.includes('selfheal'));
    expect(lines.some(l => /Thing \w+_selfheal_plant "the self-heal" at \w+ is scenery/.test(l))).toBe(true);
    expect(lines.some(l => /Item \w+_selfheal_plant_1 "a handful of self-heal" is selfheal in/.test(l))).toBe(true);
    // What it gives heals as its item says (items.json: Heal (1d4) health to ally).
    expect(Content.abilities.some(a => a.id === 'selfheal' || a.id === 'item:selfheal') || !!Canon.items.selfheal).toBe(true);
  }, 300000);
});
