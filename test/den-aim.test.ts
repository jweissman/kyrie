import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';

// A den heard of is a den of something, until the company has been there: play 10 was told "Something has made its
// den there" and its aim said "The spiders have a den at the north-western cave" (NAR-12, notes knowing what nobody
// said).
describe('a den in the wild, heard of', () => {
  it('is something\'s den in the aims until it has been seen', async () => {
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(world.path, 'thorn', world.source);
    const placement = world.report.placements.find(p => p.scenario === 'den')!, den = placement.bindings.den!;
    await GeneratedWorld.hear(s, placement, world.report.placements.indexOf(placement) + 1);
    const aims = () => ScreenModel.build(s.campaign).objectives.filter(a => / den at /.test(a));
    expect(aims()).toEqual([expect.stringMatching(/^Something has made its den at /)]);
    GeneratedWorld.put(s, den);
    await s.leg('wait');
    expect(aims()).toHaveLength(1);
    expect(aims()[0]).not.toMatch(/^Something/);
    expect(aims()[0]).toMatch(/ have a den at /);
    // Dealt with (driven off), its word is old news, no longer passed on (WM-04): nobody tells of it as if it stood.
    const c = s.campaign as unknown as { world: PlaySession['campaign']['world']; commit(w: unknown): void };
    const beasts = `${placement.instance}__beasts`, rumour = `${placement.instance}__rumour`;
    expect(s.campaign.world.test(ModuleWriter.call('stale', rumour))).toBe(false);
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call(`${placement.instance}__driven`, beasts) }]));
    await s.leg('wait');
    expect(s.campaign.world.test(ModuleWriter.call('stale', rumour))).toBe(true);
  }, 60000);
});
