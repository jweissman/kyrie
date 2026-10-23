import { Canon } from '../canon/canon';
import { RegionGeography } from './region-geography';
import { RegionZones } from './region-zones';
import { RegionRoads } from './region-roads';
import type { Region } from './region-writer';
import type { Organism } from '../canon/schema';

// What grows wild in a country, where the land lets it: willows and meadowsweet where a road or a wood runs by water,
// sphagnum in the fen, yarrow at the waysides of open country. Each is a stand at a place on the land, seen there,
// that gives a little of what it yields (willow bark for a fever, moss for a wound) to whoever gathers it. Only what
// grows on a place's own cells is there: a herb-wife who says the willow grows by water is right.
export class RegionGrowth {
  // The habitats a place on the land has, from its cells: by water, fen, meadow, wood, upland.
  static habitats(region: Region, cells: number[]): Set<string> {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, cover = atlas.land.cover;
    const wet = new Set([...atlas.rivers.flatMap(r => r.cells), ...atlas.lakes.flatMap(l => l.cells)]);
    const out = new Set<string>();
    for (const c of cells) {
      const around = [c, c - 1, c + 1, c - W, c + W];
      if (around.some(n => wet.has(n) || ['lake', 'sea'].includes(cover[n] ?? ''))) { out.add('riverbank'); }
      const here = cover[c] ?? '';
      if (here === 'fen') { out.add('marsh'); }
      if (here === 'meadow') { out.add('meadow'); }
      if (here === 'wood') { out.add('woodland'); }
      if (['fell', 'heath', 'peak'].includes(here)) { out.add('upland'); }
    }
    return out;
  }
  // The plants that can be gathered, most particular first: a place grows the first two whose habitat it has.
  static readonly plants = ['willow', 'sphagnum', 'meadowsweet', 'yarrow'];
  static places(region: Region): { id: string; cells: number[]; name: string }[] {
    const atlas = RegionGeography.atlas(region);
    return [...RegionGeography.roads(region)
      .map(r => ({ id: r.way, cells: r.route.cells, name: RegionRoads.names(r, region).way })),
      ...atlas.zones.flatMap(z => RegionZones.landmarks(region, z).filter(l => l.cell !== undefined)
        .map(l => ({ id: l.id, cells: [l.cell!], name: l.name })))];
  }
  // Where a plant grows near a settlement, nearest first: what someone who knows the water would say.
  static near(region: Region, plant: string, cell: number): string[] {
    const W = RegionGeography.atlas(region).land.width, o = Canon.organisms[plant]!;
    return this.places(region).filter(p => o.habitats.some(h => this.habitats(region, p.cells).has(h)))
      .map(p => ({ p, d: Math.min(...p.cells.map(c => this.apart(c, cell, W))) })).filter(x => x.d <= 8)
      .sort((a, b) => a.d - b.d).map(x => x.p.name)
      // Two fords of the same river are one place to someone telling the way.
      .filter((n, i, all) => all.slice(0, i).every(o => !this.proper(o).some(w => this.proper(n).includes(w))))
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
      const here = this.plants.map(id => [id, Canon.organisms[id]!] as [string, Organism])
        .filter(([, o]) => o.stand && o.habitats.some(h => habitats.has(h))).slice(0, 2);
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
      }
    }
    return lines;
  }
}
