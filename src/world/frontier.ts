import type { Campaign } from '../campaign/campaign';
import type { BundleSource } from '../campaign/bundle-source';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Borders, type Side } from './land/borders';
import { WorldAssembler } from './world-assembler';
import { WorldGrid } from './world-grid';
import type { Region } from './region-writer';

// A generated world goes on past the edges of the region a company starts in. Each region's roads run out to a
// march-stone on every side; the first time a company stands at one, the country beyond is drawn (from the world's
// seed and where it lies, so it is always the same country) and installed, with the road across the march between.
// A region reached first from another side has its own march-stone on this side already: only the road is new.
export class Frontier {
  constructor(private readonly seed: string, private readonly base: BundleSource) {}
  // After each command: the country beyond the march-stone the company stands at, if it is not there yet, and the
  // road to it. The region newly drawn, if one was.
  async expand(campaign: Campaign): Promise<{ region?: Region; rid: string } | undefined> {
    const at = /^(.+)__edge_(north|east|south|west)$/.exec(campaign.world.one('at', 'party') ?? '');
    const here = at && WorldGrid.at(at[1]!);
    if (!at || !here) { return undefined; }
    const side = at[2] as Side, [x, y] = WorldGrid.next(here, side), rid = WorldGrid.id(x, y);
    const link = `link${[at[1]!, rid].sort().join('')}`, installed = new Set(campaign.installed);
    if (installed.has(link)) { return undefined; }
    let region: Region | undefined;
    if (!installed.has(rid)) {
      const beyond = await WorldAssembler.beyond(this.seed, this.base, { x, y, calendar: campaign.state.calendar,
        exclude: await this.placed(installed), named: this.named(campaign, [x, y]), taken: this.works(campaign) });
      for (const request of beyond.requests) { await campaign.install(request, beyond.source); }
      region = beyond.region;
    }
    const files = this.road(link);
    await campaign.install({ id: link, bundle: `${link}/module.json`, imports: {
      here: `${at[1]!}.edge_${side}`, there: `${rid}.edge_${Borders.opposite[side]}` } },
    new OverlayBundleSource(this.base, files));
    return { rid, ...region ? { region } : {} };
  }
  // Whether a campaign is a generated world (its manifest is one the assembler wrote), which can go on past its edges.
  static generated(scenario: string): boolean { return /(^|\/)world-[^/]*\.campaign\.json$/.test(scenario); }
  // The road across the march between two regions' march-stones.
  private road(id: string): Record<string, string> {
    const source = [`Module ${id} "The road across the march" {`, '  Place here "Where the road leaves" is room.',
      '  Place there "Where the road comes in" is room.',
      '  Passage march "the road across the march" is road between here and there taking 2 hours.', '  Goal false.', '}'];
    return { [`${id}/module.json`]: JSON.stringify({ version: 1, source: 'link.kyr', rules: ['world'],
      imports: ['here', 'there'], roles: { here: { type: 'place' }, there: { type: 'place' } } }),
    [`${id}/link.kyr`]: source.join('\n') };
  }
  // The scenarios placed anywhere in the world already, which a new region does not repeat.
  private async placed(installed: Set<string>): Promise<string[]> {
    const library = await WorldAssembler.library(this.base, 'data/scenarios/library.json');
    const bare = new Set([...installed].map(id => id.replace(/^x(m?\d+)y(m?\d+)/, '').replace(/\d+$/, '')));
    return library.filter(e => e.manifest.modules.some(m => bare.has(m.id.replace(/[^A-Za-z0-9]/g, ''))))
      .map(e => e.manifest.id);
  }
  // What the works already drawn anywhere in the world are called (b2's eastern country had a second Caelumspir).
  private works(campaign: Campaign): string[] {
    return campaign.module.entities.filter(e => /__w\d+$/.test(e.id)).map(e => e.name);
  }
  // What the regions already drawn around a place in the world are really called, and what country they are.
  private named(campaign: Campaign, at: [number, number]): Region['beyond'] {
    const world = campaign.world, installed = new Set(campaign.installed);
    return Object.fromEntries(Borders.sides.flatMap(side => {
      const rid = WorldGrid.id(...WorldGrid.next(at, side)), entity = `${rid}__region`;
      const name = campaign.module.entities.find(e => e.id === entity)?.name;
      const terrain = world.one('terrain', entity)?.replace(/^.*__/, '');
      return installed.has(rid) && name && terrain ? [[side, { name, terrain }]] : [];
    }));
  }
}
