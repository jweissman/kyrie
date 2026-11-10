import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// A makers' work holds more than its plan's one keeper and two treasures: a den of its country's beasts in one of its
// rooms, and in another something put by later, found only by searching there (the owner, 31 October: interiors
// thin, secrets too few; OWN-56).
describe('a makers\' work, stocked', () => {
  it('has a den, and a cache that a search of its room turns up and that can then be taken', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source), c = s.campaign;
    expect(c.world.one('at', 'region__w1_denned')).toMatch(/^region__w1_/);
    const room = c.world.one('at', 'region__w1_cache')!;
    const k = c as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      { kind: 'retract', call: ModuleWriter.call('at', 'region__w1_denned', c.world.one('at', 'region__w1_denned')!) }]));
    const takes = () => PlayerView.choices(c).filter(x => x.choice.id.startsWith('take_item(region__w1_cache,'));
    expect(takes()).toEqual([]);
    // The barrow is dark: a light first, as anyone going down would.
    const light = PlayerView.choices(c).find(x => /^Light /.test(x.choice.name));
    if (light) { await s.leg(light.choice.id); }
    const search = PlayerView.choices(c).find(x => x.choice.id.startsWith('search('))!;
    const said = (await s.leg(search.choice.id)).response ?? '';
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w1_cache_found'))).toBe(true);
    expect(said + JSON.stringify(PlayerView.observe(c))).toMatch(/loose/);
    expect(takes().length).toBeGreaterThan(0);
  }, 120000);
  // Finding a place is its own reward, once (the owner, 1 November: exploration rewarded).
  it('is worth experience the first time the company comes to it, and not again', async () => {
    const { GeneratedWorld } = await import('./support/generated');
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const xp = () => s.campaign.readout.creatures.find(x => s.campaign.state.partyIds.includes(x.id))!.state.experience;
    const site = w.report.region.sites.find(x => x.work)!;
    const before = xp();
    await GeneratedWorld.travel(s, site.id);
    const after = xp();
    expect(after - before).toBeGreaterThanOrEqual(20);
    await s.leg('wait');
    await GeneratedWorld.travel(s, w.report.region.settlements[0]!.id + '_green');
    await GeneratedWorld.travel(s, site.id);
    expect(xp()).toBe(after);
  }, 180000);
});
