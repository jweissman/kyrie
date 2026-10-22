import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

class Worlds {
  static assemble(seed: string, terrain?: string) {
    return WorldAssembler.assemble(seed, NodeBundleSource.shared, terrain ? { region: { terrain } } : {});
  }
  static ids(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
}

describe('a generated region with situated scenarios', () => {
  it('carries what Deem drew into play: a keep in marsh country stands drowned, and its well is shut', async () => {
    const flooded = async (terrain: string) => {
      const world = await Worlds.assemble('m1', terrain);
      const s = await PlaySession.start(world.path, 'm1', world.source);
      await s.perform('wait');
      return s.campaign.world.test(ModuleWriter.call('state', 'tower__well_water', 'tower__flooded'));
    };
    expect([await flooded('marsh'), await flooded('mountain')]).toEqual([true, false]);
  }, 120000);
  it('is deterministic in its seed', async () => {
    const [a, b] = await Promise.all([Worlds.assemble('stable', 'mountain'), Worlds.assemble('stable', 'mountain')]);
    expect(a.report).toEqual(b.report);
    expect(await a.source.read(a.path)).toBe(await b.source.read(b.path));
  });
  it('selects scenarios by the contexts they declare, places each once, and spreads word of each in two towns', async () => {
    const upland = await Worlds.assemble('thorn', 'mountain'), fen = await Worlds.assemble('thorn', 'marsh');
    expect(upland.report.eligibility.find(e => e.scenario === 'brood-hollow')!.fits).toBe(true);
    expect(fen.report.eligibility.find(e => e.scenario === 'brood-hollow')).toMatchObject({ fits: false });
    expect(fen.report.placements.some(p => p.scenario === 'brood-hollow')).toBe(false);
    const brood = upland.report.placements.filter(p => p.scenario === 'brood-hollow');
    expect(brood).toHaveLength(1);
    // Two towns, besides any member's old acquaintance, who hears such news wherever they live.
    const contacts = new Set(upland.report.contacts.map(c => c.carrier));
    const towns = new Set(brood[0]!.carriers['brood.ewes']!.filter(c => !contacts.has(c)).map(c => c.split('_')[0]));
    expect(towns.size).toBe(2);
    const claimed = upland.report.placements.flatMap(p => Object.entries(p.bindings).filter(([r]) => r !== 'town').map(([, v]) => v));
    expect(new Set(claimed).size).toBe(claimed.length);
  });
  it('generates a site a scenario needs when no work of its kind stands free', async () => {
    // b2: a mountain region of towers and galleries, with no cave or sinkhole for the brood.
    const world = await WorldAssembler.assemble('b2', NodeBundleSource.shared);
    const brood = world.report.placements.find(p => p.scenario === 'brood-hollow')!;
    expect(brood.generated).toEqual([brood.bindings.approach!]);
    const site = world.report.region.sites.find(w => w.id === brood.bindings.approach)!;
    expect(['cave', 'sinkhole']).toContain(site.kind);
    expect([site.work, typeof site.cell]).toEqual([undefined, 'number']);
    await PlaySession.start(world.path, 'b2', world.source);
  }, 60000);
  it('keeps a scenario out of sight until the company hears of it, then opens the way', async () => {
    const world = await Worlds.assemble('thorn', 'mountain');
    const s = await PlaySession.start(world.path, 'thorn', world.source);
    const way = 'go(sink__sink_path,sink__lip)', brood = world.report.placements[0]!;
    // At the sinkhole before anyone has said a word of it: the way down is not there to be taken.
    GeneratedWorld.put(s, brood.bindings.approach!);
    await s.perform('wait');
    expect(Worlds.ids(s)).not.toContain(way);
    await GeneratedWorld.hear(s, brood, 1);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'brood__ewes'))).toBe(true);
    GeneratedWorld.put(s, brood.bindings.approach!);
    await s.perform('wait');
    expect(Worlds.ids(s)).toContain(way);
  }, 60000);
  it('assembles and loads across seeds and terrains', async () => {
    for (const [seed, terrain] of [['a1', 'forest'], ['a2', 'marsh'], ['a3', 'mountain'], ['a4', 'frost'],
      ['b1', 'forest'], ['b2', 'marsh'], ['b3', 'mountain'], ['b4', 'frost']] as const) {
      const world = await Worlds.assemble(seed, terrain);
      const s = await PlaySession.start(world.path, seed, world.source);
      expect([seed, PlayerView.observe(s.campaign).location?.id]).toEqual([seed, 'region__s1_green']);
    }
  }, 180000);
});

describe('backgrounds in a generated region', () => {
  it('give each member an acquaintance who hears news of their channel anywhere in the region', async () => {
    const party = [{ name: 'Ada', raceId: 'human', classId: 'cleric', backgroundId: 'medic' },
      { name: 'Tam', raceId: 'human', classId: 'warrior', backgroundId: 'miner' }];
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' }, party });
    const [ada, tam] = world.report.contacts;
    expect([ada!.channel, tam!.channel]).toEqual(['temple', 'tavern']);
    expect(ada!.carrier).toMatch(/_priest$/);
    const temple = world.report.placements.flatMap(p => Object.values(p.carriers).flat());
    expect(temple).toContain(ada!.carrier);
    await PlaySession.start(world.path, 'thorn', world.source, party);
    const region = await world.source.read(world.path.replace('.campaign.json', '/region/region.kyr'));
    expect(region).toContain(`{${ada!.carrier}} and Ada nursed the sick together`);
  }, 60000);
  it('let a hunter drive the beasts from a den: the den is resolved and searched, with no foes killed', async () => {
    const world = await Worlds.assemble('thorn', 'mountain'), s = await PlaySession.start(world.path, 'thorn', world.source);
    const placement = world.report.placements.find(p => p.scenario === 'den')!, den = placement.bindings.den!;
    await GeneratedWorld.hear(s, placement, world.report.placements.indexOf(placement) + 1);
    // The den's track starts where the den is reached from: the wild country it is in, or a road or settlement.
    const start = s.campaign.world.related('connects').find(r => r.args[0] === `region__${den}_track`
      && r.args[2] === `region__${den}`)!.args[1]!;
    GeneratedWorld.put(s, start.replace('region__', ''));
    for (const c of [`go(region__${den}_track,region__${den})`, `den__smoke_out(party,region__${den})`]) { await s.perform(c); }
    expect(s.campaign.world.test(ModuleWriter.call('dead', 'den__beasts'))).toBe(false);
    expect(Worlds.ids(s)).toContain(`den__plunder(party,region__${den})`);
    expect(s.campaign.state.creatures.find(c => c.id === 'region__party_1')!.state.experience).toBe(200);
  }, 60000);
  it('change where the company first hears of a scenario, and not whether it exists', async () => {
    const a = await Worlds.assemble('thorn', 'mountain');
    const b = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' },
      party: [{ name: 'Elen', raceId: 'elf', classId: 'ranger' }] });
    const placed = (w: typeof a) => w.report.placements.map(p => [p.scenario, p.bindings]);
    expect(placed(b)).toEqual(placed(a));
    expect(b.report.contacts).toEqual([]);
  });
});
