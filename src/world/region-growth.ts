import { Canon } from '../canon/canon';
import { Draw } from './land/draw';
import { Geology } from './land/geology';
import { RegionGeography } from './region-geography';
import { RegionZones } from './region-zones';
import { RegionRoads } from './region-roads';
import type { Region } from './region-writer';
import type { Plant } from '../canon/schema';

// What grows wild in a country, where the land lets it: willows and meadowsweet where a road or a wood runs by water,
// sphagnum in the fen, yarrow at the waysides of open country. Each is a stand at a place on the land, seen there,
// that gives a little of what it yields (willow bark for a fever, moss for a wound) to whoever gathers it. Only what
// grows on a place's own cells is there: a herb-wife who says the willow grows by water is right.
export class RegionGrowth {
  // The habitats a place on the land has, from its cells, as the one vocabulary says each is on the land
  // (data/catalog/habitats.json): the ground beside water, and what each cell's cover is (fen, meadow, wood, fells,
  // heath, heights).
  static habitats(region: Region, cells: number[]): Set<string> {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, cover = atlas.land.cover;
    const wet = new Set([...atlas.rivers.flatMap(r => r.cells), ...atlas.lakes.flatMap(l => l.cells)]);
    const out = new Set<string>(), all = Object.entries(Canon.habitats);
    for (const c of cells) {
      const around = [c, c - 1, c + 1, c - W, c + W];
      if (around.some(n => wet.has(n) || ['lake', 'sea'].includes(cover[n] ?? ''))) {
        for (const [id] of all.filter(([, h]) => h.water)) { out.add(id); }
      }
      // The shore of the sea: what lives in it is seen from there (a whale blowing offshore).
      if (around.some(n => cover[n] === 'sea')) { for (const [id] of all.filter(([, h]) => h.shore)) { out.add(id); } }
      for (const [id] of all.filter(([, h]) => h.covers?.includes(cover[c] ?? ''))) { out.add(id); }
    }
    return out;
  }
  // The plants that can be gathered, in the order data/catalog/plants.json gives them: a place grows the first two
  // written without an abundance whose habitat it has, most particular first, and beside them each with an abundance
  // whose habitat it has, by that chance in ten (a rare herb is rare), twice that on the rock it does best on (heather
  // on the granite, selfheal on the limestone: M19-68). A plant added there grows where it lives.
  static get plants(): string[] { return Object.keys(Canon.plants).filter(id => Canon.plants[id]!.stand); }
  static grown(place: { id: string }, habitats: Set<string>, rocks: Set<string> = new Set()): [string, Plant][] {
    const fits = this.plants.map(id => [id, Canon.plants[id]!] as [string, Plant])
      .filter(([, o]) => o.habitats.some(h => habitats.has(h)));
    return [...fits.filter(([, o]) => !o.abundance).slice(0, 2),
      ...fits.filter(([id, o]) => o.abundance && new Draw(`${place.id}:${id}`).chance(this.odds(o, rocks)))];
  }
  private static odds(o: Plant, rocks: Set<string>): number {
    return Math.min(1, (o.abundance ?? 0) / 10 * (o.grounds?.some(g => rocks.has(g)) ? 2 : 1));
  }
  // The rock under a place's cells (see Geology), and the soils it makes.
  static rocks(region: Region, cells: number[]): Set<string> {
    const rock = RegionGeography.atlas(region).land.ground?.rock ?? [];
    const under = cells.flatMap(c => rock[c] ?? []);
    return new Set([...under, ...under.flatMap(id => Geology.formations[id]?.soils ?? [])]);
  }
  static places(region: Region): { id: string; cells: number[]; name: string }[] {
    const atlas = RegionGeography.atlas(region);
    return [...RegionGeography.roads(region)
      .map(r => ({ id: r.way, cells: r.route.cells, name: RegionRoads.names(r, region).way })),
      ...atlas.zones.flatMap(z => RegionZones.landmarks(region, z).filter(l => l.cell !== undefined)
        .map(l => ({ id: l.id, cells: [l.cell!], name: l.name })))];
  }
  // Where a plant grows near a settlement, nearest first: what someone who knows the water would say.
  static near(region: Region, plant: string, cell: number): { id: string; name: string }[] {
    const W = RegionGeography.atlas(region).land.width, o = Canon.plants[plant]!;
    return this.places(region).filter(p => o.habitats.some(h => this.habitats(region, p.cells).has(h)))
      .map(p => ({ p, d: Math.min(...p.cells.map(c => this.apart(c, cell, W))) })).filter(x => x.d <= 8)
      .sort((a, b) => a.d - b.d).map(x => ({ id: x.p.id, name: x.p.name }))
      // Two fords of the same river are one place to someone telling the way.
      .filter((n, i, all) => all.slice(0, i)
        .every(o => !this.proper(o.name).some(w => this.proper(n.name).includes(w))))
      .slice(0, 2);
  }
  private static proper(name: string): string[] { return name.split(/\s+/).filter(w => /^\p{Lu}/u.test(w)); }
  private static apart(a: number, b: number, W: number): number {
    return Math.max(Math.abs(a % W - b % W), Math.abs(Math.floor(a / W) - Math.floor(b / W)));
  }
  static lines(region: Region): string[] {
    const q = JSON.stringify, lines: string[] = [];
    const roads = new Set(RegionGeography.roads(region).map(r => r.way));
    for (const place of this.places(region)) {
      const habitats = this.habitats(region, place.cells);
      const here = this.grown(place, habitats, this.rocks(region, place.cells));
      for (const [id, o] of here) {
        const stand = `${place.id}_${id}`;
        lines.push(`  Thing ${stand} ${q(`the ${o.name.toLowerCase()}`)} at ${place.id} is scenery {`,
          // A stand by a road is somewhere along it, not wherever the road is seen from.
          `    State growing ${q(roads.has(place.id) ? o.stand!.replace(/ here\b/, ' along the road') : o.stand!)}.`, '  }',
          `  Initially Assert grows(${stand}).`,
          `  Discovery ${stand}_hid ${q(`What grows at ${place.id} is gathered, not found.`)}.`);
        for (let n = 1; n <= (o.count ?? 1); n++) {
          lines.push(`  Item ${stand}_${n} ${q(o.gathered!)} is ${o.yields} in ${stand} hidden until ${stand}_hid.`,
            `  Initially Assert crop(${stand}_${n}, ${stand}).`);
        }
        // What else is cut from it: a pole from the willows (a barrow's switch wants one; no shop near may sell it).
        for (let n = 1; o.cut && n <= (o.cut.count ?? 1); n++) {
          lines.push(`  Item ${stand}_cut${n} ${q(o.cut.gathered)} is ${o.cut.yields} in ${stand} hidden until ${stand}_hid.`,
            `  Initially Assert crop(${stand}_cut${n}, ${stand}).`);
        }
      }
    }
    return lines;
  }
}
