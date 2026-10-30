import { Draw } from './land/draw';
import { Terrain } from './land/terrain';
import { RegionGeography } from './region-geography';
import { RegionFaith } from './region-faith';
import type { Region, Settlement } from './region-writer';
import { Features, type Feature } from './features';
import tables from '../../data/generation/scenes/foundings.json';

export type Kind = 'crossing' | 'harbour' | 'fishing' | 'workings' | 'yard' | 'farm' | 'monastery' | 'fortress'
  | 'ancient' | 'migration' | 'market';
export type Keeping = 'inn' | 'alehouse' | 'guesthouse' | 'canteen' | 'none';
export type Holy = 'shrine' | 'chapel' | 'garrison' | 'wayside';
// A founding's own place (the makers' well, the gate-tower), and what there is to do there besides its work: a way on
// from it (down the well's stair to the water), things to look at closely (the post notched for the floods, the book
// left open in the cloister), and somewhere high to see the country from (the gate-tower's top: see RegionSights).
export interface FoundingPlace {
  id: string; name: string; scene: string; outdoors: boolean;
  below?: { id: string; name: string; way: string; scene: string; underground?: boolean };
  things?: Feature[];
  view?: { name: string; unseen: string; seen: string; change: string };
}
// Why a settlement is where it is, and what follows: what its heart is called, why it is there (said once), how its
// heart looks by day and what goes on in it, the place of its own it may have, who keeps travellers, where its god is
// kept and how its goods are sold, and the work its people do first.
export interface Founding {
  kind: Kind; heart: string; why: string; scene?: string; life?: string; place?: FoundingPlace;
  keeping: Keeping; holy: Holy; selling: 'shop' | 'door'; works: string[];
  // What the founding's words name: the river crossed, the water fished, the pass held.
  words: Record<string, string>;
}
type Sized = Record<'town' | 'village' | 'hamlet', string>;
type ByTrade = Record<string, string | string[] | FoundingPlace>;
interface Entry { sight: string; heart: string[] | ByTrade; why: string[]; scene?: string[] | ByTrade; life?: string[];
  place?: FoundingPlace | ByTrade; keep: Sized; holy: Sized; sell: Sized; works: string[] }

