import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Journey } from '../src/session/journey';
import { Career } from '../src/world/career';
import { ModuleParser } from '../src/lang/module-parser';
import { Frontier } from '../src/world/frontier';
import { WorldAssembler } from '../src/world/world-assembler';
import { GeneratedWorld } from './support/generated';

// The hunter's career in a generated world (CR-01, phase 2: career-phase1.md). The Rì's commission is found by
// searching beneath the first town's notice, after the town's own jobs; the world has one named dragon, laired in the
// nearest mountain country beyond the first; and the royal game-warden keeps his office in the canon's Dun Rìerdan,
// reached by the road north as any country is, and pays the price once.
class World {
  static async a1() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return Journey.of(await PlaySession.start(w.path, 'a1', w.source));
  }
  static labels(j: Journey): string[] { return PlayerView.choices(j.campaign).map(r => r.choice.name); }
}
describe('the hunter\'s career in a world', () => {
  it('is searched for beneath a1\'s first town notice, after the town\'s own jobs, and is an aim from then on', async () => {
    const j = await World.a1();
    await j.play('To the landing');
    expect(World.labels(j).some(l => /royal proclamation/.test(l))).toBe(false);
    await j.play('Read the notice on the well-post');
    // Not what reading the town's notice opens: there when the company is next on the green.
    expect(World.labels(j).some(l => /royal proclamation/.test(l))).toBe(false);
    await j.play('Into the Lucky Phoenix', 'Out to the landing');
    expect(PlayerView.observe(j.campaign).objectives?.some(o => o.id === 'career__dragon')).toBe(false);
    for (let tries = 0; tries < 20
      && !PlayerView.observe(j.campaign).objectives?.some(o => o.id === 'career__dragon'); tries++) {
      await j.play('Search under the notices for the Rì\'s commission');
    }
    const aims = (PlayerView.observe(j.campaign).objectives ?? []).map(o => o.text);
    // An aim, where the town's jobs on the notice are leads until their giver is asked (HP-01).
    expect(aims).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Slay Old Brennoch, the dragon of the high country north-west of here/)]));
    expect(aims.filter(a => /^Ask Mik/.test(a))).toEqual([]);
    // Toward the first step the company knows of (MT-12: about the commission alone, it had led nowhere): the march
    // on the dragon's side; once it is slain, the march toward Dun Rìerdan, north.
    const toward = (id: string) => j.campaign.module.objectives?.find(o => o.id === id)?.toward;
    expect(toward('career__dragon')).toEqual([expect.stringMatching(/^region__edge_(north|west)$/)]);
    expect(toward('career__dragon_told')).toEqual(['region__edge_north']);
  }, 120000);
  it('places one dragon in each world, in the nearest mountain country beyond the first', () => {
    for (const seed of ['a1', 'kite', 'thorn']) {
      const first = WorldAssembler.region(seed, [0, 0]).terrain, dragon = Career.dragon(seed, first)!;
      expect([seed, WorldAssembler.region(seed, dragon.at).terrain]).toEqual([seed, 'mountain']);
      const lairs: number[][] = [], files: Record<string, string> = {};
      for (const [x, y] of [[-1, 0], [0, 1], [-1, 1], [-1, -1], [0, -1], [-2, -2], [-2, 0], [0, 2]] as const) {
        const region = WorldAssembler.region(seed, [x, y]);
        lairs.push(...Career.beyond(seed, region, { x, y, first, rid: `x${x}y${y}`, root: 'r', files })
          .filter(r => r.id === 'careerlair').map((): number[] => [x, y]));
      }
      expect([seed, lairs]).toEqual([seed, [[...dragon.at]]]);
      // Its lair is Kyr as written: the dragon a person at its den, its raids and its death the commission's.
      const lair = ModuleParser.parse(files['r/career_lair/career.kyr']!);
      expect(lair.people?.map(p => p.name)).toEqual([dragon.name]);
    }
  }, 120000);
  it('keeps the warden in Dun Rìerdan, reached by the road north, and pays the price once', async () => {
    const j = await World.a1(), s = j.session, frontier = new Frontier('a1', NodeBundleSource.shared);
    await j.play('To the landing', 'Read the notice on the well-post', 'Into the Lucky Phoenix', 'Out to the landing');
    for (let tries = 0; tries < 20
      && !PlayerView.observe(j.campaign).objectives?.some(o => o.id === 'career__dragon'); tries++) {
      await j.play('Search under the notices for the Rì\'s commission');
    }
    GeneratedWorld.put(s, 'edge_north');
    await frontier.expand(s.campaign);
    expect(s.campaign.installed).toEqual(expect.arrayContaining(['x0ym1', 'careerwarden']));
    const way = Journey.way(s.campaign.world, 'x0ym1__s1_green', 'careerwarden__office');
    expect(way.length).toBeGreaterThan(0);
    j.put('party', 'careerwarden__office');
    expect(World.labels(j)).toContain('Ask Master Cadell about the Rì\'s commission');
    expect(World.labels(j).some(l => /^Tell Master Cadell the dragon is dead/.test(l))).toBe(false);
    // The deed, as the lair's fight teaches it (the felled record: test/small/career-proof).
    j.assert('knows', 'party', 'career__slain');
    const purse = j.measure('quantity', 'party', 'gold');
    await j.play('Tell Master Cadell the dragon is dead');
    expect(j.measure('quantity', 'party', 'gold')).toBe(purse + 500);
    expect(World.labels(j).some(l => /^Tell Master Cadell the dragon is dead/.test(l))).toBe(false);
    // A knight of the Rì's, in the Notes, from the world's own fact.
    expect(PlayerView.observe(j.campaign).knowledge.map(k => k.text))
      .toContain('You are a knight of the Rì\'s, dubbed at the Llys of Dun Rìerdan for slaying Old Brennoch.');
    expect(World.labels(j)).toContain('Ask Master Cadell what else the register holds');
  }, 240000);
});
