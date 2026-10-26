import type { Campaign } from '../campaign/campaign';
import type { BundleSource } from '../campaign/bundle-source';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Borders, type Side } from './land/borders';
import { WorldAssembler } from './world-assembler';
import { ModuleBundle } from '../campaign/module-bundle';
import { WorldGrid } from './world-grid';
import { RegionWriter, type Region } from './region-writer';
import { Countries, type Country } from './countries';

// A generated world goes on past the edges of the region a company starts in. Each region's roads run out to a
// march-stone on every side; the first time a company stands at one, the country beyond is drawn (from the world's
// seed and where it lies, so it is always the same country) and installed, with the road across the march between.
// A region reached first from another side has its own march-stone on this side already: only the road is new.
export class Frontier {
  constructor(private readonly seed: string, private readonly base: BundleSource) {}
  // Whether standing where it stands, the company is about to have a country beyond drawn (which takes a while).
  drawing(campaign: Campaign): boolean {
    const at = /^(.+)__edge_(north|east|south|west)$/.exec(campaign.world.one('at', 'party') ?? '');
    const here = at && WorldGrid.at(at[1]!);
    if (!at || !here) { return false; }
    const rid = WorldGrid.id(...WorldGrid.next(here, at[2] as Side));
    return !new Set(campaign.installed).has(rid);
  }
  // After each command: the country beyond the march-stone the company stands at, if it is not there yet, and the
  // road to it. The region newly drawn, if one was.
  async expand(campaign: Campaign): Promise<{ region?: Region; rid: string } | undefined> {
    const at = /^(.+)__edge_(north|east|south|west)$/.exec(campaign.world.one('at', 'party') ?? '');
    const here = at && WorldGrid.at(at[1]!);
    if (!at || !here) { return undefined; }
    const side = at[2] as Side, [x, y] = WorldGrid.next(here, side), rid = WorldGrid.id(x, y);
    const link = `link${[at[1]!, rid].sort().join('')}`, installed = new Set(campaign.installed);
    if (installed.has(link)) { return undefined; }
    // An authored country is reached by its own road in, and by no other.
    let region: Region | undefined, country = this.holds(campaign, rid);
    if (country && country.side !== side) { return undefined; }
    if (!installed.has(rid)) {
      country = this.fits(campaign, at[1]!, side);
      if (country) {
        await campaign.install({ id: rid, bundle: this.base.resolve(`data/adventures/${country.bundle}`),
          imports: { party: `${RegionWriter.id}.party` } }, this.base, false, true);
      } else {
        // Each of its modules is checked as it is compiled; the joined whole is checked once, with the road in, as a
        // campaign is assembled (Campaign.assemble). Everyone's creature facts are projected with each, as before: the
        // order they come to be held in is the order rules read them in.
        const beyond = await this.drawn(campaign, x, y);
        for (const request of beyond.requests) { await campaign.install(request, beyond.source, false, true); }
        region = beyond.region;
      }
    }
    const files = this.road(link), there = country ? country.entry : `edge_${Borders.opposite[side]}`;
    await campaign.install({ id: link, bundle: `${link}/module.json`, imports: {
      here: `${at[1]!}.edge_${side}`, there: `${rid}.${there}` } },
    new OverlayBundleSource(this.base, files));
    return { rid, ...region ? { region } : {} };
  }
  // The countries beyond the march-stones a step from where the company stands, drawn and parsed ahead of its getting
  // to one (drawing one takes seconds), while the player reads; drawing it then finds it so. Nothing is installed: a
  // country the company never goes to is never in its world, nor are its kinds in the catalogs (ModuleBundle.prepare).
  async prepare(campaign: Campaign): Promise<void> {
    const world = campaign.world, here = world.one('at', 'party'), installed = new Set(campaign.installed);
    for (const way of here ? world.relatedTo('connects', here) : []) {
      const at = /^(.+)__edge_(north|east|south|west)$/.exec(way.args[2] ?? ''), from = at && WorldGrid.at(at[1]!);
      if (!at || !from) { continue; }
      const side = at[2] as Side, [x, y] = WorldGrid.next(from, side), rid = WorldGrid.id(x, y);
      if (installed.has(rid) || installed.has(`link${[at[1]!, rid].sort().join('')}`)) { continue; }
      const country = this.fits(campaign, at[1]!, side);
      if (country) { await ModuleBundle.prepare(this.base.resolve(`data/adventures/${country.bundle}`), this.base); continue; }
      const beyond = await this.drawn(campaign, x, y, true);
      for (const request of beyond.requests) { await ModuleBundle.prepare(request.bundle, beyond.source); }
    }
  }
  // The country drawn beyond a march, from all it is drawn from now: drawn once, if it was drawn ahead from the same.
  private readonly ahead = new Map<string, Awaited<ReturnType<typeof WorldAssembler.beyond>>>();
  private async drawn(campaign: Campaign, x: number, y: number, keep = false) {
    const installed = new Set(campaign.installed);
    const at = { x, y, calendar: campaign.state.calendar, exclude: await this.placed(installed),
      named: this.named(campaign, [x, y]), taken: this.works(campaign) }, key = JSON.stringify(at);
    const beyond = this.ahead.get(key) ?? await WorldAssembler.beyond(this.seed, this.base, at);
    if (keep) { this.ahead.set(key, beyond); } else { this.ahead.clear(); }
    return beyond;
  }
  // The authored country a region already installed is, if it is one.
  private holds(campaign: Campaign, rid: string): Country | undefined {
    return Countries.list.find(c => campaign.module.entities.some(e => e.id === `${rid}__${c.marker}`));
  }
  // The authored country that fits beyond this march, if one does and is not in the world already. Only the first
  // country's marches lead into one, where its folk name it: a country drawn later names its own neighbours on its
  // march-stones, and one installed beyond them made the stone lie (the independent review's E2).
  private fits(campaign: Campaign, here: string, side: Side): Country | undefined {
    if (here !== RegionWriter.id) { return undefined; }
    const terrain = campaign.world.one('terrain', `${here}__region`)?.replace(/^.*__/, '') ?? '';
    return Countries.fits(terrain, side, c => campaign.module.entities.some(e => e.id.endsWith(`__${c.marker}`)), this.seed);
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
      const terrain = world.one('terrain', entity)?.replace(/^.*__/, ''), held = this.holds(campaign, rid);
      if (held) { return [[side, { name: held.name, terrain: held.terrain }]]; }
      return installed.has(rid) && name && terrain ? [[side, { name, terrain }]] : [];
    }));
  }
}
