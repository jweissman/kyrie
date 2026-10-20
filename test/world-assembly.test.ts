import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class Worlds {
  static assemble(seed: string, terrain?: string) {
    return WorldAssembler.assemble(seed, NodeBundleSource.shared, terrain ? { region: { terrain } } : {});
  }
  static ids(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
}

describe('a generated region with situated scenarios', () => {
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
    const towns = new Set(brood[0]!.carriers.ewes!.map(c => c.split('_')[0]));
    expect(towns.size).toBe(2);
    const claimed = upland.report.placements.flatMap(p => Object.entries(p.bindings).filter(([r]) => r !== 'town').map(([, v]) => v));
    expect(new Set(claimed).size).toBe(claimed.length);
  });
  it('generates a site a scenario needs when the region has none free', async () => {
    const world = await WorldAssembler.assemble('crowded', NodeBundleSource.shared, { region: { terrain: 'mountain',
      sites: [{ id: 'w1', kind: 'tower', name: 'Iron Spire', hours: 1 }] } });
    const brood = world.report.placements.find(p => p.scenario === 'brood-hollow')!;
    expect(brood.generated).toEqual([brood.bindings.approach!]);
    expect(['cave', 'sinkhole']).toContain(world.report.region.sites.find(w => w.id === brood.bindings.approach)!.kind);
    expect(world.report.placements.every(p => p.bindings.den !== 'w1')).toBe(true);
    await PlaySession.start(world.path, 'crowded', world.source);
  }, 60000);
  it('keeps a scenario out of sight until the company hears of it, then opens the way', async () => {
    const world = await Worlds.assemble('thorn', 'mountain');
    const s = await PlaySession.start(world.path, 'thorn', world.source);
    const way = 'go(sink__sink_path,sink__lip)', approach = world.report.placements[0]!.bindings.approach!;
    await s.perform(`go(region__s1_inn_door,region__s1_taproom)`);
    const ask = Worlds.ids(s).find(id => id.startsWith('ask(') && id.includes('word1__ewes'))!;
    expect(ask).toBeDefined();
    await s.perform('go(region__s1_inn_door,region__s1_green)');
    await s.perform(`go(region__${approach}_track,region__${approach})`);
    expect(Worlds.ids(s)).not.toContain(way);
    for (const c of [`go(region__${approach}_track,region__s1_green)`, 'go(region__s1_inn_door,region__s1_taproom)', ask,
      'go(region__s1_inn_door,region__s1_green)', `go(region__${approach}_track,region__${approach})`]) { await s.perform(c); }
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'word1__ewes'))).toBe(true);
    expect(Worlds.ids(s)).toContain(way);
  }, 60000);
});
