import type { Campaign } from '../campaign/campaign';
import type { BundleSource } from '../campaign/bundle-source';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Borders, type Side } from './land/borders';
import { Career } from './career';
import { WorldAssembler } from './world-assembler';
import { ModuleBundle, type BundleRequest } from '../campaign/module-bundle';
import { WorldGrid } from './world-grid';
import { WorldShape } from './world-shape';
import { RegionWriter, type Region } from './region-writer';
import { Countries, type Country } from './countries';
import { Provinces } from './provinces';
import { CityResidents } from './city-residents';
import { Renewal } from './renewal';
import { Sittings } from '../paintings/sittings';
import type { DeemValue } from 'deem';

// A generated world goes on past the edges of the region a company starts in. Each region's roads run out to a
// march-stone on every side; the first time a company stands at one, the country beyond is drawn (from the world's
// seed and where it lies, so it is always the same country) and installed, with the road across the march between.
// A region reached first from another side has its own march-stone on this side already: only the road is new.
export class Frontier {
  // made: what the world was drawn with (its terrain, if one was asked for), to draw what it held back the same way.
  constructor(private readonly seed: string, private readonly base: BundleSource,
    private readonly made: { region?: Record<string, DeemValue> } = {}) {}
  // Whether standing where it stands, the company is about to have a country beyond drawn (which takes a while).
  drawing(campaign: Campaign): boolean {
    const at = /^(.+)__edge_(north|east|south|west)$/.exec(campaign.world.one('at', 'party') ?? '');
    const here = at && WorldGrid.at(at[1]!);
    if (!at || !here) { return false; }
    const rid = WorldGrid.id(...WorldGrid.next(here, at[2] as Side));
    return !new Set(campaign.installed).has(rid) && !this.closed(campaign, rid, at[2] as Side);
  }
  // Whether the road goes no further than the march-stone: the country beyond is an authored one, entered from
  // another side, and not there yet as something else (a world kept from before it was planned there); or it is a
  // great sea (see WorldShape), and the march-stone is its shore, crossed by ship and not on foot.
  private closed(campaign: Campaign, rid: string, side: Side): boolean {
    const cell = WorldGrid.at(rid);
    if (cell && WorldShape.sea(...cell)) { return true; }
    const planned = new Set(campaign.installed).has(rid) ? this.holds(campaign, rid)
      : Countries.plan(this.seed, this.first(campaign)).get(rid);
    return !!planned && planned.side !== side;
  }
  // What kind of country the world's first is, which with the seed decides where its authored countries lie.
  private first(campaign: Campaign): string {
    return campaign.world.one('terrain', `${RegionWriter.id}__region`)?.replace(/^.*__/, '') ?? '';
  }
  // After each command: the country beyond the march-stone the company stands at, if it is not there yet, and the
  // road to it. The region newly drawn, if one was.
  // And first, what the world held back that the company now stands near (see PendingPlacements).
  async expand(campaign: Campaign): Promise<{ region?: Region; rid: string } | undefined> {
    await ModuleBundle.pending.nearing(campaign, this.base);
    await this.renew(campaign);
    const gate = new RegExp(`^${RegionWriter.id}__${Provinces.room('(\\w+)')}$`).exec(campaign.world.one('at', 'party') ?? '');
    if (gate) { await this.province(campaign, gate[1]!); return undefined; }
    const at = /^(.+)__edge_(north|east|south|west)$/.exec(campaign.world.one('at', 'party') ?? '');
    const here = at && WorldGrid.at(at[1]!);
    if (!at || !here) { return undefined; }
    const side = at[2] as Side, [x, y] = WorldGrid.next(here, side), rid = WorldGrid.id(x, y);
    const link = `link${[at[1]!, rid].sort().join('')}`, installed = new Set(campaign.installed);
    if (installed.has(link)) { return undefined; }
    // An authored country is reached by its own road in, and by no other.
    if (this.closed(campaign, rid, side)) { return undefined; }
    let region: Region | undefined, country = this.holds(campaign, rid);
    if (!installed.has(rid)) {
      country = this.fits(campaign, at[1]!, side);
      if (country) {
        // What the country below says of it, which it marks old news when it is seen through (optional to it).
        const word = Frontier.word(country, `${at[1]!}.edge_${side}_beyond`);
        await campaign.install({ id: rid, bundle: this.base.resolve(`data/adventures/${country.bundle}`),
          imports: { party: `${RegionWriter.id}.party`, ...word, ...await this.herald(campaign, country) }, chapter: true },
        this.base, false, true);
      } else {
        // Each of its modules is checked as it is compiled; the joined whole is checked once, with the road in, as a
        // campaign is assembled (Campaign.assemble). Everyone's creature facts are projected with each, as before: the
        // order they come to be held in is the order rules read them in. What it reads of the first country that the
        // world holds back is taken up first (see PendingPlacements).
        const beyond = await this.drawn(campaign, x, y);
        for (const request of await this.apart(campaign, beyond, [...beyond.names, ...campaign.names])) {
          await ModuleBundle.pending.before(campaign, request, this.base);
          await campaign.install(request, beyond.source, false, true);
        }
        region = beyond.region;
      }
    }
    const files = this.road(link), there = country ? country.entry : `edge_${Borders.opposite[side]}`;
    await campaign.install({ id: link, bundle: `${link}/module.json`, imports: {
      here: `${at[1]!}.edge_${side}`, there: `${rid}.${there}` } },
    new OverlayBundleSource(this.base, files));
    return { rid, ...region ? { region } : {} };
  }
  // A province of the first country (see Provinces), the first time a company stands at its way in: the adventure
  // installed within the country, not as a country of its own, and the road on from the way in to where its own
  // places begin.
  private async province(campaign: Campaign, id: string) {
    const country = Countries.provinces.find(c => c.id === id), install = Provinces.install(id);
    if (!country) { return; }
    if (!campaign.installed.includes(install)) { await this.author(campaign, country, install); }
    // And what other adventures are set in its city, in a world saved before they were (see CityResidents).
    await CityResidents.install(campaign, this.base, id, install);
  }
  // The adventure itself, and the road on from its way in.
  private async author(campaign: Campaign, country: Country, install: string) {
    const id = country.id;
    const word = Frontier.word(country, `${RegionWriter.id}.${Provinces.room(id)}_beyond`);
    await campaign.install({ id: install, bundle: this.base.resolve(`data/adventures/${country.bundle}`),
      imports: { party: `${RegionWriter.id}.party`, ...word, ...await this.herald(campaign, country) }, chapter: true,
      within: `${RegionWriter.id}__region` }, this.base, false, true);
    const link = `link${install}`;
    await campaign.install({ id: link, bundle: `${link}/module.json`, imports: {
      here: `${RegionWriter.id}.${Provinces.room(id)}`, there: `${install}.${country.entry}` } },
    new OverlayBundleSource(this.base, this.road(link, `the road on into ${country.name}`, '1 hour')));
  }
  // What the first country's towns have going on next, begun as it falls due (see Renewal); one the country has none
  // for is not looked for again.
  private readonly none = new Set<number>();
  private async renew(campaign: Campaign) {
    const installed = new Set(campaign.installed);
    for (let n = 1; n <= Renewal.due(campaign.readout.elapsed, Renewal.ended(campaign)); n++) {
      if (installed.has(Renewal.id(n)) || this.none.has(n)) { continue; }
      const name = campaign.module.entities.find(e => e.id === `${RegionWriter.id}__region`)?.name;
      const held = await Renewal.draw(this.seed, this.base, { ...this.made, ...name ? { name } : {} }, n);
      if (!held) { this.none.add(n); }
      for (const request of await this.apart(campaign, held, campaign.names)) {
        await ModuleBundle.pending.before(campaign, request, this.base);
        await campaign.install(request, held!.source, false, true);
      }
    }
  }
  // The countries beyond the march-stones a step from where the company stands, drawn and parsed ahead of its getting
  // to one (drawing one takes seconds), while the player reads; drawing it then finds it so. Nothing is installed: a
  // country the company never goes to is never in its world, nor are its kinds in the catalogs (ModuleBundle.prepare).
  // And what the world holds back within reach of the company, likewise (see PendingPlacements).
  async prepare(campaign: Campaign): Promise<void> {
    await ModuleBundle.pending.prepare(campaign, this.base);
    const world = campaign.world, here = world.one('at', 'party'), installed = new Set(campaign.installed);
    for (const way of here ? world.relatedTo('connects', here) : []) {
      const at = /^(.+)__edge_(north|east|south|west)$/.exec(way.args[2] ?? ''), from = at && WorldGrid.at(at[1]!);
      if (!at || !from) { continue; }
      const side = at[2] as Side, [x, y] = WorldGrid.next(from, side), rid = WorldGrid.id(x, y);
      if (installed.has(rid) || installed.has(`link${[at[1]!, rid].sort().join('')}`)
        || this.closed(campaign, rid, side)) { continue; }
      const country = this.fits(campaign, at[1]!, side);
      if (country) { await ModuleBundle.prepare(campaign.vocabulary,
        this.base.resolve(`data/adventures/${country.bundle}`), this.base); continue; }
      const beyond = await this.drawn(campaign, x, y, true);
      for (const request of beyond.requests) {
        await ModuleBundle.prepare(campaign.vocabulary, request.bundle, beyond.source);
      }
    }
  }
  // The country drawn beyond a march, from all it is drawn from now: drawn once, if it was drawn ahead from the same.
  // Kept while it is being drawn, too: a crossing made while the country was still being drawn ahead waits for that
  // drawing, and does not draw it again beside it (the architecture review's A24).
  private readonly ahead = new Map<string, ReturnType<typeof WorldAssembler.beyond>>();
  private async drawn(campaign: Campaign, x: number, y: number, keep = false) {
    const installed = new Set(campaign.installed), exclude = await Frontier.placed(this.base, Frontier.held(campaign));
    const at = { x, y, calendar: campaign.readout.calendar, exclude,
      named: this.named(campaign, [x, y]), taken: this.works(campaign), held: Sittings.held(campaign),
      first: this.first(campaign) };
    const key = JSON.stringify(at);
    const drawing = this.ahead.get(key) ?? WorldAssembler.beyond(this.seed, this.base, at);
    if (keep && !this.ahead.has(key)) {
      this.ahead.set(key, drawing);
      drawing.catch(() => { if (this.ahead.get(key) === drawing) { this.ahead.delete(key); } });
    }
    try { return this.career(await drawing, installed, at); } finally { if (!keep) { this.ahead.clear(); } }
  }
  // What is drawn for the world later, its stories drawn apart in the order they were drawn, from the names among
  // (the world's, and a country's own people's) and those cast before them (see StoryCasts, OR-418).
  private async apart(campaign: Campaign, drawn: { requests: BundleRequest[]; source: BundleSource } | undefined,
    among: readonly string[]): Promise<BundleRequest[]> {
    const requests = [...drawn?.requests ?? []];
    await ModuleBundle.drawApart(requests, { seed: this.seed, source: drawn?.source ?? this.base,
      now: campaign.readout.elapsed, among });
    return requests;
  }
  // The hunter's career, where the world holds its commission (a world kept from before draws as it did): the dragon
  // in its own country, the warden in the city's (see Career), beside what the country was drawn with.
  private career(drawn: Awaited<ReturnType<typeof WorldAssembler.beyond>>, installed: Set<string>,
    at: { x: number; y: number; first: string }): typeof drawn {
    if (!installed.has(Career.id)) { return drawn; }
    const rid = WorldGrid.id(at.x, at.y), files: Record<string, string> = {};
    const more = Career.beyond(this.seed, drawn.region, { ...at, rid, root: `career-${rid}`, files });
    if (!more.length) { return drawn; }
    return { ...drawn, requests: [...drawn.requests, ...more], source: new OverlayBundleSource(drawn.source, files) };
  }
  // What the country's herald, if the world placed one in the first region, tells it: each export the country reads,
  // bound to its import of the same name (the company joined the players on the green). A herald the world never
  // placed (a world kept from before) binds nothing, and the country is entered as from the road.
  private async herald(campaign: Campaign, country: Country): Promise<Record<string, string>> {
    if (!country.herald) { return {}; }
    const path = this.base.resolve(`data/scenarios/${country.herald.scenario}`);
    const manifest = JSON.parse(await this.base.read(path)) as { modules: { id: string }[] };
    const id = manifest.modules[0]!.id.replace(/[^A-Za-z0-9]/g, '');
    await ModuleBundle.pending.needed(campaign, [id], this.base);
    if (!campaign.installed.includes(id)) { return {}; }
    return Object.fromEntries(country.herald.exports.map(name => [name, `${id}.${name}`]));
  }
  // The authored country a region already installed is, if it is one.
  private holds(campaign: Campaign, rid: string): Country | undefined {
    return Countries.list.find(c => campaign.module.entities.some(e => e.id === `${rid}__${c.marker}`));
  }
  // The authored country beyond this march, if the world's plan puts one there (Countries.plan), entered from here,
  // and it is not in the world already. Only where the folk of the country told of it: a world kept before a country
  // drawn later could lead into one has its stones naming the countries drawn there, and keeps them (the independent
  // review's E2: a stone that named one country and led into another).
  private fits(campaign: Campaign, here: string, side: Side): Country | undefined {
    const at = WorldGrid.at(here);
    if (!at || !campaign.module.entities.some(e => e.id === `${here}__edge_${side}_beyond`)) { return undefined; }
    const c = Countries.plan(this.seed, this.first(campaign)).get(WorldGrid.id(...WorldGrid.next(at, side)));
    return c && c.side === side && !campaign.module.entities.some(e => e.id.endsWith(`__${c.marker}`)) ? c : undefined;
  }
  // What the country below says of a country, which it marks old news when it is seen through, and each way it may go
  // there (word_<way>), all optional to it (The Quiet in the Sky's friction 4).
  private static word(country: Country, said: string): Record<string, string> {
    if (!country.after) { return {}; }
    return { word: said, ...Object.fromEntries(Object.keys(country.after.by ?? {}).map(k => [`word_${k}`, `${said}_${k}`])) };
  }
  // Whether a campaign is a generated world (its manifest is one the assembler wrote), which can go on past its edges.
  static generated(scenario: string): boolean { return /(^|\/)world-[^/]*\.campaign\.json$/.test(scenario); }
  // The road across the march between two regions' march-stones; or on from a province's way in into it.
  private road(id: string, name = 'the road across the march', time = '2 hours'): Record<string, string> {
    const source = [`Module ${id} ${JSON.stringify(name.replace(/^the /, 'The '))} {`, '  Place here "Where the road leaves" is room.',
      '  Place there "Where the road comes in" is room.',
      `  Passage march ${JSON.stringify(name)} is road between here and there taking ${time}.`, '  Goal false.', '}'];
    return { [`${id}/module.json`]: JSON.stringify({ version: 1, source: 'link.kyr', rules: ['world'],
      imports: ['here', 'there'], roles: { here: { type: 'place' }, there: { type: 'place' } } }),
    [`${id}/link.kyr`]: source.join('\n') };
  }
  // The scenarios the world's first country places, which a country beyond does not repeat: decided as the world was
  // drawn, never by which countries beyond the company came to first (OR-1745: a country beyond had left out what the
  // countries installed before it held, so two lives of one seed that crossed the marches in another order found
  // other stories beyond them). The countries beyond are each drawn from what the first leaves, by where they lie and
  // the world's seed alone; one may hold a story another beyond holds too.
  static async placed(base: BundleSource, held: Iterable<string>): Promise<string[]> {
    const library = await WorldAssembler.library(base, 'data/scenarios/library.json');
    const own = new Set([...held].filter(id => !/^x(m?\d+)y(m?\d+)/.test(id)).map(id => id.replace(/\d+$/, '')));
    return library.filter(e => e.manifest.modules.some(m => own.has(m.id.replace(/[^A-Za-z0-9]/g, ''))))
      .map(e => e.manifest.id);
  }
  // What the world holds by its drawing: its installations, and what it holds back until it is neared.
  static held(campaign: Campaign): string[] {
    return [...campaign.installed, ...ModuleBundle.pending.held(campaign).flatMap(p => p.requests.map(r => r.id))];
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
      const way = held && `${WorldGrid.id(...WorldGrid.next(WorldGrid.next(at, side), Borders.opposite[held.side]))}__region`;
      if (held) { return [[side, { name: held.name, terrain: held.terrain, closed: true,
        way: campaign.module.entities.find(e => e.id === way)?.name }]]; }
      return installed.has(rid) && name && terrain ? [[side, { name, terrain }]] : [];
    }));
  }
}
