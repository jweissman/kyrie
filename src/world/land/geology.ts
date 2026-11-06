import geology from '../../../data/catalog/geology.json';
import { Draw } from './draw';
import type { Cover } from './land-cover';

export interface Formation {
  name: string; rock: string; soil: string; covers: string[]; terrains: string[]; deposits: Record<string, number>;
  looks: string;
}
// What a country's ground is made of, cell by cell: the formation under each (where any lies under its cover), and
// the material deposited in a cell where there is one.
export interface Ground { rock: (string | null)[]; deposits: Record<number, string> }

// What the land is made of under what covers it (data/catalog/geology.json), a layer beside the cover and never
// another registry of terrain: a country's formations are those of its terrain, laid in broad tracts (a block of a few
// cells is one formation, where the formation lies under its cover), and its deposits fall where a formation carries
// them, most where the rock shows (the fells and the peaks).
export class Geology {
  static readonly formations = geology.formations as Record<string, Formation>;
  // A tract is a block of this many cells a side.
  static readonly tract = 3;
  static readonly showing: Partial<Record<Cover, number>> = { peak: 0.22, fell: 0.16, heath: 0.06, fen: 0.08 };
  static make(key: string, terrain: string, land: { width: number; cover: Cover[] }): Ground {
    const own = Object.entries(this.formations).filter(([, f]) => f.terrains.includes(terrain)).map(([id]) => id);
    const rock = land.cover.map((cover, c) => this.formation({ key, own, width: land.width }, cover, c));
    const deposits: Record<number, string> = {};
    rock.forEach((id, c) => {
      const f = id ? this.formations[id] : undefined, draw = new Draw(`${key}:deposit:${c}`);
      if (!f || !draw.chance(this.showing[land.cover[c]!] ?? 0.03)) { return; }
      deposits[c] = this.weighed(f.deposits, draw);
    });
    return { rock, deposits };
  }
  // The formation under a cell: its tract's, drawn among the country's formations that lie under its cover.
  private static formation(at: { key: string; own: string[]; width: number }, cover: Cover, c: number): string | null {
    const under = at.own.filter(id => this.formations[id]!.covers.includes(cover));
    if (!under.length) { return null; }
    const tract = `${Math.floor((c % at.width) / this.tract)},${Math.floor(Math.floor(c / at.width) / this.tract)}`;
    return new Draw(`${at.key}:rock:${tract}`).pick(under);
  }
  private static weighed(weights: Record<string, number>, draw: Draw): string {
    const all = Object.entries(weights), total = all.reduce((n, [, w]) => n + w, 0);
    let roll = draw.next() * total;
    return all.find(([, w]) => (roll -= w) < 0)?.[0] ?? all[0]![0];
  }
}
