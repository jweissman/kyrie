import countries from '../../data/adventures/countries.json';
import { Borders, type Side } from './land/borders';
import type { Region } from './region-writer';
import { WorldGrid } from './world-grid';
import { PlaceNames } from './place-names';

// An authored country a generated world may hold (data/adventures/countries.json): its module, the room the road
// across the march comes into, an entity only it has, what it is called and what kind of country it is, the side of a
// generated country it lies on, and the terrains of the countries it may lie beside.
export interface Country {
  id: string; bundle: string; entry: string; marker: string; name: string; terrain: string; side: Side;
  beside: string[]; among?: string;
  // What the folk of the first region say of it ({keeper}: whoever keeps travellers where it is asked), what it is
  // asked about, what the company knows of it once told, and the notice nailed up in every town, for news that is
  // posted.
  rumour?: string; heard?: string; topic?: string; notice?: { name: string; text: string; talk: string };
  // Once it is seen through (the country marks what was said of it stale): how the talk goes where its notice hangs,
  // and what whoever keeps travellers says to the company come back from it (after).
  after?: { talk: string; told: string };
  // What is said of it a country further off, where it is only heard of: "where ..." (see RegionBorders).
  far?: string;
  // What is seen of it from somewhere high in the country next to it, over its march (see RegionSights): a mountain
  // hanging in the sky. The builder's, from what its folk say of it, for its authors to rewrite.
  skyline?: string;
  // What goes ahead of it into the first region's towns (a company of players on the road to it, a pedlar from it): a
  // scenario of the library's form (data/scenarios), placed in the town its road leaves from whenever the world holds
  // the country, and never drawn at random; and those of its exports the country reads, bound to the country's
  // optional imports of the same name when it is installed (see Frontier).
  herald?: { scenario: string; exports: string[] };
  // A province: installed as part of the world's first country, its way in a place a little in from its side of that
  // country, not a country of its own beyond a march (Mission 18's Gate B; see Gates, Frontier).
  province?: boolean;
  // The land a province lies on, the kinds most wanted first (a barley field: meadow).
  covers?: import('./land/land-cover').Cover[];
}
type Beyond = NonNullable<Region['beyond']>[Side];
export class Countries {
  static readonly list = countries.countries as Country[];
  // The countries that lie beyond marches; the rest are provinces of the first country.
  static readonly marches = Countries.list.filter(c => !c.province);
  static readonly provinces = Countries.list.filter(c => c.province);
  // The country that fits beyond a march of a country of this terrain, of those not yet placed and this world holds.
  static fits(terrain: string, side: Side, placed: (c: Country) => boolean, seed: string): Country | undefined {
    return this.marches.find(c => c.side === side && c.beside.includes(terrain) && !placed(c)
      && this.held(c, seed, terrain));
  }
  // Whether the first country, of this terrain, leads into a country: always, unless it is among a kind of which the
  // seed chose another of those that fit it.
  static held(c: Country, seed: string, terrain: string): boolean {
    if (!c.among) { return true; }
    const kin = this.marches.filter(o => o.among === c.among && o.beside.includes(terrain));
    if (!kin.includes(c)) { return false; }
    return kin[this.hash(`${seed}:${c.among}`) % kin.length] === c;
  }
  // Where every authored country lies in a world, by the cell it fills (WorldGrid ids). The first country's marches
  // lead into those its folk have always told of: the Long Man north, Tessary east of a fen, and the one of the
  // independent adventures its seed chose. Each of the rest lies beyond a country further out, on its own side of
  // it: the nearest country of a terrain it may lie beside that is the way into no other, so that a world holds them
  // all, and no country is walled in by them (every country that leads into one can be reached by countries drawn
  // from the seed). Decided by the seed (and the first country's terrain, which may be given) before anyone goes
  // anywhere: the same world whichever way it is walked.
  private static readonly plans = new Map<string, Map<string, Country>>();
  static plan(seed: string, first: string): Map<string, Country> {
    const kept = this.plans.get(`${seed}\u0000${first}`);
    if (kept) { return kept; }
    const plan = new Map<string, Country>();
    for (const side of Borders.sides) {
      const c = this.fits(first, side, o => [...plan.values()].includes(o), seed);
      if (c) { plan.set(WorldGrid.id(...WorldGrid.next([0, 0], side)), c); }
    }
    const ways = new Set<string>();
    for (const c of this.marches.filter(o => ![...plan.values()].includes(o))) {
      const way = this.way(seed, c, plan, ways);
      if (way) { plan.set(WorldGrid.id(...WorldGrid.next(way, c.side)), c); ways.add(WorldGrid.id(...way)); }
    }
    this.plans.set(`${seed}\u0000${first}`, plan);
    return plan;
  }
  // The country a country is entered from, of those nearest the first that can be: of a terrain it may lie beside,
  // drawn from the seed (not authored), the way into no other, with the cell beyond it on that side free and not on
  // the first's own marches; and with every way into an authored country still reachable once it is there. Of those
  // equally near, the seed's choice.
  private static way(seed: string, c: Country, plan: Map<string, Country>, ways: Set<string>) {
    for (let ring = 1; ring <= this.reach; ring++) {
      const open = this.ring(ring).filter(at => {
        const into = WorldGrid.next(at, c.side), id = WorldGrid.id(...at), cell = WorldGrid.id(...into);
        return !plan.has(id) && !ways.has(id) && !plan.has(cell) && !ways.has(cell) && this.far(into) >= 2
          && c.beside.includes(WorldGrid.drawn(seed, ...at).terrain)
          && this.open(new Map([...plan, [cell, c]]), [...ways, id]);
      }).sort((a, b) => this.hash(`${seed}:${c.id}:${WorldGrid.id(...a)}`)
        - this.hash(`${seed}:${c.id}:${WorldGrid.id(...b)}`));
      if (open.length) { return open[0]!; }
    }
    return undefined;
  }
  // How far out from the first an authored country may be put (a world with no country to hold one within it holds
  // one country fewer).
  private static readonly reach = 4;
  private static far([x, y]: [number, number]): number { return Math.abs(x) + Math.abs(y); }
  private static ring(r: number): [number, number][] {
    const cells: [number, number][] = [];
    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) { if (this.far([x, y]) === r) { cells.push([x, y]); } }
    }
    return cells;
  }
  // Whether every way in can be reached from the first country by countries drawn from the seed.
  private static open(plan: Map<string, Country>, ways: string[]): boolean {
    const seen = new Set(['region']), queue: [number, number][] = [[0, 0]], bound = this.reach + 2;
    while (queue.length) {
      const at = queue.shift()!;
      for (const side of Borders.sides) {
        const next = WorldGrid.next(at, side), id = WorldGrid.id(...next);
        if (seen.has(id) || plan.has(id) || this.far(next) > bound) { continue; }
        seen.add(id); queue.push(next);
      }
    }
    return ways.every(id => seen.has(id));
  }
  // What the folk of a region say lies beyond its borders where an authored country does: told in full beyond the
  // march it is entered by; beyond any other, named, with no road over into it, and the country it is entered from.
  // (first: the terrain of the world's first country.)
  static beyond(region: Region, seed: string, first = region.terrain): Region['beyond'] {
    const beyond = { ...region.beyond }, plan = this.plan(seed, first), at = region.at ?? [0, 0];
    for (const side of Borders.sides) {
      const cell = WorldGrid.next(at, side), c = plan.get(WorldGrid.id(...cell));
      if (!c) { continue; }
      const way = WorldGrid.next(cell, Borders.opposite[c.side]);
      beyond[side] = c.side === side ? this.told(c) : { name: c.name, terrain: c.terrain, closed: true,
        way: PlaceNames.regionName(WorldGrid.drawn(seed, ...way)) };
    }
    return beyond;
  }
  // The heralds the first region of a world sends out on the roads to the countries next to it (each entered from it,
  // on its own side): those of them that send one, by the side their road goes out.
  // The authored countries whose heralds the first country holds: those on its first ring, and its provinces (Gate B:
  // one country, every adventure in it), whose news comes to its towns as a ring's does.
  static heralds(terrain: string, seed: string): { side: Side; country: Country }[] {
    const plan = this.plan(seed, terrain);
    return [...Borders.sides.flatMap(side => {
      const c = plan.get(WorldGrid.id(...WorldGrid.next([0, 0], side)));
      return c?.herald && c.side === side ? [{ side, country: c }] : [];
    }), ...this.provinces.filter(c => c.herald).map(c => ({ side: c.side, country: c }))];
  }
  private static told(c: Country): Beyond {
    const seen = c.skyline ? { skyline: c.skyline } : {};
    if (!c.rumour) { return { name: c.name, terrain: c.terrain, ...seen }; }
    return { name: c.name, terrain: c.terrain, rumour: c.rumour, heard: c.heard, ...c.topic ? { topic: c.topic } : {},
      ...c.notice ? { notice: c.notice } : {}, ...c.after ? { after: c.after } : {}, ...seen };
  }
  // The authored countries a region's folk have heard of beyond the countries next to theirs (each beyond the one
  // it is entered from): by the side of the region the way to it goes out, what the folk call the country it goes
  // into, and the side of that country it lies on.
  static further(region: Region, seed: string, first = region.terrain): NonNullable<Region['further']> {
    const plan = this.plan(seed, first), at = region.at ?? [0, 0];
    return Borders.sides.flatMap(side => {
      const next = WorldGrid.next(at, side), via = region.beyond?.[side];
      if (!via || via.closed || plan.has(WorldGrid.id(...next))) { return []; }
      return Borders.sides.filter(then => then !== Borders.opposite[side]).flatMap(then => {
        const c = plan.get(WorldGrid.id(...WorldGrid.next(next, then)));
        return c?.far && c.side === then
          ? [{ side, via: via.name, then, id: c.id, name: c.name, terrain: c.terrain, far: c.far }] : [];
      });
    });
  }
  private static hash(text: string): number {
    let hash = 2166136261;
    for (const ch of text) { hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619); }
    return hash >>> 0;
  }
}
