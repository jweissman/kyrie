import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// The greatest of a region's first makers' works is hidden from the folk. a1: the Water-Wardens' dam, holding a
// black mere over the valley they drowned or left; opening its gates drains the mere and lets the company down to
// the street under it, where the water's keeper waits and the still water can be read.
class GreatWork {
  static async start(seed = 'a1') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static has(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).some(c => pattern.test(c.choice.name));
  }
  // Takes the first choice offered whose name matches.
  static take(s: PlaySession, pattern: RegExp) {
    return s.perform(PlayerView.choices(s.campaign).find(c => pattern.test(c.choice.name))!.choice.id);
  }
}

describe('the greatest of the makers\' works', () => {
  it('is out of sight until the makers\' story is known, and opens to its own mechanism', async () => {
    const { w, s } = await GreatWork.start(), great = w.report.region.sites.find(x => x.work?.great)!;
    expect(great.work!.plan).toBe('great_cistern');
    const track = s.campaign.world.related('connects').find(c => c.args[0] === `region__${great.id}_track`)!;
    GeneratedWorld.put(s, track.args[1]!.replace('region__', ''));
    await s.perform('wait');
    expect(PlayerView.choices(s.campaign).some(c => c.choice.id.includes(`region__${great.id}_track`))).toBe(false);
    GeneratedWorld.put(s, `${great.id}_tower`);
    await s.perform('wait');
    expect(GreatWork.has(s, /^Take the bottom of the stair/)).toBe(false);
    const wind = PlayerView.choices(s.campaign).find(c => /^Wind the three great wheels/.test(c.choice.name))!;
    const opened = await s.perform(wind.choice.id) as { perceptions?: { text: string }[] };
    expect(opened.perceptions!.some(p => /there are houses where the water was/.test(p.text))).toBe(true);
    GeneratedWorld.put(s, `${great.id}_face`);
    await s.perform('wait');
    expect(GreatWork.has(s, /^Take the bottom of the stair to the drowned street$/)).toBe(true);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__${great.id}_found`))).toBe(false);
  }, 60000);
  // b2's later kingdom built keeps and toll-houses, and no abbey with a glossary in its scriptorium; without a scholar
  // in the company the old script, and the way to the Delvers' greatest work, would stay closed in that whole world.
  it('can be read toward in a world with no abbey: a town\'s priest keeps a glossary of the old script', async () => {
    const { w, s } = await GreatWork.start('b2'), sites = w.report.region.sites;
    expect(sites.some(x => x.work?.plan === 'abbey')).toBe(false);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.partyIds);
    try { lease.creatures[0]!.state.gold = 100; lease.commit(lease.creatures); } finally { lease.release(); }
    GeneratedWorld.put(s, `${w.report.region.settlements.find(t => t.size === 'town')!.id}_shrine`);
    await s.perform('wait');
    await GreatWork.take(s, /^Buy a glossary of the old script for Bran/);
    await GreatWork.take(s, /^Equip a glossary of the old script on Bran$/);
    const galleries = sites.find(x => x.work?.plan === 'galleries')!;
    GeneratedWorld.put(s, `${galleries.id}_dressing`);
    await GreatWork.take(s, /^Use a torch on Bran$/);
    await GreatWork.take(s, /^Read the tally on the wall/);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__history_${galleries.work!.art}`))).toBe(true);
  }, 60000);
});
