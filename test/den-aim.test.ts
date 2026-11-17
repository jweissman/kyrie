import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { RegionGeography } from '../src/world/region-geography';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';

// A den heard of is a den of something, until the company has been there: play 10 was told "Something has made its
// den there" and its aim said "The spiders have a den at the north-western cave" (NAR-12, notes knowing what nobody
// said).
// The town whose innkeeper tells of a site.
const carrier = (world: Awaited<ReturnType<typeof WorldAssembler.assemble>>, site: string) =>
  RegionGeography.seats(world.report.region).find(x => x.site.id === site)!.town.id;
describe('a den in the wild, heard of', () => {
  it('is something\'s den in the aims until it has been seen', async () => {
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(world.path, 'thorn', world.source);
    const placement = world.report.placements.find(p => p.scenario === 'den')!, den = placement.bindings.den!;
    // The innkeeper asked of the place can be asked again, for the way, until the company has been there (WM-04).
    const taproom = s.campaign.world.one('at', `region__${carrier(world, den)}_innkeeper`)!.replace(/^region__/, '');
    const asked = async () => { GeneratedWorld.put(s, taproom); await s.leg('wait');
      return PlayerView.choices(s.campaign).map(c => c.choice.id).filter(x => x.startsWith(`region__${den}_asked`)); };
    expect(await asked()).toEqual([`region__${den}_asked`]);
    await s.leg(`region__${den}_asked`);
    expect(await asked()).toEqual([`region__${den}_asked_again`]);
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
    expect(await asked()).toEqual([]);
  }, 60000);
});
