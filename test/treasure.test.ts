import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Canon } from '../src/canon/canon';
import { GeneratedWorld } from './support/generated';

// Treasure as Orsino has it and old games paid for it: a makers' work holds things of worth (Orsino's junk and gems),
// any merchant who deals in valuables buys them at that worth, and the first time a treasure is sold its worth is
// experience for each of the company. a1: a marsh region with a barrow of the Barrow-Kin, its south chamber holding
// grave-goods.
class Hoard {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    return { w, s: await PlaySession.start(w.path, 'a1', w.source) };
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
}

describe('treasure', () => {
  it('is bought by a merchant at its worth, and is experience for the company the first time it is sold', async () => {
    const { w, s } = await Hoard.start(), region = w.report.region;
    const barrow = region.sites.find(x => x.work?.plan === 'barrow')!;
    GeneratedWorld.put(s, `${barrow.id}_right`);
    await s.perform('wait');
    const goods = s.campaign.world.one('itemKind', `region__${barrow.id}_goods`)!.replace(/^.*__/, '');
    expect(Canon.items[goods]!.category).toBe('treasure');
    const worth = Canon.items[goods]!.value!;
    // The chamber is dark: the warrior's torch first.
    await Hoard.choose(s, /^Use a torch on /);
    await Hoard.choose(s, /^Collect .* for Elen$/);
    GeneratedWorld.put(s, `${region.settlements[0]!.id}_shop`);
    await s.perform('wait');
    const [gold, experience] = [s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')),
      s.campaign.state.party.map(m => m.experience)];
    await Hoard.choose(s, /^Sell .* to /);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + worth);
    expect(s.campaign.state.party.map(m => m.experience)).toEqual(experience.map(x => x + worth));
    expect(s.campaign.world.test(ModuleWriter.call('realized', `region__${barrow.id}_goods`))).toBe(true);
  }, 60000);
});
