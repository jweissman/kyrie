import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// The kingdom that came after the makers left works of its own, in its own letters, which the folk can read: an
// abbey (a1), whose brothers copied the makers' inscriptions and wrote a glossary of the old script; a keep (ash),
// whose roll tells how the kingdom fell and whose wall looks out over the country.
class Later {
  static async start(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static async choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
  static has(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).some(x => pattern.test(x.choice.name));
  }
  static knows(s: PlaySession, fact: string) {
    return s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__${fact}`));
  }
}

describe('the later kingdom\'s works', () => {
  it('an abbey\'s glossary lets a company with no scholar read the old script', async () => {
    const { w, s } = await Later.start('a1'), abbey = w.report.region.sites.find(x => x.work?.plan === 'abbey')!;
    GeneratedWorld.put(s, `${abbey.id}_chapter`);
    await s.perform('wait');
    await Later.choose(s, /^Blow the dust off the chronicle/);
    expect(Later.knows(s, 'history_successors')).toBe(true);
    GeneratedWorld.put(s, `${abbey.id}_scriptorium`);
    await s.perform('wait');
    // Without the old script the copies cannot be read.
    expect(Later.has(s, /^Read the copied inscriptions/)).toBe(false);
    await Later.choose(s, /^Pick the book-press's lock/);
    await Later.choose(s, /^Take the brothers' glossary .* out of the book-press for Elen$/);
    await Later.choose(s, /^Equip the brothers' glossary .* on Elen$/);
    await Later.choose(s, /^Read the copied inscriptions/);
    expect([Later.knows(s, 'history_makers'), Later.knows(s, 'history_fate')]).toEqual([true, true]);
  }, 60000);
  it('a keep\'s roll tells how the kingdom fell, and its wall shows the way to another site', async () => {
    const { w, s } = await Later.start('ash'), keep = w.report.region.sites.find(x => x.work?.plan === 'keep')!;
    GeneratedWorld.put(s, `${keep.id}_solar`);
    await s.perform('wait');
    const read = await Later.choose(s, /^Untie the castle roll/) as { perceptions?: { text: string }[] };
    const fell = /eleven times|horses, one by one|cut in two|ships in sight/;
    expect(read.perceptions!.some(p => fell.test(p.text))).toBe(true);
    expect(Later.knows(s, 'history_successors')).toBe(true);
    GeneratedWorld.put(s, `${keep.id}_walk`);
    const seen = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(seen.perceptions!.some(p => /Far off to the .* the lord's men would have seen/.test(p.text))).toBe(true);
    expect(w.report.region.sites.some(x => x !== keep && Later.knows(s, `${x.id}_found`))).toBe(true);
  }, 60000);
});