// Reads a region's settlements for what made each: a road over a pass held by a fort; a river crossed; a makers' work
// built round; brothers who came for the quiet; a people who came by wagon; the town's market or harbour; and for the
// rest, what they live by (digging, a yard's work, fish, fields). Each region's settlements are read together, so that
// one fort holds one pass and one house of brothers is enough.
export class Foundings {
  static readonly table = tables as unknown as { foundings: Record<Kind, Entry>;
    keeping: Record<Keeping, { role: string; room?: string; door?: string; house: string; dog: string;
      background?: string; lodging?: [string, number]; scene?: string[]; night: string }>;
    holy: Record<Holy, { role: string; room?: string; door?: string; thing?: string;
      // A town's shrine has a tower to climb and look out from (see RegionSights).
      tower?: { name: string; unseen: string; seen: string; change: string } }>;
    selling: { door: { role: string } } };
  private static readonly cached = new WeakMap<Region, Founding[]>();
  static of(region: Region, i: number): Founding { return this.all(region)[i]!; }
  // Where a settlement keeps its god: its shrine, or its heart when all it has is a cross by the way.
  static holyPlace(region: Region, s: Settlement): string {
    return this.of(region, region.settlements.indexOf(s)).holy !== 'wayside' ? `${s.id}_shrine` : `${s.id}_green`;
  }
  static all(region: Region): Founding[] {
    const known = this.cached.get(region);
    if (known) { return known; }
    const kinds = this.kinds(region), out = region.settlements.map((s, i) => this.make(region, s, kinds[i]!));
    this.cached.set(region, out);
    return out;
  }
  // What made each of a region's settlements, read before their names are given (see PlaceNames): nothing here
  // reads a settlement's name.
  static kinds(region: Region): Kind[] {
    const out: (Kind | undefined)[] = region.settlements.map(() => undefined), draw = new Draw(`${region.name}:foundings`);
    const fort = this.fort(region);
    if (fort !== undefined) { out[fort] = 'fortress'; }
    // One crossing: the settlement, not the town, nearest where a road fords or bridges a named river.
    const ford = region.settlements.map((s, i) => ({ i, at: s.size === 'town' || out[i] ? undefined : this.crossing(region, i) }))
      .filter(x => x.at).sort((a, b) => a.at!.d - b.at!.d)[0];
    if (ford) { out[ford.i] = 'crossing'; }
    const old = this.ancient(region);
    if (old !== undefined && !out[old] && draw.chance(0.6)) { out[old] = 'ancient'; }
    const came = region.settlements.findIndex((s, i) => s.came && s.size !== 'town' && !out[i]);
    if (came >= 0) { out[came] = 'migration'; }
    const quiet = region.settlements.map((s, i) => i).filter(i => !out[i] && region.settlements[i]!.size !== 'town');
    if (quiet.length && draw.chance(0.5)) { out[quiet.at(-1)!] = 'monastery'; }
    return region.settlements.map((s, i) => out[i] ?? this.living(region, s, draw));
  }
  // What a settlement no circumstance made lives by: the town by its market or its harbour; the rest by their trade,
  // or (as most places do, whatever else they sell) by their fields.
  private static living(region: Region, s: Settlement, draw: Draw): Kind {
    const wet = this.water(region, s);
    if (s.size === 'town') { return wet ? 'harbour' : 'market'; }
    if (['tin', 'slate', 'salt', 'peat'].includes(s.trade)) { return 'workings'; }
    if (['charcoal', 'timber', 'reed', 'whale oil', 'furs', 'honey'].includes(s.trade)) { return draw.chance(0.6) ? 'yard' : 'farm'; }
    return (s.trade === 'eels' || wet) && draw.chance(0.7) ? 'fishing' : 'farm';
  }
  // The first settlement, not a hamlet, at the end of a road over a pass.
  private static fort(region: Region): number | undefined {
    const atlas = RegionGeography.atlas(region);
    const way = atlas.ways.find(w => w.over && [w.start, w.end].some(i => region.settlements[i]?.size !== 'hamlet'));
    return way ? [way.start, way.end].find(i => region.settlements[i]?.size !== 'hamlet') : undefined;
  }
  // A road out of the settlement crosses a named river within a cell or two of it.
  private static crossing(region: Region, i: number): { river: string; kind: string; d: number } | undefined {
    const atlas = RegionGeography.atlas(region), s = region.settlements[i]!;
    if (s.cell === undefined) { return undefined; }
    const near = atlas.ways.filter(x => x.start === i || x.end === i).flatMap(w => w.crossings)
      .filter(x => atlas.rivers[x.river]).map(x => ({ x, d: Terrain.distance(atlas.land, x.cell, s.cell!) }))
      .filter(c => c.d <= 2).sort((a, b) => a.d - b.d)[0];
    return near && { river: atlas.rivers[near.x.river]!.naming.name, kind: near.x.kind, d: near.d };
  }
  // The settlement, not the town, nearest one of the makers' works, if it is near.
  private static ancient(region: Region): number | undefined {
    const land = RegionGeography.atlas(region).land, works = region.sites.filter(w => w.work && w.cell !== undefined);
    const near = region.settlements
      .map((s, i) => ({ i, d: Math.min(99, ...works.map(w => Terrain.distance(land, w.cell!, s.cell ?? 0))) }))
      .filter(x => region.settlements[x.i]!.size !== 'town' && x.d <= 3).sort((a, b) => a.d - b.d);
    return near[0]?.i;
  }
  private static water(region: Region, s: Settlement): string | undefined {
    const atlas = RegionGeography.atlas(region), land = atlas.land, at = s.cell;
    if (at === undefined) { return undefined; }
    const lake = atlas.lakes.find(l => l.cells.some(c => Terrain.distance(land, c, at) <= 1));
    if (lake) { return lake.naming.name; }
    const W = land.width, near = [-W, -1, 1, W, -W - 1, -W + 1, W - 1, W + 1].map(d => at + d);
    return near.some(c => land.cover[c] === 'sea') ? 'sea' : undefined;
  }
  private static make(region: Region, s: Settlement, kind: Kind): Founding {
    const e = this.table.foundings[kind], draw = new Draw(`${region.name}:${s.id}:founding`);
    const crossed = kind === 'crossing' ? this.crossing(region, region.settlements.indexOf(s)) : undefined;
    const i = region.settlements.indexOf(s);
    const over = RegionGeography.atlas(region).ways.find(w => w.over && [w.start, w.end].includes(i));
    const words: Record<string, string> = { name: s.name, trade: s.trade, river: crossed?.river ?? 'river',
      water: this.water(region, s) ?? 'water', pass: over?.over?.name ?? 'pass',
      cult: RegionFaith.cults(region)[region.settlements.indexOf(s)]?.name ?? 'the god' };
    const heart = Array.isArray(e.heart) ? (crossed?.kind === 'bridge' ? e.heart[1] ?? e.heart[0]! : e.heart[0]!)
      : (e.heart[s.trade] as string | undefined) ?? Object.values(e.heart)[0] as string;
    const scenes = Array.isArray(e.scene) ? e.scene : e.scene ? e.scene[s.trade] as string[] | undefined : undefined;
    const place = this.place(e, s);
    return { kind, words, heart: this.fill(heart, words), why: this.fill(draw.pick(e.why), words),
      ...scenes?.length ? { scene: this.fill(draw.pick(scenes), words) } : {},
      ...e.life ? { life: this.fill(draw.pick(e.life), words) } : {},
      ...place ? { place: this.filled(place, words) } : {},
      keeping: e.keep[s.size as keyof Sized] as Keeping, holy: e.holy[s.size as keyof Sized] as Holy,
      selling: e.sell[s.size as keyof Sized] as 'shop' | 'door', works: e.works };
  }
  private static place(e: Entry, s: Settlement): FoundingPlace | undefined {
    if (!e.place) { return undefined; }
    return 'id' in e.place ? e.place as FoundingPlace : e.place[s.trade] as FoundingPlace | undefined;
  }
  // A founding's place in the words of the settlement it is in ({name}, {river}), what there is to do there too.
  private static filled(p: FoundingPlace, w: Record<string, string>): FoundingPlace {
    const below = p.below && { ...p.below, name: this.fill(p.below.name, w), way: this.fill(p.below.way, w),
      scene: this.fill(p.below.scene, w) };
    const things = p.things?.map(t => Features.filled(t, text => this.fill(text, w)));
    const view = p.view && { name: this.fill(p.view.name, w), unseen: this.fill(p.view.unseen, w),
      seen: this.fill(p.view.seen, w), change: this.fill(p.view.change, w) };
    return { ...p, scene: this.fill(p.scene, w), ...below ? { below } : {}, ...things ? { things } : {},
      ...view ? { view } : {} };
  }
  static fill(text: string, words: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (m, k: string) => words[k] ?? m);
  }
}
