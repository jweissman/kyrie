import { Memorials, type Memorial } from './memorial';
import { RegionGrowth } from './region-growth';
import type { DeemValue } from 'deem';
import { Content, type CreatureGenerationContext } from '../content';
import { RandomStreams } from '../random-streams';
import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { Overlays } from '../overlays';
import { PlaceNames } from './place-names';
import { RegionPeoples } from './region-peoples';
import { RegionEcology } from './region-ecology';
import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import { RegionRecruits } from './region-recruits';
import { Countries } from './countries';
import { RegionWriter, type Carrier, type Company, type Contact, type Region, type Site } from './region-writer';
import { SettlementWriter } from './settlement-writer';
import { ScenarioTowns } from './scenario-towns';
import { Origins } from './origins';
import type { KitEntry } from './compose/composition';
import { Atlases } from './land/atlas';
import { Histories } from './history/histories';
import { WorldGrid } from './world-grid';
import { Livelihoods } from './livelihoods';
import './region-works';

// A scenario a generated region may include: where it belongs, the places it needs, its modules and bindings, the
// way in that stays hidden until someone hears of it, and what people say about it.
export interface ScenarioManifest {
  version: 1; id: string; name: string; instances?: number; weight?: number;
  // An adventure in a wild place (the default) or what is going on in a settlement (town).
  kind?: 'adventure' | 'town';
  context?: Record<string, string[]>;
  // A place a scenario needs: a site of some kind, a settlement (near:role, any, or the first), or the stretch of road
  // out of a settlement (near:role).
  places: Record<string, { site?: string[]; settlement?: string; way?: string }>;
  modules: { id: string; bundle: string; imports: Record<string, string>; context?: Record<string, DeemValue> }[];
  route?: string;
  // A hook is a fact the scenario establishes (module.export) that people pass on through some channels; unless it
  // `opens: false`, hearing it reveals the way in.
  hooks?: { fact: string; topic: string; channels: Carrier['channel'][]; opens?: boolean }[];
}
export interface Placement {
  scenario: string; instance: string; bindings: Record<string, string>; generated: string[];
  modules: string[]; carriers: Record<string, string[]>;
  // The region module it is set in (see WorldGrid): "region" for the first.
  rid: string;
}
export interface WorldReport {
  seed: string; region: Region; context: Record<string, string>;
  eligibility: { scenario: string; fits: boolean; why?: string }[]; placements: Placement[]; contacts: Contact[];
}
export interface Entry { path: string; manifest: ScenarioManifest }

