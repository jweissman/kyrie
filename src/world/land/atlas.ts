import { Draw } from './draw';
import { LandNames, type Feature, type Naming } from './land-names';
import { Roads, type Road } from './roads';
import { Borders, type Border } from './borders';
import { Settling, type Seat } from './settling';
import { Terrain, type Land } from './terrain';
import { Zones, type Zone } from './zones';
import type { Cover } from './land-cover';

export interface Water { cells: number[]; naming: Naming; spring?: number[]; fall?: number }
export interface Wilds extends Zone { naming: Naming; peak?: { cell: number; naming: Naming } }
export interface Way extends Road { id: string; start: number; end: number; pass?: number; over?: Naming }
// Where a site stands: its cell, and the wild country (and which part of it) it lies in, if any.
export interface Spot { cell: number; zone?: string; part?: number }
// A region's geography: its land, where people live and the roads between them, its rivers, lakes and wild country,
// all named.
export interface Atlas { land: Land; seats: Seat[]; ways: Way[]; rivers: Water[]; lakes: Water[]; zones: Wilds[];
  borders: Border[] }

export class Atlases {
  static make(key: string, terrain: string, at: { tongue: string; taken: string[] }): Atlas {
    const land = Terrain.make(key, terrain), seats = Settling.make(key, terrain, land);
    const roads = Roads.make(land, seats), zones = Zones.make(land, seats, roads);
    const names = { key, ...at };
    const rivers = land.water.rivers.slice(0, 3).map((r, i) => ({ cells: r.cells, spring: r.spring, fall: r.fall,
      naming: this.name(names, 'river', `river${i}`, i === 0 ? 'river' : undefined) }));
    const lakes = land.water.lakes.map((cells, i) => ({ cells, naming: this.name(names, 'lake', `lake${i}`) }));
    const wilds = zones.map(z => {
      const top = z.wild === 'fell' ? [...z.cells].sort((a, b) => land.heights[b]! - land.heights[a]!)[0] : undefined;
      return { ...z, naming: this.name(names, z.wild, z.id), ...top !== undefined && land.cover[top] === 'peak'
        ? { peak: { cell: top, naming: this.name(names, 'peak', `${z.id}peak`) } } : {} };
    });
    const ways = roads.map((r, i) => {
      const start = seats.findIndex(s => s.cell === r.from), end = seats.findIndex(s => s.cell === r.to);
      return { ...r, id: `r${i + 1}`, start, end, ...r.pass !== undefined && land.cover[r.pass] !== 'meadow'
        ? { over: this.name(names, 'pass', `pass${i}`) } : {} };
    });
    const borders = Borders.make(land, seats, new Set(roads.flatMap(r => r.cells)));
    return { land, seats, ways, rivers, lakes, zones: wilds, borders };
  }
  private static name(at: { key: string; tongue: string; taken: string[] }, feature: Feature, id: string,
    word?: string): Naming {
    return LandNames.name(feature, at.tongue, { key: `${at.key}:name:${id}`, taken: at.taken, ...word ? { word } : {} });
  }
  // The cells a kind of site can stand on, best first: a cave in a hillside, a barrow on open high ground, a tower
  // on a height, a grove in a wood, a bog in a fen, a mine in the fells; never on a settlement or another site, nor
  // close by either.
  static readonly grounds: Record<string, Cover[]> = { cave: ['fell', 'wood', 'heath'], barrow: ['heath', 'meadow', 'fell'],
    ruin: ['meadow', 'wood', 'heath', 'fell'], tower: ['fell', 'peak', 'heath'], grove: ['wood'], bog: ['fen'],
    mine: ['fell', 'peak'], sinkhole: ['heath', 'meadow', 'wood'] };
  static place(atlas: Atlas, kind: string, at: { key: string; taken: number[] }): Spot | undefined {
    const { land } = atlas, grounds = this.grounds[kind] ?? ['meadow'], draw = new Draw(at.key);
    const blocked = [...atlas.seats.map(s => s.cell), ...at.taken];
    // Sites spread through the wild country: a zone that already holds one is less likely to hold another.
    const crowd = new Map<string | undefined, number>();
    for (const c of at.taken) { const z = this.within(atlas, c).zone; crowd.set(z, (crowd.get(z) ?? 0) + 1); }
    const open = land.cover.map((cover, c) => ({ c, rank: grounds.indexOf(cover) }))
      .filter(({ c, rank }) => rank >= 0 && blocked.every(b => Terrain.distance(land, b, c) >= 2))
      .map(({ c, rank }) => ({ c, score: -rank * 2 + this.depth(atlas, c) + draw.next() * 1.5
        - 1.5 * ((this.within(atlas, c).zone && crowd.get(this.within(atlas, c).zone)) || 0) }))
      .sort((a, b) => b.score - a.score || a.c - b.c);
    // Where no ground of its kind is free, a site stands on any dry ground there is (a tower on the meadow).
    const best = open[0]?.c ?? (grounds.includes('meadow') ? undefined
      : this.place(atlas, 'ruin', { key: `${at.key}:any`, taken: at.taken })?.cell);
    if (best === undefined) { return undefined; }
    at.taken.push(best);
    return { cell: best, ...this.within(atlas, best) };
  }
  // A site deeper in wild country is better hidden, and more likely to be what it is: its part's distance in.
  private static depth(atlas: Atlas, c: number): number {
    const where = this.within(atlas, c);
    return where.part === undefined ? 0 : Math.min(2, where.part + 0.5);
  }
  static within(atlas: Atlas, c: number): { zone?: string; part?: number } {
    const zone = atlas.zones.find(z => z.cells.includes(c));
    return zone ? { zone: zone.id, part: zone.parts.findIndex(p => p.includes(c)) } : {};
  }
}
