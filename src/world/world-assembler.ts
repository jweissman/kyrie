import { Memorials } from './memorial'; import type { Memorial } from '../memorial';
import { RegionWeather } from './region-weather';
import type { DeemValue } from 'deem';
import { Content, type CreatureGenerationContext } from '../content';
import type { VocabularyContext } from '../lang';
import { RandomStreams } from '../random-streams'; import { Costs } from '../costs';
import type { BundleSource } from '../campaign/bundle-source'; import type { BundleRequest } from '../campaign/module-bundle';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source'; import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { Overlays } from '../overlays';
import { PlaceNames } from './place-names';
import { RegionPeoples } from './region-peoples';
import { RegionEcology } from './region-ecology';
import { RegionGeography } from './region-geography';
import { RegionRecruits } from './region-recruits';
import { Countries } from './countries';
import { StoryPeople } from './story-people';
import { WorldShape } from './world-shape';
import { RegionWriter, type Carrier, type Company, type Contact, type Region, type Site } from './region-writer';
import { SettlementWriter } from './settlement-writer';
import { ScenarioTowns } from './scenario-towns';
import { Origins } from './origins';
import { WorldStart } from './world-start';
import { Composition, type KitEntry } from './compose/composition';
import { RegionHeld } from './region-held';
import { Atlases } from './land/atlas';
import { Histories } from './history/histories';
import { WorldGrid } from './world-grid'; import { ReferenceSettlement } from './reference-settlement';
import { StrategicAtlas } from './strategic-atlas';
import { ScenarioWord } from './scenario-word';
import { Livelihoods } from './livelihoods';
import { RegionWorks } from './region-works';
import { WorldDrawings } from './world-drawings';

// A scenario a generated region may include: where it belongs, the places it needs, its modules and bindings, the
// way in that stays hidden until someone hears of it (or looks where it starts), and what people say about it.
export interface ScenarioManifest {
  version: 1; id: string; name: string; instances?: number; weight?: number;
  // An adventure in a wild place (the default) or what is going on in a settlement (town).
  kind?: 'adventure' | 'town';
  context?: Record<string, string[]>;
  // A place a scenario needs: a site of some kind, a settlement (near:role, toward:side, any, largest, along:role:
  // the next along the roads from that one, or the first), or the stretch of road out of a settlement (near:role) or
  // between two (between:role,role).
  places: Record<string, { site?: string[]; settlement?: string; way?: string }>;
  // Another scenario's placement in the same country it is bound to, if there is one: that placement's place, here
  // under a role of its own (the drover's trail goes to the den nearest the town). A module that needs it is
  // installed only `when` it is bound; one of the other placement's exports is "role:module.export".
  links?: Record<string, { scenario: string; place: string; near?: string }>;
  modules: { id: string; bundle: string; imports: Record<string, string>; context?: Record<string, DeemValue>;
    when?: string }[];
  route?: string;
  // What looking about where a hidden way in starts finds, so it is not hidden from a company that never heard of it.
  found?: { known: string; told: string };
  // A hook is a fact the scenario establishes (module.export) that people pass on through some channels; unless it
  // `opens: false`, hearing it reveals the way in.
  hooks?: { fact: string; topic: string; channels: Carrier['channel'][]; opens?: boolean }[];
}
export interface Placement {
  scenario: string; instance: string; bindings: Record<string, string>; generated: string[];
  // rid: the region module it is set in (see WorldGrid): "region" for the first.
  modules: string[]; carriers: Record<string, string[]>; rid: string;
  // The placements its links are bound to, by role: where they are set, and which instance (see ScenarioManifest).
  linked?: Record<string, { rid: string; n: number }>;
  // The names its people have of their authors, which none of the country's own people is given (see StoryPeople).
  named?: string[];
}
export interface WorldReport {
  seed: string; region: Region; context: Record<string, string>;
  eligibility: { scenario: string; fits: boolean; why?: string }[]; placements: Placement[]; contacts: Contact[];
}
// A scenario of the library, and the names its modules give their people (see StoryPeople).
export interface Entry { path: string; manifest: ScenarioManifest; named?: string[] }