// Builds a playable campaign from a seed: Deem generates the region; scenarios are selected by the contexts they
// declare (a Deem select over the library); each is bound to the region's places, given any sites it needs, and
// spread by word of mouth. The result is an ordinary campaign manifest over generated and authored modules.
export class WorldAssembler {
  static readonly speakers: Record<Carrier['channel'], string> = { tavern: 'innkeeper', road: 'traveller',
    temple: 'priest', market: 'merchant' };
  static readonly heard: Record<Carrier['channel'], string> = { road: 'News from the roads reaches them first.',
    tavern: 'They hear everything said across their tables.', temple: 'The faithful bring them their troubles.',
    market: 'Traders tell them what they have seen.' };
  static readonly party: CreatureGenerationContext[] = [
    { name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
    { name: 'Bran', raceId: 'human', classId: 'warrior', backgroundId: 'locksmith', traits: ['toughness'] },
    { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'medic', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'] }];
  static async assemble(seed: string, base: BundleSource, options: {
    library?: string; scenarios?: number; towns?: number; region?: Record<string, DeemValue>;
    party?: CreatureGenerationContext[]; origin?: string;
    framework?: string | null;
    // Someone who died in this country before: where they lie, and how they died, which the country remembers.
    memorial?: Memorial;
  } = {}): Promise<{ path: string; source: BundleSource; report: WorldReport }> {
    const region = this.region(seed, [0, 0], options.region);
    const days = new Expressions(RandomStreams.key(seed, 'world', 'calendar'));
    region.calendar = { year: 1290 + days.number('1d40'), month: days.number('1d12'), day: days.number('1d30') };
    const library = await this.library(base, options.library ?? 'data/scenarios/library.json');
    const { context, eligibility, placements } = this.settle(region, library,
      { seed, rid: RegionWriter.id, rounds: [options.scenarios ?? 3, options.towns ?? 2], exclude: [] });
    // One protagonist, with an origin in this world; or a company, each with an old acquaintance somewhere in it.
    const origin = options.origin ? (await Origins.load(base)).find(o => o.manifest.id === options.origin) : undefined;
    const party = origin ? [Origins.member(origin.manifest, (options.party ?? this.party)[0]!)]
      : options.party ?? this.party;
    const contacts = origin ? [] : this.contacts(region, party, seed);
    const slug = seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'world', root = `world-${slug}`;
    const files: Record<string, string> = {};
    const modules: BundleRequest[] = [{ id: RegionWriter.id, bundle: base.resolve(`${root}/region/module.json`) }];
    this.spread(placements, { library, base, region, contacts, context, files, root, modules });
    const told = origin && Origins.write(origin, { region, placements, protagonist: party[0]!.name ?? 'you', root, files });
    if (told) { modules.push(told.request); }
    else { this.arrival(region, { size: party.length, contacts }, { files, root, modules }); }
    const path = base.resolve(`${root}.campaign.json`);
    const framework = options.framework === null ? [] : await this.framework(base, options.framework ?? this.frontier);
    this.write(region, { files, root, placements, company: { size: party.length, contacts,
      ...told ? { start: told.start, coin: told.coin } : {} } });
    if (options.memorial) { Memorials.remember(options.memorial, files, `${root}/region`); }
    const kits = framework.map(k => ({ ...k, optional: true }));
    files[path] = JSON.stringify({ version: 1, name: region.name, modules: [...modules, ...kits], party,
      calendar: region.calendar,
      pitch: { heading: `A company in ${region.name}`, text: `${region.name} is ${RegionWriter.terrain(region.terrain)} `
        + `country, home to ${RegionWriter.peoples(region)}, who keep the faith of ${region.deity}. Nobody hires a `
        + 'company for nothing: listen in the taprooms, at the shrines and on the roads, and go where the trouble is. '
        + 'Choose three companions.' } });
    return { path, source: new OverlayBundleSource(base, files),
      report: { seed, region, context, placements, contacts,
        eligibility: library.map((e, i) => ({ scenario: e.manifest.id, ...eligibility[i]! })) } };
  }
  // The country beyond a border, drawn the first time a company goes there (see Frontier): a region of its own where
  // it lies in the world, with its own scenarios (none placed anywhere already), and no company of its own. The
  // names of the regions already drawn on either side are as they are, not as they would have been drawn; its works
  // are named apart from the works already drawn (`taken`).
  static async beyond(seed: string, base: BundleSource, at: { x: number; y: number; calendar?: Region['calendar'];
    exclude: string[]; named?: Region['beyond']; taken?: string[] }):
    Promise<{ requests: BundleRequest[]; source: BundleSource; region: Region }> {
    const rid = WorldGrid.id(at.x, at.y), region = this.region(seed, [at.x, at.y], undefined, at.taken);
    region.beyond = { ...region.beyond, ...at.named }; region.calendar = at.calendar;
    const library = await this.library(base, 'data/scenarios/library.json');
    const { context, placements } = this.settle(region, library,
      { seed: WorldGrid.seed(seed, at.x, at.y), rid, rounds: [3, 2], exclude: at.exclude });
    const root = `world-${seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'world'}/${rid}`;
    const files: Record<string, string> = {};
    const modules: BundleRequest[] = [{ id: rid, bundle: base.resolve(`${root}/region/module.json`),
      imports: { party: `${RegionWriter.id}.party` } }];
    this.spread(placements, { library, base, region, contacts: [], context, files, root, modules });
    RegionWriter.write(files, root, region, { company: null, taken: this.taken(placements), beyond: true });
    return { requests: modules, source: new OverlayBundleSource(base, files), region };
  }
  // A region where it lies in its world, from its own seed: drawn by Deem, laid on its land, named and peopled.
  private static region(seed: string, at: [number, number], drawn?: Record<string, DeemValue>, taken: string[] = []):
    Region {
    const own = WorldGrid.seed(seed, ...at);
    const d = WorldGrid.drawn(seed, ...at, drawn);
    const region = { ...PlaceNames.render(RegionPeoples.settle(this.lay(d, own, seed, taken), RandomStreams.key(own, 'world'))),
      at, beyond: WorldGrid.beyond(seed, at) };
    // The first country knows what authored country lies beyond it; one drawn later is told by the frontier.
    return at[0] === 0 && at[1] === 0 ? { ...region, beyond: Countries.beyond(region) } : region;
  }
  // The scenarios a region is given: adventures in the wild places first, then what is going on in the
  // settlements; none placed elsewhere in the world already.
  private static settle(region: Region, library: Entry[], at: { seed: string; rid: string; rounds: [number, number];
    exclude: string[] }) {
    const context = { terrain: region.terrain, ancestry: region.ancestry, domain: region.domain };
    const eligibility = library.map(e => this.fits(e.manifest, context, region));
    const placements: Placement[] = [], claimed = new Set<string>();
    const count = new Map<string, number>(at.exclude.map(id => [id, Infinity]));
    for (const [kind, rounds] of [['adventure', at.rounds[0]], ['town', at.rounds[1]]] as const) {
      for (let round = 0; round < rounds; round++) {
        const open = library.filter((e, i) => (e.manifest.kind ?? 'adventure') === kind && eligibility[i]!.fits
          && (count.get(e.manifest.id) ?? 0) < (e.manifest.instances ?? 1)
          && this.placeable(e.manifest, region, claimed));
        const chosen = this.choose(open, context, RandomStreams.key(at.seed, 'world', kind === 'town' ? 'town' : 'scenario', round));
        if (!chosen) { break; }
        const n = (count.get(chosen.manifest.id) ?? 0) + 1;
        count.set(chosen.manifest.id, n);
        placements.push(this.place(chosen.manifest, { n, region, claimed, seed: at.seed, rid: at.rid }));
      }
    }
    return { context, eligibility, placements };
  }
  // Each placement's modules, and the module that spreads word of it.
  private static spread(placements: Placement[], at: { library: Entry[]; base: BundleSource; region: Region;
    contacts: Contact[]; context: Record<string, string>; files: Record<string, string>; root: string;
    modules: BundleRequest[] }) {
    const { library, base, region, context, files, root, modules } = at;
    placements.forEach((placement, i) => {
      const entry = library.find(e => e.manifest.id === placement.scenario)!;
      modules.push(...this.requests(entry, placement, base, { ...context, ...this.wild(placement, region),
        ...this.folk(placement, region) }));
      const word = this.word(entry.manifest, placement, { region, contacts: at.contacts });
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
  static lay(drawn: Region, seed: string, world = seed, taken: string[] = []): Region {
    const atlas = Atlases.make(RandomStreams.key(seed, 'world', 'land'), drawn.terrain,
      { tongue: PlaceNames.tongues[drawn.ancestry] ?? 'westron', taken: [drawn.name] });
    const region = RegionRecruits.distinct(Livelihoods.seat(drawn, atlas, seed), seed);
    const history = Histories.make(RandomStreams.key(seed, 'world', 'history'), drawn.terrain, atlas,
      { world: RandomStreams.key(world, 'world', 'history'), taken });
    // The region's sites are its makers' works, where their art put them.
    region.history = history;
    region.sites = history.works.map(w => ({ id: w.id, kind: Histories.plan(w.plan).kind, name: w.worn, hours: 1,
      gloss: w.old.gloss, tongue: w.old.tongue, cell: w.cell, ...w.zone ? { zone: w.zone, part: w.part } : {},
      work: { plan: w.plan, art: w.art, ...w.great ? { great: true } : {} } }));
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
  // Why the company came, written as a module of its own (see RegionRecruits.arrival).
  private static arrival(region: Region, company: { size: number; contacts: Contact[] },
    at: { files: Record<string, string>; root: string; modules: BundleRequest[] }) {
    const arrival = RegionRecruits.arrival(region, company);
    if (!arrival) { return; }
    at.files[`${at.root}/arrival/module.json`] = JSON.stringify(arrival.manifest);
    at.files[`${at.root}/arrival/arrival.kyr`] = arrival.source;
    at.modules.push({ id: 'arrival', bundle: `${at.root}/arrival/module.json`, imports: arrival.imports });
  }
  static readonly frontier = 'data/frameworks/frontier.json';
  // Writes the region, its module and its manifest. The framework's kits are composed against it as the campaign
  // loads: wild country gives a kit the places off the roads it wants, and one refused all the same is left out of the
  // world (they are optional there), the trace saying why.
  private static write(region: Region, at: { files: Record<string, string>; root: string; placements: Placement[];
    company: Company }) {
    RegionWriter.write(at.files, at.root, region, { company: at.company, taken: this.taken(at.placements) });
  }
  // A framework's kits, with their paths made absolute, to be composed into the campaign when it loads.
  private static async framework(base: BundleSource, file: string): Promise<KitEntry[]> {
    const path = base.resolve(file), framework = JSON.parse(await base.read(path)) as { kits: KitEntry[] };
    return framework.kits.map(k => ({ ...k, kit: base.resolve(k.kit, path) }));
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
  static async library(base: BundleSource, index: string): Promise<Entry[]> {
    const path = base.resolve(index);
    const list = JSON.parse(await base.read(path)) as { scenarios: string[] };
    return Promise.all(list.scenarios.map(async file => {
      const at = base.resolve(file, path);
      return { path: at, manifest: JSON.parse(await base.read(at)) as ScenarioManifest };
    }));
  }
  // Context fit, decided by the same Deem selection the assembler uses, and whether its sites can exist here.
  private static fits(s: ScenarioManifest, context: Record<string, string>, region: Region) {
    if (!this.choose([{ path: '', manifest: s }], context, 'fit')) {
      const wants = Object.entries(s.context ?? {}).map(([k, v]) => `${k} ${v.join('/')}`).join(', ');
      return { fits: false, why: `wants ${wants}` };
    }
    return this.placeable(s, region, new Set()) ? { fits: true } : { fits: false, why: 'no site it needs can stand here' };
  }
  // One weighted pick among scenarios whose declared contexts include the region's: a Deem select over a table.
  private static choose(open: Entry[], context: Record<string, string>, seed: string): Entry | undefined {
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
    } catch { return undefined; }
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
      return { ...site, id: `w${region.sites.length + 1}` };
    } catch { return undefined; }
  }
  // Binds each place a scenario needs: a free region site of a kind it accepts (or a newly generated one), or the
  // settlement nearest one of those sites.
  private static place(s: ScenarioManifest,
    at: { n: number; region: Region; claimed: Set<string>; seed: string; rid: string }): Placement {
    const { n, region, claimed, seed } = at, prefix = this.prefix(at.rid);
    const instance = `${prefix}${s.id.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`, bindings: Record<string, string> = {};
    const generated: string[] = [];
    for (const [role, need] of Object.entries(s.places)) {
      if (need.site) {
        // A scenario takes a site of its own, never one of the makers' works, which are whole already.
        let site = need.site.map(kind => region.sites.find(w => w.kind === kind && !claimed.has(w.id) && !w.work))
          .find(Boolean);
        if (!site) {
          const key = RandomStreams.key(seed, 'world', 'site', instance, role);
          site = PlaceNames.another(region, need.site.map(kind => this.newSite(region, kind, key)).find(Boolean)!, key);
          this.situate(region, site, RandomStreams.key(seed, 'world', 'spot', instance, role));
          region.sites.push(site); generated.push(site.id);
        }
        claimed.add(site.id); bindings[role] = site.id;
      } else if (need.settlement) {
        bindings[role] = ScenarioTowns.town(need.settlement, { region, bindings, claimed,
          parts: ScenarioTowns.parts(s, role), key: RandomStreams.key(seed, 'world', 'town', instance, role) });
      } else if (need.way) {
        // The road out of the settlement, by the water if one runs by water: what happens on a road by a stream
        // (a cart in the ditch, willows for a fever) is where people say it is.
        const town = bindings[need.way.replace(/^near:/, '')];
        const roads = RegionGeography.roads(region).filter(r => r.from.id === town || r.to.id === town);
        const road = roads.find(r => RegionGrowth.habitats(region, r.route.cells).has('riverbank')) ?? roads[0];
        if (road) { bindings[role] = road.way; }
      }
    }
    return { scenario: s.id, instance, bindings, generated, carriers: {}, rid: at.rid,
      modules: s.modules.map(m => `${prefix}${this.install(m.id, n)}`) };
  }
  private static install(module: string, n: number): string {
    return `${module.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}`;
  }
  // A scenario reference: @party, @region, @role, @role.part (a settlement's green, a site's track or the country it
  // stands in…), module.export.
  private static ref(value: string, placement: Placement): string {
    if (!value.startsWith('@')) {
      const [module, name] = value.split('.') as [string, string];
      return `${this.prefix(placement.rid)}${this.install(module, Number(placement.instance.match(/\d+$/)?.[0] ?? 1))}.${name}`;
    }
    const [role, part] = value.slice(1).split('.') as [string, string | undefined];
    if (role === 'party') { return `${RegionWriter.id}.party`; }
    if (role === 'region') { return `${placement.rid}.region`; }
    const bound = placement.bindings[role];
    if (!bound) { throw new Error(`Scenario reference ${value} names no bound place`); }
    return `${placement.rid}.${part ? `${bound}_${part}` : bound}`;
  }
  private static requests(entry: Entry, placement: Placement, base: BundleSource,
    context: Record<string, DeemValue>): BundleRequest[] {
    return entry.manifest.modules.map((m, i) => ({ id: placement.modules[i]!,
      bundle: base.resolve(m.bundle, entry.path),
      imports: Object.fromEntries(Object.entries(m.imports).map(([name, value]) => [name, this.ref(value, placement)])),
      context: { ...context, ...m.context } }));
  }
  // The people of the settlement a placement is set in, for its modules to name their own people by.
  private static folk(placement: Placement, region: Region): Record<string, DeemValue> {
    const town = region.settlements.find(t => Object.values(placement.bindings).includes(t.id));
    return town ? { folk: town.folk ?? region.ancestry, townName: town.name } : {};
  }
  // What has made its den at a placement's first site, by the country it stands in (see RegionEcology): told to its
  // modules, which use it (a den does) or not.
  private static wild(placement: Placement, region: Region): Record<string, DeemValue> {
    const site = region.sites.find(w => Object.values(placement.bindings).includes(w.id));
    const seat = site && RegionGeography.seats(region).find(x => x.site === site);
    const habitat = site && RegionEcology.habitat(region, site, seat?.form?.form);
    const found = site && RegionEcology.den(region, habitat!);
    const beast = found && RegionEcology.variant(site, found, habitat!);
    return beast ? { beast: beast.species, beastCount: beast.count, beastLabel: beast.label, beastRole: beast.role,
      beastNature: beast.nature, ...beast.aspect ? { beastAspect: beast.aspect } : {},
      ...beast.template ? { beastTemplate: beast.template } : {} } : {};
  }
  // A hook's topic as a stranger would say it, with each place it names as it looks: "trouble at the fallen walls".
  private static plainly(text: string, placement: Placement, region: Region): string {
    return text.replace(/\{(\w+)\}/g, (whole, role: string) => {
      const id = placement.bindings[role], seat = RegionGeography.seats(region).find(x => x.site.id === id);
      return seat ? RegionSites.seenAs(seat, region) : region.settlements.find(t => t.id === id)?.name ?? whole;
    });
  }
  // A hook's topic names the places it is about by role: {den} becomes a reference to the bound place, so it is said
  // as the company knows it (a grassed mound, until someone names it).
  private static named(text: string, placement: Placement,
    at: { lines: string[]; imports: Record<string, string>; declared: Set<string> }): string {
    return text.replace(/\{(\w+)\}/g, (whole, role: string) => {
      const id = placement.bindings[role];
      if (!id) { return whole; }
      const local = `at_${role}`;
      if (!at.declared.has(local)) {
        at.lines.push(`  Place ${local} "Where it is" is room.`);
        at.imports[local] = `${placement.rid}.${id}`; at.declared.add(local);
      }
      return `{${local}}`;
    });
  }
  // The module that spreads word of a placed scenario: each hook is an established fact, known to carriers in the
  // settlement nearest it and its neighbour along the road, offered as something to ask about; any of them reveals
  // the way in.
  private static word(s: ScenarioManifest, placement: Placement, at: { region: Region; contacts: Contact[] }) {
    const { region, contacts } = at;
    const hooks = s.hooks ?? [];
    if (!hooks.length && !s.route) { return undefined; }
    const q = JSON.stringify;
    const firstSite = Object.entries(s.places).find(([, p]) => p.site)?.[0];
    const site = region.sites.find(w => w.id === placement.bindings[firstSite ?? '']);
    const home = site ? RegionWriter.near(region, site)
      : region.settlements.find(t => Object.values(placement.bindings).includes(t.id)) ?? region.settlements[0]!;
    // Word goes from the settlement nearest the trouble to its neighbour along the road.
    const road = RegionGeography.roads(region).find(r => r.from.id === home.id || r.to.id === home.id);
    const towns = [home, road ? (road.from.id === home.id ? road.to : road.from)
      : region.settlements[(region.settlements.indexOf(home) + 1) % region.settlements.length]!];
    const imports: Record<string, string> = { party: `${RegionWriter.id}.party` }, lines: string[] = [];
    lines.push(`Module word_${placement.instance} ${q(`Word of ${s.name}`)} {`, '  Entity party: group "Your company".');
    // Local names are prefixed so they cannot shadow a rule's parameter names (site, way…).
    if (s.route) { lines.push('  Entity route_in: passage "The way in".'); imports.route_in = this.ref(s.route, placement); }
    const carriers = new Set<string>();
    for (const [index, hook] of hooks.entries()) {
      const fact = `h${index + 1}`;
      lines.push(`  Entity ${fact}: fact "What people say".`);
      imports[fact] = this.ref(hook.fact, placement);
      if (s.route && hook.opens !== false) { lines.push(`  Initially Assert revealedBy(route_in, ${fact}).`); }
      // Carriers in the towns nearest the scenario, and members' contacts anywhere who hear that kind of news.
      const tellers = new Map<string, string>();
      for (const town of new Set(towns)) {
        for (const channel of hook.channels) {
          tellers.set(`${town.id}_${this.speakers[channel]}`, SettlementWriter.standing(region, town, this.speakers[channel] as 'innkeeper'));
        }
      }
      for (const c of contacts.filter(c => hook.channels.includes(c.channel))) {
        tellers.set(c.carrier, c.room);
        c.concern ??= this.plainly(hook.topic, placement, region);
      }
      for (const [carrier, room] of tellers) {
        const topic = `${fact}_${carrier}`;
        if (!carriers.has(carrier)) {
          lines.push(`  Entity ${carrier}: group "Someone".`); carriers.add(carrier);
          if (!carriers.has(room)) { lines.push(`  Place ${room} "Where they are" is room.`); carriers.add(room); }
        }
        imports[carrier] = `${placement.rid}.${carrier}`; imports[room] = `${placement.rid}.${room}`;
        lines.push(`  Entity ${topic}: source ${q(this.named(hook.topic, placement, { lines, imports, declared: carriers }))}.`,
          `  Initially Assert knows(${carrier}, ${fact}). Initially Assert testimony(${carrier}, ${topic}).`,
          `  Initially Assert reveals(${topic}, ${fact}). Initially Assert noticeable(${topic}).`,
          `  Initially Assert at(${topic}, ${room}).`);
        (placement.carriers[hook.fact] ??= []).push(carrier);
      }
    }
    lines.push('  Goal false.', '}');
    const names = Object.keys(imports);
    const types = Object.fromEntries(names.map(n => [n, { type: n === 'party' ? 'group' : n === 'route_in' ? 'passage'
      : /^h\d+$/.test(n) ? 'fact' : /_(taproom|shrine|shop|green)$|^at_/.test(n) ? 'place' : 'group' }]));
    return { source: lines.join('\n'), imports,
      manifest: { version: 1, source: 'word.kyr', rules: ['world'], globals: ['party'], imports: names, roles: types } };
  }
}
