import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import type { CreatureGenerationContext } from '../content';
import type { Company, Region, Settlement } from './region-writer';
import type { Placement } from './world-assembler';
import { RegionFaith } from './region-faith';
import { Foundings } from './founding';
import { RegionSites } from './region-sites';
import { RegionGeography } from './region-geography';
import tables from '../../data/origins/tables.json';
import arrivals from '../../data/origins/wanderer/arrivals.json';

// Why one person has come into a generated country, and who and what there already concerns them: a father who did
// not come home, a debt, an errand for an order, a sick child who needs what they carry. Each origin is a module of
// its own (data/origins/<id>), written against the world it is set in. It binds to people and places the world already
// holds: the drover's family becomes the protagonist's own, a merchant their creditor, a priest the one expecting
// them. It begins the game where the origin says, and states the relationship as facts the world goes on answering.
export interface OriginManifest {
  id: string; title: string; binder: string; source: string; choice: string;
  background?: string; coin?: number; gear?: string[];
  // What seeing it through is worth (the debt paid, the copy shown): it was nothing (the play-structure
  // investigation's PT-04).
  experience?: number;
}
// An origin as the creation page offers it; with the background it makes the protagonist, if it makes one.
export interface OriginChoice { id: string; title: string; choice: string; background?: string }
// What an origin is bound to in one world: the words its text is filled with, the entities it imports (with their
// types), and where the protagonist begins.
interface Bound { values: Record<string, string>; imports: Record<string, [string, string]>; start: Start }
type Start = NonNullable<Company['start']>;
interface Loaded { manifest: OriginManifest; source: string }