// Builds a playable campaign from a seed: Deem generates the region; scenarios are selected by the contexts they
// declare (a Deem select over the library); each is bound to the region's places, given any sites it needs, and
// spread by word of mouth. The result is an ordinary campaign manifest over generated and authored modules.
export class WorldAssembler {
  static readonly speakers: Record<Carrier['channel'], string> = { tavern: 'innkeeper', road: 'traveller',
    temple: 'priest', market: 'merchant' };
  static readonly heard: Record<Carrier['channel'], string> = { road: 'News from the roads reaches them first.',
    tavern: 'They hear everything said across their tables.', temple: 'The faithful bring them their troubles.',
    market: 'Traders tell them what they have seen.' };
  static readonly fixture = WorldStart.fixture;
  static assemble(...a: Parameters<typeof WorldAssembler.built>) { return Costs.timed('world', () => this.built(...a)); }
  private static async built(seed: string, base: BundleSource, options: {
    library?: string; scenarios?: number; towns?: number; region?: Record<string, DeemValue>;
    party?: CreatureGenerationContext[]; origin?: string; framework?: string | null;
    // Someone who died in this country before: where they lie, and how they died, which the country remembers.
    // And which standing scenarios it holds, by id (all, unless said): see Drawn.standing.
    memorial?: Memorial; standing?: string[]; chain?: string; opening?: string;
  } = {}): Promise<{ path: string; source: BundleSource; report: WorldReport }> {
    const vocabulary = Content.vocabulary();
    // The country as drawn for this seed and ask, its own copy (drawn once: see WorldDrawings).
    const { region, context, eligibility, placements, library, heralds, standing } =
      await WorldDrawings.of(seed, base, options);
    region.calendar = RegionWeather.year(new Expressions(RandomStreams.key(seed, 'world', 'calendar')));
    // One protagonist, with an origin in this world; or a company, each with an old acquaintance somewhere in it.
    const origin = options.origin ? (await Origins.load(base)).find(o => o.manifest.id === options.origin) : undefined;
    const party = origin ? [Origins.protagonist(origin.manifest, (options.party ?? this.fixture)[0]!,
      { chosen: !!options.party, region, placements })] : options.party ?? this.fixture;
    const contacts = origin ? [] : this.contacts(region, party, seed);
    const slug = seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'world', root = `world-${slug}`;
    const files: Record<string, string> = {};
    const modules: BundleRequest[] = [{ id: RegionWriter.id, bundle: base.resolve(`${root}/region/module.json`) }];
    // The family an origin makes the protagonist's own are of the protagonist's people: a human mage's brother had
    // been an elf ranger, the town's folk (play 10).
    const family = { own: party[0]!.name, ...origin?.manifest.binder === 'kin' ? { folk: party[0]!.raceId } : {} };
    this.spread(placements, { library: [...library, ...heralds, ...standing], base, region, contacts, context, files,
      root, modules, family });
    // Where the life begins: its origin, a stock opening chosen ahead of it, and what comes with them (WorldStart).
    const told = await WorldStart.begun(base, origin, options.opening, { seed, region, placements, party, contacts,
      root, files, modules });
    const path = base.resolve(`${root}.campaign.json`);
    const framework = options.framework === null ? [] : await this.framework(base, region, options.framework);
    const company = { size: party.length, contacts, ...told ? { start: told.start, coin: told.coin } : {} };
    this.write(region, { files, root, placements, company, vocabulary });
    const kits = framework.map(k => ({ ...k, optional: true }));
    // What the inn's count says of the places the kits make their own, written once they are placed (FH-24).
    const written = new OverlayBundleSource(base, files);
    const held = await RegionHeld.of(region, [...modules, ...kits], { seed, path, source: written, vocabulary });
    region.told = held.told;
    if (Object.keys(region.told).length) { this.write(region, { files, root, placements, company, vocabulary }); }
    if (options.memorial) { Memorials.remember(options.memorial, files, `${root}/region`); }
    // Its stories' people drawn apart from its own people's names (OR-418: see StoryCasts).
    const names = StoryPeople.held(region, files, `${root}/region/`);
    files[path] = JSON.stringify({ version: 1, name: region.name, modules: [...modules, ...kits], party, names,
      calendar: region.calendar,
      pitch: { heading: `A company in ${region.name}`, text: `${region.name} is ${RegionWriter.terrain(region.terrain)} `
        + `country, home to ${RegionWriter.peoples(region)}, who keep the faith of ${region.deity}. Nobody hires a `
        + 'company for nothing: listen in the taprooms, at the shrines and on the roads, and go where the trouble is. '
        + 'Choose three companions.' } });
    const source = new OverlayBundleSource(base, files);
    if ('composed' in held && held.composed) { Composition.keep(source, path, seed, held.composed); }
    return { path, source, report: { seed, region, context, placements, contacts,
      eligibility: library.map((e, i) => ({ scenario: e.manifest.id, ...eligibility[i]! })) } };
  }
  // The country beyond a border, drawn the first time a company goes there (see Frontier): a region of its own where
  // it lies in the world, with its own scenarios (none placed anywhere already), and no company of its own. The
  // names of the regions already drawn on either side are as they are, not as they would have been drawn; its works
  // are named apart from the works already drawn (`taken`), and its people painted apart from the paintings the
  // world's people hold (`held`). (first: the terrain of the world's first country, which with the seed decides where
  // its authored countries lie: see Countries.plan.)
  static async beyond(seed: string, base: BundleSource, at: { x: number; y: number; calendar?: Region['calendar'];
    exclude: string[]; named?: Region['beyond']; taken?: string[]; held?: string[]; first: string }):
    Promise<{ requests: BundleRequest[]; source: BundleSource; region: Region; names: string[] }> {
    const rid = WorldGrid.id(at.x, at.y);
    const region = this.region(seed, [at.x, at.y], undefined, { taken: at.taken, first: at.first });
    region.beyond = { ...region.beyond, ...at.named }; region.calendar = at.calendar; region.held = at.held;
    region.further = Countries.further(region, seed, at.first);
    const lib = await this.library(base, 'data/scenarios/library.json');
    // Its own goings-on: the atlas's, where it is a country of the atlas, and those of a city of the canon it holds.
    const own = [...await StrategicAtlas.entries(base, region),
      ...await Promise.all(WorldShape.goings(region).map(s => StoryPeople.entry(base, base.resolve(s))))];
    const recurrent = await this.library(base, this.recurrent);
    const { context, placements } = this.settle(region, lib, { seed: WorldGrid.seed(seed, at.x, at.y), rid,
      rounds: [3, 2], exclude: at.exclude, heralds: own, standing: recurrent });
    const root = `world-${seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'world'}/${rid}`;
    const files: Record<string, string> = {};
    // Its own random identity, its cell: every drawn country's Kyr module is `Module region`, and a module is seeded
    // by its own id, so without one each drew its people's bodies alike (the architecture review's AX-02: 88 people
    // shared seeds between two countries). The first country, drawn above, keeps the seed it had.
    const modules: BundleRequest[] = [{ id: rid, bundle: base.resolve(`${root}/region/module.json`),
      imports: { party: `${RegionWriter.id}.party` }, randomIdentity: rid }];
    this.spread(placements, { library: [...lib, ...own, ...recurrent], base, region, contacts: [], context, files,
      root, modules });
    RegionWriter.write(files, root, region, { company: null, taken: this.taken(placements), beyond: true,
      vocabulary: Content.vocabulary() });
    return { requests: modules, source: new OverlayBundleSource(base, files), region,
      names: StoryPeople.held(region, files, `${root}/region/`) };
  }
  // A region where it lies in its world, from its own seed: drawn by Deem, laid on its land, named and peopled.
  static region(...a: Parameters<typeof WorldAssembler.drew>): Region { return Costs.time('region', () => this.drew(...a)); }
  private static drew(seed: string, at: [number, number], drawn?: Record<string, DeemValue>,
    { taken = [], first }: { taken?: string[]; first?: string } = {}): Region {
    const own = WorldGrid.seed(seed, ...at);
    const d = WorldGrid.land(seed, at, drawn);
    const laid = this.lay(d, own, { world: seed, taken, clear: ReferenceSettlement.country(seed, at, d.terrain) });
    const region = { ...StrategicAtlas.named(PlaceNames.render(RegionPeoples.settle(laid, RandomStreams.key(own, 'world')))),
      at, beyond: WorldGrid.beyond(seed, at) };
    // Every country knows what authored country lies beyond it, where one does.
    return { ...region, world: seed, beyond: Countries.beyond(region, seed, first ?? region.terrain) };
  }
  // The scenarios a region is given: adventures in the wild places first, then what is going on in the
  // settlements; none placed elsewhere in the world already.
  static settle(region: Region, library: Entry[], at: { seed: string; rid: string; rounds: [number, number];
    exclude: string[]; heralds?: Entry[]; standing?: Entry[] }) {
    const context = { terrain: region.terrain, ancestry: region.ancestry, domain: region.domain };
    const eligibility = library.map(e => this.fits(e.manifest, context, region));
    const placements: Placement[] = [], claimed = new Set<string>();
    const count = new Map<string, number>(at.exclude.map(id => [id, Infinity]));
    // What goes ahead of the countries the world holds is on the road before anything else is placed.
    for (const herald of at.heralds ?? []) {
      count.set(herald.manifest.id, 1);
      const placed = this.place(herald.manifest, { n: 1, region, claimed, seed: at.seed, rid: at.rid, placements });
      if (placed) { placements.push(placed); }
    }
    for (const [kind, rounds] of [['adventure', at.rounds[0]], ['town', at.rounds[1]]] as const) {
      for (let round = 0; round < rounds; round++) {
        const open = library.filter((e, i) => (e.manifest.kind ?? 'adventure') === kind && eligibility[i]!.fits
          && (count.get(e.manifest.id) ?? 0) < (e.manifest.instances ?? 1)
          && this.placeable(e.manifest, region, claimed));
        const chosen = this.choose(open, context, RandomStreams.key(at.seed, 'world', kind === 'town' ? 'town' : 'scenario', round));
        if (!chosen) { break; }
        const n = (count.get(chosen.manifest.id) ?? 0) + 1;
        const placement = this.place(chosen.manifest, { n, region, claimed, seed: at.seed, rid: at.rid, placements });
        // One that cannot be placed here is not tried again here.
        count.set(chosen.manifest.id, placement ? n : Infinity);
        if (placement) { placements.push(placement); }
      }
    }
    // Standing stories and recurrent dungeon families use unclaimed ground after the ordinary draw.
    placements.push(...(at.standing ?? []).filter(x => this.placeable(x.manifest, region, claimed))
      .flatMap(e => this.place(e.manifest, { n: 1, region, claimed, seed: at.seed, rid: at.rid, placements }) ?? []));
    // Its stories' people keep the names their authors gave them, and its own people are named apart from them.
    StoryPeople.reserve(region, placements, [...library, ...at.standing ?? [], ...at.heralds ?? []]);
    return { context, eligibility, placements };
  }
  static readonly standing = 'data/scenarios/standing.json';
  static readonly recurrent = 'data/scenarios/recurrent.json';
  // Each placement's modules, and the module that spreads word of it.
  private static spread(placements: Placement[], at: { library: Entry[]; base: BundleSource; region: Region;
    contacts: Contact[]; context: Record<string, string>; files: Record<string, string>; root: string;
    modules: BundleRequest[]; family?: { folk?: string; own?: string } }) {
    const { library, base, region, context, files, root, modules } = at;
    placements.forEach((placement, i) => {
      const entry = library.find(e => e.manifest.id === placement.scenario)!;
      const kin = at.family?.folk && placement.scenario === 'drover' && placement.rid === RegionWriter.id;
      modules.push(...this.requests(entry, placement, base, { context: { ...context, ...this.wild(placement, region),
        ...StoryPeople.folk(placement, region, kin ? at.family : { own: at.family?.own }) }, region }));
      const word = ScenarioWord.of(entry.manifest, placement, { region, contacts: at.contacts });
      if (word) {
        files[`${root}/word-${placement.instance}/module.json`] = JSON.stringify(word.manifest);
        files[`${root}/word-${placement.instance}/word.kyr`] = word.source;
        modules.push({ id: `${this.prefix(placement.rid)}word${i + 1}`,
          bundle: `${root}/word-${placement.instance}/module.json`, imports: word.imports });
      }
    });
  }
  // What a region's modules' ids begin with: nothing for the first, "x1y0" for the one east of it.
  static prefix(rid: string): string { return rid === RegionWriter.id ? '' : rid; }
  // A region drawn by Deem laid on land of its own: its atlas, its settlements where people settled, and its sites
  // where each kind can stand (those that can stand nowhere left out).
  // clear: the first town is the reference game's, and nothing of the makers' is placed within two hexes of it.
  static lay(drawn: Region, seed: string, { world = seed, taken = [], clear = false }:
    { world?: string; taken?: string[]; clear?: boolean } = {}): Region {
    const atlas = Atlases.make(RandomStreams.key(seed, 'world', 'land'), drawn.terrain,
      { tongue: PlaceNames.landTongue(drawn), taken: [drawn.name], ...StrategicAtlas.land(drawn) });
    if (clear && atlas.seats[0]) { atlas.clear = [atlas.seats[0].cell]; }
    const region = RegionRecruits.distinct(Livelihoods.seat(drawn, atlas, seed), seed);
    const history = Histories.make(RandomStreams.key(seed, 'world', 'history'), drawn.terrain, atlas,
      { world: RandomStreams.key(world, 'world', 'history'), taken, arts: StrategicAtlas.arts(drawn) });
    // The region's sites are its makers' works, where their art put them.
    region.history = history;
    region.sites = history.works.map(w => ({ id: w.id, kind: Histories.plan(w.plan).kind, name: w.worn, hours: 1,
      gloss: w.old.gloss, tongue: w.old.tongue, cell: w.cell, ...w.zone ? { zone: w.zone, part: w.part } : {},
      work: { plan: w.plan, art: w.art, made: w.old.name, ...w.great ? { great: true } : {},
        ...w.deep ? { deep: true } : {}, ...w.imperial ? { imperial: true } : {} } }));
    return region;
  }
  // A site's cell in the region's land, by what kind of site it is; one that can stand nowhere is left out.
  private static situate(region: Region, site: Site, key: string): boolean {
    const atlas = region.atlas!, taken = region.sites.filter(s => s !== site && s.cell !== undefined).map(s => s.cell!);
    const spot = Atlases.place(atlas, site.kind, { key, taken });
    if (!spot) { return false; }
    Object.assign(site, spot);
    return true;
  }
  static readonly frontier = 'data/frameworks/frontier.json';
  // Writes the region, its module and its manifest. The framework's kits are composed against it as the campaign
  // loads: wild country gives a kit the places off the roads it wants, and one refused all the same is left out of the
  // world (they are optional there), the trace saying why.
  private static write(region: Region, at: { files: Record<string, string>; root: string; placements: Placement[];
    company: Company; vocabulary: VocabularyContext }) {
    RegionWriter.write(at.files, at.root, region, { company: at.company, taken: this.taken(at.placements),
      vocabulary: at.vocabulary });
  }
  // A framework's kits, with their paths made absolute, to be composed into the campaign when it loads.
  // And the country's own, where the atlas places some (StrategicAtlas.kits), their paths as the framework's are.
  private static async framework(base: BundleSource, region: Region, file = this.frontier): Promise<KitEntry[]> {
    const path = base.resolve(file), framework = JSON.parse(await base.read(path)) as { kits: KitEntry[] };
    return [...framework.kits, ...StrategicAtlas.kits(region)].map(k => ({ ...k, kit: base.resolve(k.kit, path) }));
  }
  // The sites scenarios have taken, which no kit may also take.
  private static taken(placements: Placement[]): Record<string, string> {
    return Object.fromEntries(placements.flatMap(p => p.generated.concat(Object.values(p.bindings))
      .filter(id => /^w\d+$/.test(id)).map(id => [id, p.scenario.replace(/[^A-Za-z0-9]/g, '_')])));
  }
  // Each member whose background brings a contact knows someone of that channel in one of the region's settlements.
  private static contacts(region: Region, party: CreatureGenerationContext[], seed: string): Contact[] {
    return party.flatMap((member, i) => {
      const tie = member.backgroundId ? Overlays.catalog[member.backgroundId]?.contact : undefined;
      if (!tie) { return []; }
      const name = member.name ?? `Member ${i + 1}`, n = region.settlements.length;
      const town = region.settlements[new Expressions(RandomStreams.key(seed, 'world', 'contact', name)).number(`1d${n}`) - 1]!;
      const carrier = `${town.id}_${this.speakers[tie.channel]}`;
      return [{ member: name, background: member.backgroundId!, channel: tie.channel, carrier, room: SettlementWriter.standing(region, town, this.speakers[tie.channel] as 'innkeeper'),
        text: `${tie.text.replaceAll('{contact}', `{${carrier}}`).replaceAll('{member}', name)} ${this.heard[tie.channel]}` }];
    });
  }
  // The heralds of the countries a first region lies beside (see Countries.heralds), kept out of the library's draw,
  // one for each scenario a country sends; and an atlas country's own goings-on, held so (StrategicAtlas.goings).
  static async heralds(base: BundleSource, region: Region, seed: string): Promise<Entry[]> {
    // A herald going ahead of several countries (the factor who buys old bronze) is placed once, bound to each.
    const sent = new Set(Countries.heralds(region, seed).map(c => `data/scenarios/${c.country.herald!.scenario}`));
    return Promise.all([...sent, ...StrategicAtlas.goings(region)].map(s => StoryPeople.entry(base, base.resolve(s))));
  }
  static library(base: BundleSource, index: string): Promise<Entry[]> { return StoryPeople.library(base, index); }
  // Context fit, decided by the same Deem selection the assembler uses, and whether its sites can exist here.
  static fits(s: ScenarioManifest, context: Record<string, string>, region: Region) {
    if (!this.choose([{ path: '', manifest: s }], context, 'fit')) {
      const wants = Object.entries(s.context ?? {}).map(([k, v]) => `${k} ${v.join('/')}`).join(', ');
      return { fits: false, why: `wants ${wants}` };
    }
    return this.placeable(s, region, new Set()) ? { fits: true } : { fits: false, why: 'no site it needs can stand here' };
  }
  // One weighted pick among scenarios whose declared contexts include the region's: a Deem select over a table.
  static choose(open: Entry[], context: Record<string, string>, seed: string): Entry | undefined {
    // Deem is asked only to weigh scenarios that fit; asked to choose among none, it complains before it fails.
    open = open.filter(e => Object.entries(e.manifest.context ?? {})
      .every(([k, v]) => !(k in context) || v.includes(context[k]!)));
    if (!open.length) { return undefined; }
    const keys = Object.keys(context);
    const rows = open.map(e => ({ _key: e.manifest.id,
      ...(e.manifest.weight && e.manifest.weight > 1 ? { __weight: e.manifest.weight } : {}),
      ...Object.fromEntries(Object.entries(e.manifest.context ?? {})
        .map(([k, v]) => [`_${k}`, Object.fromEntries(v.map(x => [x, true]))])) }));
    // Deem's negation binds loosely, so each clause is parenthesized.
    const predicate = keys.map(k => `((!dig(#__it, "_${k}")) || dig(#__it, "_${k}", #${k}))`).join(' && ');
    const setting = Content.settingWith({ scenarioLibrary: { discriminator: 'any', groups: { default: rows } } } as never,
      { scenario_choice: { __no_id: true, _pick: `=select(scenarioLibrary, default, '${predicate}')`, id: "=dig(#_pick, '_key')" } } as never);
    try {
      const id = new Content(seed, setting).generate('scenario_choice', context).id;
      return open.find(e => e.manifest.id === id);
    } catch (error) { return WorldAssembler.none(error); }
  }
  // Nothing fitting is no choice; any other failure of the setting (a table broken, a function unknown) is said, never
  // a scenario quietly left out of the world (ARV-M8).
  private static none(error: unknown): undefined {
    if (/No matching options/.test(String(error))) { return undefined; } throw error;
  }
  private static placeable(s: ScenarioManifest, region: Region, claimed: Set<string>): boolean {
    return Object.values(s.places).every(p => !p.site || p.site.some(kind =>
      region.sites.some(w => w.kind === kind && !claimed.has(w.id) && !w.work)
        || this.newSite(region, kind, 'probe') !== undefined));
  }
  private static newSite(region: Region, kind: string, seed: string): Site | undefined {
    const kinds = (GenerationSetting.tables as unknown as { siteKind: { groups: Record<string, { _key: string }[]> } })
      .siteKind.groups[region.terrain] ?? [];
    if (!kinds.some(k => k._key === kind)) { return undefined; }
    try {
      const site = new Content(seed).generate('site', { terrain: region.terrain, kind }) as unknown as Site;
      return { ...site, id: `w${region.sites.filter(s => !/^e\d+$/.test(s.id)).length + 1}` };
    } catch (error) { return WorldAssembler.none(error); }
  }
  // Binds each place a scenario needs: a free region site of a kind it accepts (or a newly generated one), or the
  // settlement nearest one of those sites. A site that can stand nowhere in the land, and the scenario is not placed,
  // and nothing it took is kept: placed all the same, its site had no cell, was never written, and the region's
  // exports named it (2 of 41 seeds, and 1 of 100 games Begin started, would not load: the architecture review's H1).
  static place(s: ScenarioManifest, at: { n: number; region: Region; claimed: Set<string>; seed: string;
    rid: string; placements?: Placement[] }): Placement | undefined {
    const { n, region, claimed, seed } = at, prefix = this.prefix(at.rid);
    const instance = `${prefix}${s.id.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`, bindings: Record<string, string> = {};
    const generated: string[] = [], before = new Set(claimed), sites = region.sites.length;
    for (const [role, need] of Object.entries(s.places)) {
      if (need.site) {
        // A scenario takes a site of its own, never one of the makers' works, which are whole already.
        let site = need.site.map(kind => region.sites.find(w => w.kind === kind && !claimed.has(w.id) && !w.work))
          .find(Boolean);
        if (!site) {
          const key = RandomStreams.key(seed, 'world', 'site', instance, role);
          site = PlaceNames.another(region, need.site.map(kind => this.newSite(region, kind, key)).find(Boolean)!, key);
          if (!this.situate(region, site, RandomStreams.key(seed, 'world', 'spot', instance, role))) {
            return this.undo(region, { sites, claimed, before });
          }
          region.sites.push(site); generated.push(site.id);
        }
        claimed.add(site.id); bindings[role] = site.id;
      } else if (need.settlement) {
        bindings[role] = ScenarioTowns.town(need.settlement, { region, bindings, claimed,
          parts: ScenarioTowns.parts(s, role), key: RandomStreams.key(seed, 'world', 'town', instance, role) });
        // No town to hold it but the reference game's, which holds no going-on: not placed in this country.
        if (!bindings[role]) { return this.undo(region, { sites, claimed, before }); }
      } else if (need.way) {
        const way = ScenarioTowns.way(region, need.way, bindings); if (way) { bindings[role] = way; }
      }
    }
    const linked = this.link(s, bindings, { region, placements: at.placements ?? [] });
    return { scenario: s.id, instance, bindings, generated, carriers: {}, rid: at.rid, ...linked ? { linked } : {},
      modules: s.modules.filter(m => !m.when || bindings[m.when]).map(m => `${prefix}${this.install(m.id, n)}`) };
  }
  // A placement not made: the sites and claims it made undone.
  private static undo(region: Region, at: { sites: number; claimed: Set<string>; before: Set<string> }): undefined {
    region.sites.length = at.sites;
    for (const id of [...at.claimed].filter(id => !at.before.has(id))) { at.claimed.delete(id); }
    return undefined;
  }
  // Binds each link to the placement of its scenario already made in the country whose place is nearest the one it
  // is near (a site near that settlement first, then the fewest hours out); none, and it is left unbound.
  private static link(s: ScenarioManifest, bindings: Record<string, string>,
    at: { region: Region; placements: Placement[] }): Placement['linked'] {
    const linked: NonNullable<Placement['linked']> = {};
    for (const [role, l] of Object.entries(s.links ?? {})) {
      const town = l.near ? bindings[l.near] : undefined;
      const other = at.placements.filter(p => p.scenario === l.scenario && p.bindings[l.place]).sort((a, b) =>
        this.out(at.region, a.bindings[l.place]!, town) - this.out(at.region, b.bindings[l.place]!, town))[0];
      if (!other) { continue; }
      bindings[role] = other.bindings[l.place]!;
      linked[role] = { rid: other.rid, n: Number(other.instance.match(/\d+$/)?.[0] ?? 1) };
    }
    return Object.keys(linked).length ? linked : undefined;
  }
  // How far out a site is from a settlement: one near it first, then by its hours.
  private static out(region: Region, site: string, town?: string): number {
    const w = region.sites.find(x => x.id === site);
    return w?.near === town ? -1 : w?.hours ?? Infinity;
  }
  private static install(m: string, n: number): string { return `${m.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`; }
  // A scenario reference: @party, @region, @region.part (the country's own place: edge_west), @role, @role.part (a
  // settlement's green, a site's track…), @history.makers / .fate / .successors, module.export, and ^module.export: a
  // module of the world's first country, read beyond it (the drovers' hall hears Bran sent the company: ST-11); where
  // there is none, it binds nothing, and the import is optional.
  static ref(value: string, placement: Placement, region?: Region): string {
    const [owner, named] = value.slice(1).split('.') as [string, string];
    if (value.startsWith('^')) { return `${this.prefix(RegionWriter.id)}${this.install(owner, 1)}.${named}`; }
    if (value.includes(':')) {
      const [role, rest] = value.split(':') as [string, string], [module, name] = rest.split('.') as [string, string];
      const other = placement.linked?.[role];
      if (!other) { throw new Error(`Scenario reference ${value} names no linked placement`); }
      return `${this.prefix(other.rid)}${this.install(module, other.n)}.${name}`;
    }
    if (!value.startsWith('@')) {
      const [module, name] = value.split('.') as [string, string];
      return `${this.prefix(placement.rid)}${this.install(module, Number(placement.instance.match(/\d+$/)?.[0] ?? 1))}.${name}`;
    }
    const [role, part] = value.slice(1).split('.') as [string, string | undefined];
    if (role === 'party') { return `${RegionWriter.id}.party`; }
    if (role === 'region') { return `${placement.rid}.${part ?? 'region'}`; }
    if (role === 'history') { return `${placement.rid}.${RegionWorks.history(part, region)}`; }
    const bound = placement.bindings[role];
    if (!bound) { throw new Error(`Scenario reference ${value} names no bound place`); }
    return `${placement.rid}.${part ? `${bound}_${part}` : bound}`;
  }
  static requests(entry: Entry, placement: Placement, base: BundleSource,
    at: { context: Record<string, DeemValue>; region?: Region }): BundleRequest[] {
    return entry.manifest.modules.filter(m => !m.when || placement.bindings[m.when]).map((m, i) => ({
      id: placement.modules[i]!, bundle: base.resolve(m.bundle, entry.path),
      imports: Object.fromEntries(Object.entries(m.imports)
        .map(([name, value]) => [name, this.ref(value, placement, at.region)])),
      // Each a chapter of the book, as a country beyond a march is: an Ending of its own closes its story, not the
      // book (WPC-X06).
      context: { ...at.context, ...m.context }, chapter: true }));
  }
  // What has made its den at a placement's first site, by the country it stands in (see RegionEcology): told to its
  // modules, which use it (a den does) or not.
  static wild(placement: Placement, region: Region): Record<string, DeemValue> {
    const site = region.sites.find(w => Object.values(placement.bindings).includes(w.id));
    const seat = site && RegionGeography.seats(region).find(x => x.site === site);
    const habitat = site && RegionEcology.habitat(region, site, seat?.form?.form);
    const found = site && RegionEcology.den(region, habitat!);
    const beast = found && RegionEcology.variant(site, found, { habitat: habitat!, region });
    return beast ? { beast: beast.species, beastCount: beast.count, beastLabel: beast.label, beastRole: beast.role,
      beastNature: beast.nature, ...beast.aspect ? { beastAspect: beast.aspect } : {},
      ...beast.template ? { beastTemplate: beast.template } : {},
      ...beast.variations ? { beastVariations: beast.variations } : {} } : {};
  }
}
