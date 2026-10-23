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

// Why one person has come into a generated country, and who and what there already concerns them: a father who did
// not come home, a debt, an errand for an order, a sick child who needs what they carry. Each origin is a module of
// its own (data/origins/<id>), written against the world it is set in. It binds to people and places the world already
// holds: the drover's family becomes the protagonist's own, a merchant their creditor, a priest the one expecting
// them. It begins the game where the origin says, and states the relationship as facts the world goes on answering.
export interface OriginManifest {
  id: string; title: string; binder: string; source: string; choice: string;
  background?: string; coin?: number; gear?: string[];
}
export interface OriginChoice { id: string; title: string; choice: string }
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
      return bound ? [{ id: o.manifest.id, title: o.manifest.title,
        choice: this.fill(o.manifest.choice, bound.values) }] : [];
    });
  }
  // The protagonist as the origin makes them: its background (what they know how to do) and what they carry.
  static member(origin: OriginManifest, member: CreatureGenerationContext): CreatureGenerationContext {
    return { ...member, ...origin.background && !member.backgroundId ? { backgroundId: origin.background } : {},
      ...origin.gear ? { gear: [...member.gear ?? [], ...origin.gear] } : {} };
  }
  // The origin's module, written against this world, for the campaign to install after the region.
  static write(o: Loaded, at: { region: Region; placements: Placement[]; protagonist: string; root: string;
    files: Record<string, string> }): { request: BundleRequest; start: Start; coin: number } | undefined {
    const bound = this.bind(o.manifest.binder, at.region, at.placements);
    if (!bound) { return undefined; }
    const values = { ...bound.values, protagonist: at.protagonist };
    const names = Object.keys(bound.imports), dir = `${at.root}/origin`;
    at.files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: 'origin.kyr', rules: ['world'],
      globals: ['party'], imports: ['party', ...names],
      roles: Object.fromEntries([['party', { type: 'group' }], ...names.map(n => [n, { type: bound.imports[n]![1] }])]) });
    at.files[`${dir}/origin.kyr`] = this.fill(o.source, values);
    return { request: { id: 'origin', bundle: `${dir}/module.json`,
      imports: { party: 'region.party', ...Object.fromEntries(names.map(n => [n, bound.imports[n]![0]])) } },
    start: bound.start, coin: o.manifest.coin ?? 10 };
  }
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
      case 'wanderer': return this.wanderer(region);
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
    const work = region.sites.find(w => w.work && !w.work.great && w.work.art === makers?.art);
    if (!s || !makers || !work) { return undefined; }
    const cult = RegionFaith.cults(region)[region.settlements.indexOf(s)]!;
    const seat = RegionGeography.seats(region).find(x => x.site === work)!;
    const where = RegionSites.where(seat, region);
    return { values: { ...this.approach(region, s), work: work.name, cult: cult.name, where }, start: { place: `${s.id}_shrine` },
      imports: { shrine: [`region.${s.id}_shrine`, 'place'],
        priest: [`region.${s.id}_priest`, 'group'], named: [`region.${work.id}_named`, 'fact'],
        found: [`region.${work.id}_found`, 'fact'], history: [`region.history_${makers.art}`, 'fact'],
        fate: [`region.history_${makers.art}_fate`, 'fact'] } };
  }
  private static wanderer(region: Region): Bound | undefined {
    const s = region.settlements[0];
    if (!s) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: this.approach(region, s), start, imports: { approach } };
  }
}
