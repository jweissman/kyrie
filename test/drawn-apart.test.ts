import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { StoryCasts } from '../src/campaign/story-casts';
import type { BundleRequest, CampaignManifest } from '../src/campaign/module-bundle';

// The people a story's generation casts are named by its identity and by what its world gives it to be drawn apart
// from, never by who is installed before it (OR-418: ModuleBundle.apart had widened a story's `taken` with everyone
// installed already, so the name a story's person was given depended on which provinces and kits came before it,
// and on which existed at all). A world's stories are drawn apart in the order it drew them, each from the people
// those before it cast, read ahead without their Kyr (StoryCasts); then a story installed late, or into a world
// holding other stories than the one it was drawn in, names its people as it was drawn to: what installing a province
// only when it is first neared needs (lazy-provinces.md). The fever on Lowmouth's green, drawn alone and drawn after
// the drover's story, each installed in its own world, and late into a world under way, with the drover or without.
const root = 'test/fixtures/drawn-apart', seed = 'apart', source = NodeBundleSource.shared;
class DrawnApart {
  static names(c: Campaign, module: string): string[] {
    return c.module.entities.filter(e => e.type === 'group' && e.id.startsWith(`${module}__`))
      .map(e => e.name.split(', ')[0]!).sort();
  }
  // A world's requests as it draws them apart (CampaignAssembly), by id.
  static async drawn(campaign: string): Promise<Map<string, BundleRequest>> {
    const path = source.resolve(`${root}/${campaign}.campaign.json`);
    const m = JSON.parse(await source.read(path)) as CampaignManifest;
    const modules = m.modules.map(r => ({ ...r, bundle: source.resolve(r.bundle, path) }));
    await StoryCasts.drawApart(modules, { seed, source });
    return new Map(modules.map(r => [r.id, r]));
  }
  static load(campaign: string): Promise<Campaign> { return Campaign.load(`${root}/${campaign}.campaign.json`, seed, source); }
  // The fever as one world drew it, installed late into Lowmouth, after the drover or not.
  static async late(drawnIn: string, drover: boolean): Promise<Campaign> {
    const c = await this.load('home'), drawn = await this.drawn(drawnIn), after = await this.drawn('after');
    if (drover) { await c.install(after.get('drover')!, source); }
    await c.install(drawn.get('fever')!, source);
    return c;
  }
}
describe('a story drawn apart', () => {
  it('names its people as its world drew it, whatever is installed before it', async () => {
    const alone = DrawnApart.names(await DrawnApart.load('alone'), 'fever');
    const after = DrawnApart.names(await DrawnApart.load('after'), 'fever');
    expect([alone.length, after.length]).toEqual([2, 2]);
    expect([DrawnApart.names(await DrawnApart.late('alone', true), 'fever'),
      DrawnApart.names(await DrawnApart.late('after', false), 'fever'),
      DrawnApart.names(await DrawnApart.late('after', true), 'fever')]).toEqual([alone, after, after]);
  }, 60000);
  it('casts, read ahead, the people its installation names', async () => {
    for (const world of ['alone', 'after']) {
      const cast = await StoryCasts.cast((await DrawnApart.drawn(world)).get('fever')!, { seed, source });
      expect([world, cast.sort()]).toEqual([world, DrawnApart.names(await DrawnApart.load(world), 'fever')]);
    }
  }, 60000);
});
