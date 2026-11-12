import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// An authored -> generated -> persistent -> authored handoff (doc/imbar/authorability.md). The Long Man's steward sells
// bronze to a barge; the world's own factor of the Founders' Exchange (cast by Deem, placed by the assembler) takes
// the lot into her keeping; her carter sends it south on a run of his own while the company is elsewhere; and Low
// Water's Halm, who collects working things, has it in his tray when the company crosses the Rim. No module names
// another: what passes is custody of a thing of a catalog kind, in the one world.
class World {
  static said(e: { response?: string; perceptions?: { text: string }[] }) {
    return [e.response ?? '', ...(e.perceptions ?? []).map(p => p.text)].join(' ');
  }
  static async start(seed = 'thorn') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, seed, w.source);
    return { w, s, frontier: new Frontier(seed, NodeBundleSource.shared) };
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).slice(0, 20).join(' | ')}`); }
    return s.leg(c.choice.id);
  }
  static async until(s: PlaySession, watch: number) {
    for (let i = 0; i < 600 && s.campaign.state.elapsed < watch; i++) { await s.leg('wait'); }
  }
}

describe('the factor who buys old bronze', () => {
  it('is placed once, by a herald that goes ahead of two countries, and bound to both', async () => {
    const { s, frontier } = await World.start();
    expect(s.campaign.module.entities.filter(e => e.id === 'factors__factor').length).toBe(1);
    const carter = s.campaign.module.entities.find(e => e.id === 'factors__carter');
    expect(carter).toBeDefined();
    await GeneratedWorld.travel(s, 'gate_longman');
    await frontier.expand(s.campaign);
    // The dale's own stub is dropped for the world's factor; it names her, and nothing else.
    expect(s.campaign.module.entities.some(e => e.id === 'plongman__factor')).toBe(false);
    await GeneratedWorld.travel(s, 'gate_lowwater');
    await frontier.expand(s.campaign);
    expect(s.campaign.module.entities.some(e => e.id === 'plowwater__carter')).toBe(false);
  }, 240000);

  it('takes the Long Man\'s bronze off the barge, ships it south while the company is away, and puts it in Halm\'s tray', async () => {
    const { w, s, frontier } = await World.start();
    const j = Journey.of(s);
    await GeneratedWorld.travel(s, 'gate_longman');
    await frontier.expand(s.campaign);
    await World.choose(s, /^Take the road on into Merrowdale/);
    // The company does nothing for the dale, and the steward's bronze goes downriver in the Heron.
    const t0 = s.campaign.state.elapsed;
    await j.play(`=${t0 + 330}`);
    expect(World.holds(s, 'keeps', 'factors__factor', 'plongman__teeth')).toBe(true);
    expect(World.holds(s, 'factors__carterGone', 'factors__carter')).toBe(false);
    // The carter's run is Deem's to set (two to five days after the lot comes) and the company is not there for it.
    await j.play(`=${t0 + 330 + 6 * 144}`);
    expect(World.holds(s, 'factors__carterGone', 'factors__carter')).toBe(true);
    expect(World.holds(s, 'at', 'factors__carter', 'factors__south_road')).toBe(true);
    expect(World.holds(s, 'keeps', 'factors__carter', 'plongman__teeth')).toBe(true);
    // Only now does the company go south. Low Water is installed, and its Halm already has what the carter brought.
    await GeneratedWorld.travel(s, 'gate_lowwater');
    await frontier.expand(s.campaign);
    await s.leg('wait');
    expect(World.holds(s, 'keeps', 'plowwater__halm', 'plongman__teeth')).toBe(true);
    expect(World.holds(s, 'keeps', 'factors__carter', 'plongman__teeth')).toBe(false);
    expect(w.report.placements.filter(p => p.scenario === 'factors').length).toBe(1);
    // At the dig the company finds the lot on a cloth, and Halm says where it came from.
    await GeneratedWorld.travel(s, 'plowwater__dig');
    await s.leg('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('twelve teeth of green bronze');
    expect(World.said(await World.choose(s, /^Ask Halm where the bell-teeth/))).toContain('Founders\' Exchange in the north');
  }, 600000);

  it('sends nothing south if the company buys the lot back at the factor\'s table before the carter goes, and Halm\'s tray stays empty', async () => {
    const { w, s, frontier } = await World.start();
    const j = Journey.of(s);
    await GeneratedWorld.travel(s, 'gate_longman');
    await frontier.expand(s.campaign);
    await World.choose(s, /^Take the road on into Merrowdale/);
    const t0 = s.campaign.state.elapsed;
    await j.play(`=${t0 + 330}`);
    expect(World.holds(s, 'keeps', 'factors__factor', 'plongman__teeth')).toBe(true);
    const town = (w.report.placements.find(p => p.scenario === 'factors')!.bindings as { town: string }).town;
    await GeneratedWorld.travel(s, `${town}_taproom`);
    await World.choose(s, /back from .* at fourteen to the pound/);
    expect(World.holds(s, 'keeps', 'party', 'plongman__teeth')).toBe(true);
    // The eight days sat out at the march-stone, out of the way of the town's own troubles (the Bound Howe's
    // Spade-Company, standing in the country since the adventure branch, had come at a company waiting in the taproom).
    await GeneratedWorld.travel(s, 'gate_longman');
    await j.play(`=${t0 + 330 + 8 * 144}`);
    expect(s.campaign.running).toBe(true);
    expect(World.holds(s, 'factors__carterGone', 'factors__carter')).toBe(false);
    await GeneratedWorld.travel(s, 'gate_lowwater');
    await frontier.expand(s.campaign);
    await s.leg('wait');
    expect(World.holds(s, 'keeps', 'plowwater__halm', 'plongman__teeth')).toBe(false);
  }, 600000);
});
