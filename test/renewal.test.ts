import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionGeography } from '../src/world/region-geography';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// A work left empty is taken again by the beasts of its country some nights later; the settlement nearest it notices,
// its innkeeper talks of it, and whoever clears it again is thanked for it. a1: a barrow of the Barrow-Kin, whose
// dead the company has put down; a ghoul moves in.
class Empty {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    return { w, s, barrow: w.report.region.sites.find(x => x.work?.plan === 'barrow')! };
  }
  static kill(s: PlaySession, group: string) {
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.inhabitants[group] ?? []);
    try {
      lease.creatures.forEach(c => { c.state.hp = 0; });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
  static choice(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).find(c => pattern.test(c.choice.name));
  }
}

describe('a work left empty', () => {
  it('is taken again some nights later, talked of, and its clearing thanked', async () => {
    const { w, s, barrow } = await Empty.start(), town = RegionGeography.near(w.report.region, barrow).id;
    Empty.kill(s, `region__${barrow.id}_dead`);
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(Empty.choice(s, /what is out at/)).toBeUndefined();
    let nights = 0;
    while (!Empty.choice(s, /what is out at/) && nights < 12) {
      await s.perform('wait_for_dark'); await s.perform('wait_for_light'); nights++;
    }
    expect(nights).toBeGreaterThanOrEqual(4);
    expect(s.campaign.world.one('at', `region__${barrow.id}_newcomers`)).toBe(`region__${barrow.id}_passage`);
    const news = await s.perform(Empty.choice(s, /what is out at/)!.choice.id) as { response?: string };
    expect(news.response).toContain(`Moved into ${barrow.name} while it stood empty`);
    const green = await s.perform(`go(region__${town}_inn_door,region__${town}_green)`) as { perceptions?: { text: string }[] };
    expect(green.perceptions!.some(p => /The flocks have been brought in close/.test(p.text))).toBe(true);
    Empty.kill(s, `region__${barrow.id}_newcomers`);
    await s.perform(`go(region__${town}_inn_door,region__${town}_taproom)`);
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await s.perform(Empty.choice(s, /dealt with$/)!.choice.id);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeGreaterThan(gold);
    expect(Empty.choice(s, /dealt with$/)).toBeUndefined();
  }, 120000);
});
