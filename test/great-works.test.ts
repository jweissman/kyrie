import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// The greatest of a region's first makers' works is hidden from the folk. a1: the Water-Wardens' dam, holding a
// black mere over the valley they drowned or left; opening its gates drains the mere and lets the company down to
// the street under it, where the water's keeper waits and the still water can be read.
class Dam {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    return { w, s: await PlaySession.start(w.path, 'a1', w.source) };
  }
  static has(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).some(c => pattern.test(c.choice.name));
  }
}

describe('the greatest of the makers\' works', () => {
  it('is out of sight until the makers\' story is known, and opens to its own mechanism', async () => {
    const { w, s } = await Dam.start(), great = w.report.region.sites.find(x => x.work?.great)!;
    expect(great.work!.plan).toBe('great_cistern');
    const track = s.campaign.world.related('connects').find(c => c.args[0] === `region__${great.id}_track`)!;
    GeneratedWorld.put(s, track.args[1]!.replace('region__', ''));
    await s.perform('wait');
    expect(PlayerView.choices(s.campaign).some(c => c.choice.id.includes(`region__${great.id}_track`))).toBe(false);
    GeneratedWorld.put(s, `${great.id}_tower`);
    await s.perform('wait');
    expect(Dam.has(s, /^Take the bottom of the stair/)).toBe(false);
    const wind = PlayerView.choices(s.campaign).find(c => /^Wind the three great wheels/.test(c.choice.name))!;
    const opened = await s.perform(wind.choice.id) as { perceptions?: { text: string }[] };
    expect(opened.perceptions!.some(p => /there are houses where the water was/.test(p.text))).toBe(true);
    GeneratedWorld.put(s, `${great.id}_face`);
    await s.perform('wait');
    expect(Dam.has(s, /^Take the bottom of the stair to the drowned street$/)).toBe(true);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__${great.id}_found`))).toBe(false);
  }, 60000);
});
