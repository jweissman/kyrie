import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Canon } from '../src/canon/canon';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// Treasure as Orsino has it and old games paid for it: a makers' work holds things of worth (Orsino's junk and gems),
// any merchant who deals in valuables buys them at that worth, and the first time a treasure is sold half its worth
// is experience for each of the company. a1: a marsh region with a barrow of the Barrow-Kin, its south chamber holding
// grave-goods.
class Hoard {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    return { w, s: await PlaySession.start(w.path, 'a1', w.source) };
  }
  // The grave-goods of a1's barrow, in Elen's hands.
  static async goods(s: PlaySession, barrow: string) {
    GeneratedWorld.put(s, `${barrow}_right`);
    await s.perform('wait');
    await Hoard.choose(s, /^Light a torch$/);
    await Hoard.choose(s, /^Collect .* for Elen$/);
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
}

describe('treasure', () => {
  // Found, a quarter of its worth is experience for each, the first time it is taken up; sold, it is coin and no more,
  // half its worth (the cold review of 1 November: a sale had paid its worth in coin and half again in experience).
  it('is experience when it is found, and coin at half its worth when a merchant buys it', async () => {
    const { w, s } = await Hoard.start(), region = w.report.region;
    const barrow = region.sites.find(x => x.work?.plan === 'barrow')!;
    GeneratedWorld.put(s, `${barrow.id}_right`);
    await s.perform('wait');
    const goods = s.campaign.world.one('itemKind', `region__${barrow.id}_goods`)!.replace(/^.*__/, '');
    expect(Canon.items[goods]!.category).toBe('treasure');
    const worth = Canon.items[goods]!.value!, xp = () => s.campaign.state.party.map(m => m.experience);
    // The chamber is dark: the warrior's torch first.
    await Hoard.choose(s, /^Light a torch$/);
    const before = xp();
    await Hoard.choose(s, /^Collect .* for Elen$/);
    expect(xp()).toEqual(before.map(x => x + Math.floor(worth / 4)));
    GeneratedWorld.put(s, `${region.settlements[0]!.id}_shop`);
    await s.perform('wait');
    const [gold, experience] = [s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')), xp()];
    await Hoard.choose(s, /^Sell .* to /);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + Math.floor(worth / 2));
    expect(xp()).toEqual(experience);
    expect(s.campaign.world.test(ModuleWriter.call('realized', `region__${barrow.id}_goods`))).toBe(true);
  }, 60000);
  it('is worth coming back for in the morning, when a dealer has not the coin today', async () => {
    const { w, s } = await Hoard.start(), region = w.report.region, town = region.settlements[0]!.id;
    await Hoard.goods(s, region.sites.find(x => x.work?.plan === 'barrow')!.id);
    const c = s.campaign as unknown as { creatures: CreatureStore;
      tickState: { definition: { actors: { id: string; members: string[] }[] } } };
    const lease = c.creatures.acquire(c.tickState.definition.actors.find(a => a.id === `region__${town}_merchant`)!.members);
    try { lease.creatures[0]!.state.gold = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    GeneratedWorld.put(s, `${town}_shop`);
    await s.perform('wait');
    const shown = await Hoard.choose(s, /^Show .* to /);
    expect(shown.response).toContain('come back in the morning');
    for (let h = 0; h < 30 && !PlayerView.choices(s.campaign).some(x => /^Sell .* to /.test(x.choice.name)); h++) {
      await s.perform('wait_hour');
    }
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await Hoard.choose(s, /^Sell .* to /);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeGreaterThan(gold);
  }, 60000);
});