export class Origins {
  static readonly library = 'data/origins/library.json';
  static async load(base: BundleSource): Promise<Loaded[]> {
    const index = base.resolve(this.library);
    const list = JSON.parse(await base.read(index)) as { origins: string[] };
    return Promise.all(list.origins.map(async file => {
      const at = base.resolve(file, index), manifest = JSON.parse(await base.read(at)) as OriginManifest;
      return { manifest, source: await base.read(base.resolve(manifest.source, at)) };
    }));
  }
  // The origins this world can hold, said as the creation page offers them.
  static choices(loaded: Loaded[], region: Region, placements: Placement[]): OriginChoice[] {
    return loaded.flatMap(o => {
      const bound = this.bind(o.manifest.binder, region, placements);
      return bound ? [{ id: o.manifest.id, title: o.manifest.title, choice: this.fill(o.manifest.choice, bound.values),
        ...o.manifest.background ? { background: o.manifest.background } : {} }] : [];
    });
  }
  // The protagonist as the origin makes them: its background (what they know how to do), which is what its story
  // says they are (a scribe of the order reads the old script), and what they carry. One that makes them nothing in
  // particular keeps the trade they chose.
  static member(origin: OriginManifest, member: CreatureGenerationContext): CreatureGenerationContext {
    return { ...member, ...origin.background ? { backgroundId: origin.background } : {},
      ...origin.gear ? { gear: [...member.gear ?? [], ...origin.gear] } : {} };
  }
  // The origin's module, written against this world, for the campaign to install after the region.
  static write(o: Loaded, at: { region: Region; placements: Placement[]; protagonist: string; root: string;
    files: Record<string, string> }): { request: BundleRequest; start: Start; coin: number } | undefined {
    const bound = this.bind(o.manifest.binder, at.region, at.placements);
    if (!bound) { return undefined; }
    const values = { ...bound.values, protagonist: Origins.said(at.protagonist) };
    const names = Object.keys(bound.imports), dir = `${at.root}/origin`;
    at.files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: 'origin.kyr', rules: ['world'],
      globals: ['party'], imports: ['party', ...names], ...o.manifest.experience ? { experience: o.manifest.experience } : {},
      roles: Object.fromEntries([['party', { type: 'group' }], ...names.map(n => [n, { type: bound.imports[n]![1] }])]) });
    at.files[`${dir}/origin.kyr`] = this.fill(o.source, values);
    return { request: { id: 'origin', bundle: `${dir}/module.json`,
      imports: { party: 'region.party', ...Object.fromEntries(names.map(n => [n, bound.imports[n]![0]])) } },
    start: bound.start, coin: o.manifest.coin ?? 10 };
  }
  // A name as it can stand in the module's text: no braces (which would name an entity, or be filled again as a
  // template word) and its quotes and backslashes escaped (Wen"na and {creditor} broke Begin: the architecture
  // review's A12).
  static said(name: string): string { return name.replace(/[{}]/g, '').replace(/["\\]/g, '\\$&'); }
  // Template words are filled in before the module is read; anything else in braces is the module's own.
  private static fill(text: string, values: Record<string, string>): string {
    let out = text;
    for (let pass = 0; pass < 2; pass++) {
      out = out.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
    }
    return out;
  }
  private static bind(binder: string, region: Region, placements: Placement[]): Bound | undefined {
    switch (binder) {
      case 'kin': return this.kin(region, placements);
      case 'debt': return this.debt(region);
      case 'herbs': return this.herbs(region, placements);
      case 'order': return this.order(region);
      case 'wanderer': return this.wanderer(region, placements);
      default: return undefined;
    }
  }
  private static placed(placements: Placement[], scenario: string): Placement | undefined {
    return placements.find(p => p.scenario === scenario && p.rid === 'region');
  }
  // How someone comes into a settlement, by its country; and what its trade looks like from the road.
  private static approach(region: Region, s: Settlement): Record<string, string> {
    const a = this.way(region);
    const trade = (tables.trade as Record<string, string>)[s.trade] ?? 'smoke from the chimneys';
    // What is seen of it from the road is what made it: masts at a harbour, the brothers' wall, a fort's gate-tower.
    const sight = Foundings.table.foundings[Foundings.of(region, region.settlements.indexOf(s)).kind].sight;
    return { scene: a.scene.replace('{home}', s.name).replace('{trade}', trade).replace('{sight}', sight), home: s.name,
      homename: s.name, region: region.name };
  }
  private static way(region: Region): { name: string; way: string; scene: string } {
    return (tables.approach as Record<string, { name: string; way: string; scene: string }>)[region.terrain]
      ?? tables.approach.forest;
  }
  // Beginning on the way into a settlement, which the region writes for the protagonist.
  private static arriving(region: Region, s: Settlement): { start: Start; approach: [string, string] } {
    const a = this.way(region);
    return { start: { place: `${s.id}_approach`, approach: { settlement: s.id, name: a.name.replace('{home}', s.name),
      way: a.way } }, approach: [`region.${s.id}_approach`, 'place'] };
  }
  private static home(region: Region, id: string): Settlement | undefined {
    return region.settlements.find(s => s.id === id);
  }
  private static kin(region: Region, placements: Placement[]): Bound | undefined {
    const p = this.placed(placements, 'drover'), s = p && this.home(region, p.bindings.town ?? '');
    if (!p || !s) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: this.approach(region, s), start, imports: { approach, home: [`region.${s.id}`, 'place'],
      wife: [`${p.instance}.wife`, 'group'], son: [`${p.instance}.son`, 'group'], missing: [`${p.instance}.missing`, 'fact'] } };
  }
  private static debt(region: Region): Bound | undefined {
    const s = region.settlements.find(t => t.size === 'town') ?? region.settlements[0];
    if (!s) { return undefined; }
    return { values: { ...this.approach(region, s), merchant: s.merchant,
      lost: (tables.lost as Record<string, string>)[s.trade] ?? 'a cartload of goods' },
    start: { place: `${s.id}_shop` }, imports: { shop: [`region.${s.id}_shop`, 'place'],
      creditor: [`region.${s.id}_merchant`, 'group'] } };
  }
  private static herbs(region: Region, placements: Placement[]): Bound | undefined {
    const p = this.placed(placements, 'fever'), s = p && this.home(region, p.bindings.town ?? '');
    const sender = region.settlements.find(t => t.id !== s?.id);
    if (!p || !s || !sender) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: { ...this.approach(region, s), sender: sender.name }, start,
      imports: { approach, mother: [`${p.instance}.mother`, 'group'] } };
  }
  // An order's errand: the old writing at the first of the makers' works that has some, and the priest of the town
  // nearest the order's road (the region's town).
  private static order(region: Region): Bound | undefined {
    const s = region.settlements.find(t => t.size === 'town') ?? region.settlements[0];
    const history = region.history, makers = history?.makers[0];
    const works = region.sites.filter(w => w.work && !w.work.great && w.work.art === makers?.art);
    const work = s && this.nearest(region, s, works);
    if (!s || !makers || !work) { return undefined; }
    const cult = RegionFaith.cults(region)[region.settlements.indexOf(s)]!;
    const seat = RegionGeography.seats(region).find(x => x.site === work)!;
    const where = RegionSites.where(seat, region);
    const holy = Foundings.holyPlace(region, s);
    return { values: { ...this.approach(region, s), work: work.name, cult: cult.name, where }, start: { place: holy },
      imports: { shrine: [`region.${holy}`, 'place'],
        priest: [`region.${s.id}_priest`, 'group'], named: [`region.${work.id}_named`, 'fact'],
        found: [`region.${work.id}_found`, 'fact'], history: [`region.history_${makers.art}`, 'fact'],
        fate: [`region.history_${makers.art}_fate`, 'fact'] } };
  }
  // Of the makers' works, the nearest the town the errand is told in: the first drawn had been fifteen hours off, which
  // the priest's "Go in daylight" could not mean (play 11).
  private static nearest(region: Region, s: Settlement, works: Region['sites']): Region['sites'][number] | undefined {
    return [...works].sort((a, b) => this.away(region, s, a) - this.away(region, s, b))[0];
  }
  private static away(region: Region, s: Settlement, w: Region['sites'][number]): number {
    const [x, y] = RegionGeography.spot(region, s.cell!), [a, b] = RegionGeography.spot(region, w.cell!);
    return Math.hypot(a - x, b - y);
  }
  // One who comes over the hills arrives as something is happening: the first of the town's troubles that has an
  // arrival (data/origins/wanderer/arrivals.json), seen on the way in; having seen it, they know what the trouble is.
  private static wanderer(region: Region, placements: Placement[]): Bound | undefined {
    const s = region.settlements[0];
    if (!s) { return undefined; }
    const { start, approach } = this.arriving(region, s), values = this.approach(region, s);
    const met = arrivals.arrivals.map(a => ({ a, p: placements.find(p => p.scenario === a.scenario && p.rid === 'region'
      && p.bindings.town === s.id) })).find(x => x.p);
    if (!met) { return { values: { ...values, incident: '' }, start, imports: { approach } }; }
    const text = JSON.stringify(this.fill(met.a.text, { home: s.name }));
    return { values: { ...values, incident: `  Entity trouble: fact "What is the matter here". Initially Assert knows(party, trouble).\n`
      + `  Observe incident at approach as feature when watch(clock) < 1 ${text}.` },
      start, imports: { approach, trouble: [this.fact(met.a.fact, met.p!), 'fact'] } };
  }
  // A scenario's fact (module.fact, as its hooks name it) where the placement installed it: its modules take their
  // own ids, numbered after the first instance (as WorldAssembler installs them).
  private static fact(ref: string, p: Placement): string {
    const [module, name] = ref.split('.') as [string, string], n = Number(p.instance.match(/\d+$/)?.[0] ?? 1);
    return `${module.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}.${name}`;
  }
}
