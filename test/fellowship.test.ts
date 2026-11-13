import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Content } from '../src/content';
import { RandomStreams } from '../src/random-streams';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The fellowship (data/scenarios/fellowship.scenario.json, data/situations/fellowship): an institution whose head sits
// in one town and whose halls are in three others, drawn for each country by Deem alone. See
// doc/history/activation/deem-variation.md.
const dir = 'data/situations/fellowship/';
const setting = Content.settingWith(JSON.parse(readFileSync(`${dir}tables.json`, 'utf8')),
  JSON.parse(readFileSync(`${dir}templates.json`, 'utf8')));
const library = 'test/fixtures/fellowship/library.json';
type Fact = { name: string; args: string[] };
const drawn = (seed: string, terrain: string) => new Content(`${RandomStreams.key(seed, 'module', 'fellowship', '')}:situation`,
  setting).generate('fellowship', { terrain, domain: 'nature', folk: 'human' }) as unknown as { facts: Fact[]; labels: Record<string, string> };

describe('the fellowship, drawn', () => {
  it('differs from country to country in what plays differently, not only in names', () => {
    const kinds = new Set<string>(), causes = new Set<string>(), posts = new Set<string>(), names = new Set<string>();
    for (let i = 0; i < 80; i++) {
      const g = drawn(`s${i}`, ['forest', 'marsh', 'mountain', 'frost', 'desert'][i % 5]!);
      kinds.add(g.facts.find(f => f.name === 'styled')!.args[1]!);
      causes.add(g.facts.find(f => f.name === 'lapse')!.args[1]!);
      posts.add(g.facts.filter(f => f.name === 'at' && /^(treasurer|recorder|warden)$/.test(f.args[0]!)).map(f => f.args[1]).join());
      names.add(g.labels.order!);
    }
    expect([...kinds].sort()).toEqual(['chapter', 'garrison', 'guild']);
    expect([...causes].sort()).toEqual(['c_fallen', 'c_lapsed', 'c_proud', 'c_sold']);
    expect(posts.size).toBe(6);
    expect(names.size).toBeGreaterThan(10);
  });
  it('puts its halls in four different towns, in every country', async () => {
    for (const seed of ['a1', 'thorn', 'b2', 'c3', 'd4', 'm13']) {
      const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { library, scenarios: 0, towns: 1 });
      const placed = world.report.placements.find(p => p.scenario === 'fellowship')!;
      expect(new Set(Object.values(placed.bindings)).size).toBe(4);
    }
  }, 120000);
});

describe('the fellowship, played (m13: a guild whose hall sold its tally)', () => {
  it('is mended by buying the tally back from the shop in another town', async () => {
    const party = [{ name: 'Mira', raceId: 'human', classId: 'warrior' }];
    const world = await WorldAssembler.assemble('m13', NodeBundleSource.shared, { library, scenarios: 0, towns: 1, party });
    const j = Journey.of(await PlaySession.start(world.path, 'm13', world.source, party));
    const placed = world.report.placements.find(p => p.scenario === 'fellowship')!;
    const buyer = 'c';
    const say = async (s: string) => j.play(s);
    Placed.at(j, 'fellowship__hall_a');
    await say('Ask \\w+ what is wrong with the roll');
    await say('Ask \\w+ which hall has gone quiet');
    await say('Take \\w+.s summons');
    Placed.at(j, 'fellowship__hall_b');
    await say('Ask \\w+ who has the hall\'s tally');
    await say('Ask \\w+ to stand the price of a tally');
    Placed.at(j, `region__${placed.bindings[buyer]}_green`);
    expect(await say('whether a split hazel tally')).toMatch(/hazel rod/);
    await say('Pay');
    Placed.at(j, 'fellowship__hall_a');
    expect(await say('Give \\w+ the hall.s half of the tally')).toMatch(/it is a hall again/);
    expect(Placed.holds(j, 'fellowship__mended', 'fellowship__order')).toBe(true);
  }, 180000);
});
