import tongues from 'languages';
import data from '../../../data/generation/history/arts.json';
import { Draw } from '../land/draw';
import { Terrain } from '../land/terrain';
import { RegionLand } from '../region-land';
import type { Atlas } from '../land/atlas';
import type { Naming } from '../land/land-names';
import { WorkPlans, type WorkPlan } from './work-plans';
import { Wearing } from './wearing';

interface Art {
  epithet: string; self: [string, string][]; terrains: Record<string, number>; plans: string[]; craft: string;
  belief: string; fates: string[]; said: string[]; modifiers: string[];
  // What its works hold for whoever finds it: Orsino's treasure, common and rich.
  treasure: { common: string[]; rich: string[] };
}
// The people who first made things in a region: by what art, what they held true, and how they ended.
export interface Makers { art: string; epithet: string; self: Naming; craft: string; belief: string; fate: string;
  said: string[] }
// The kingdom that came after them and made use of what they left, and how it fell.
export interface Successors { name: string; gloss: string; kind: string; were: string; made: string; fall: string;
  fallen: string }
// What a later kingdom built, and what it left: the plan its works follow, the words its names are made of, and
// its treasure.
interface Kind { id: string; were: string; made: string; plan: string; modifiers: string[];
  treasure: { common: string[]; rich: string[] } }
// One of the makers' works, or the later kingdom's: its plan, where it stands, the name cut over it (the makers' in
// the old tongue, the kingdom's in the folk's), and the name the folk have worn it down to.
export interface Work { id: string; plan: string; art: string; cell: number; zone?: string; part?: number;
  old: Naming; worn: string; later?: boolean }
export interface History { makers: Makers[]; successors: Successors; works: Work[] }

// A region's past, as far as it shows in the land: the makers whose works stand in it, placed where their art would
// put them (a cistern under a hill by a river, towers on the heights, barrows along the bounds), the kingdom that came
// after them, and what the folk say now. The first makers are the region's own, drawn by its terrain; a second
// people left a work or two of their own.
export class Histories {
  static readonly arts = data.arts as unknown as Record<string, Art>;
  static readonly counts: Record<string, number> = { cistern: 2, weir: 1, galleries: 2, watchtower: 3, barrow: 3,
    singing_hall: 2, keep: 2, abbey: 1, tollhouse: 1 };
  static readonly kinds = data.successors.kinds as unknown as Kind[];
  private static readonly plans = new Map<string, WorkPlan>();
  static register(text: string): WorkPlan {
    const plan = WorkPlans.parse(text);
    this.plans.set(plan.id, plan);
    return plan;
  }
  static plan(id: string): WorkPlan {
    const plan = this.plans.get(id);
    if (!plan) { throw new Error(`No work plan ${id}`); }
    return plan;
  }
  static make(key: string, terrain: string, atlas: Atlas): History {
    const draw = new Draw(`${key}:history`), names: string[] = [];
    const first = this.art(draw, terrain), second = this.art(draw, terrain, first);
    const makers = [first, ...second ? [second] : []].map(art => this.makers(art, draw, names));
    const successors = this.successors(draw), works: Work[] = [], taken: number[] = [];
    names.push(successors.name);
    for (const [i, maker] of makers.entries()) {
      const plans = this.arts[maker.art]!.plans.filter(p => this.plans.has(p));
      for (const id of i === 0 ? plans : plans.slice(0, 1)) {
        for (let n = 0; n < (i === 0 ? this.counts[id] ?? 1 : Math.min(2, this.counts[id] ?? 1)); n++) {
          const same = works.filter(w => w.plan === id).map(w => w.cell);
          const work = this.work(atlas, { plan: this.plan(id), key: `${key}:work:${works.length}`, taken, names, same });
          if (work) { works.push({ ...work, id: `w${works.length + 1}` }); }
        }
      }
    }
    // What the kingdom after them built, and left when it fell.
    const kind = this.kinds.find(k => k.id === successors.kind);
    for (let n = 0; kind && this.plans.has(kind.plan) && n < (this.counts[kind.plan] ?? 1); n++) {
      const same = works.filter(w => w.plan === kind.plan).map(w => w.cell);
      const work = this.work(atlas, { plan: this.plan(kind.plan), key: `${key}:work:${works.length}`, taken, names, same });
      if (work) { works.push({ ...work, id: `w${works.length + 1}`, later: true }); }
    }
    return { makers, successors, works };
  }
  // The art of a region's makers, weighed by its terrain; another than one already drawn.
  private static art(draw: Draw, terrain: string, not?: string): string {
    const entries = Object.entries(this.arts).filter(([id, art]) => id !== not && (art.terrains[terrain] ?? 0) > 0)
      .map(([id, art]) => [id, art.terrains[terrain]!] as const);
    return draw.weighted(entries);
  }
  private static makers(art: string, draw: Draw, names: string[]): Makers {
    const a = this.arts[art]!, self = this.old(draw.shuffle(a.self), names);
    return { art, epithet: a.epithet, self, craft: a.craft, belief: a.belief, fate: draw.pick(a.fates),
      said: a.said };
  }
  private static successors(draw: Draw): Successors {
    const s = data.successors, kind = draw.pick(s.kinds), [a, b] = draw.pick(s.names) as [string, string];
    const name = tongues.getDictionary('westron').translate(a as never, b as never).trim(), fall = draw.pick(s.falls);
    return { name, gloss: `${a} ${b}`, kind: kind.id, were: kind.were, made: kind.made, fall: fall.text,
      fallen: fall.id };
  }
  // A name from the first pair of words that names nothing else in the region: in the old tongue for the makers'
  // works, in the folk's for the kingdom's.
  private static old(pairs: [string, string][], names: string[], tongue = 'aenean'): Naming {
    const dictionary = tongues.getDictionary(tongue as 'aenean');
    const named = pairs.flatMap(([m, w]) => {
      try { return [{ modifier: m, word: w, name: dictionary.translate(m as never, w as never).trim() }]; }
      catch { return []; }
    });
    // A short name before a long one: the folk wear long ones down to nothing.
    const free = named.filter(n => names.every(t => !RegionLand.confusable(n.name, t)));
    const chosen = free.find(n => n.name.length <= 13) ?? free[0] ?? named[0]!;
    names.push(chosen.name);
    return { name: chosen.name, gloss: `${chosen.modifier} ${chosen.word}`, tongue: dictionary.name,
      modifier: chosen.modifier, word: chosen.word };
  }
  // A work where its plan can stand, named in the old tongue and worn down by the folk; none if nowhere suits it.
  private static work(atlas: Atlas, at: { plan: WorkPlan; key: string; taken: number[]; names: string[];
    same: number[] }): Omit<Work, 'id'> | undefined {
    const { plan, key, taken } = at, draw = new Draw(key), land = atlas.land;
    const blocked = [...atlas.seats.map(s => s.cell), ...taken];
    // Works of a kind stand well apart: two towers in sight of each other, not side by side.
    const open = land.cover.map((cover, c) => ({ c, rank: plan.ground.indexOf(cover) }))
      .filter(({ c, rank }) => rank >= 0 && blocked.every(b => Terrain.distance(land, b, c) >= 2)
        && at.same.every(b => Terrain.distance(land, b, c) >= 4))
      .map(({ c, rank }) => ({ c, score: -2 * rank + this.suits(atlas, plan, { c, taken }) + draw.next() * 1.5 }))
      .sort((a, b) => b.score - a.score || a.c - b.c);
    const cell = open[0]?.c;
    if (cell === undefined) { return undefined; }
    taken.push(cell);
    const kind = this.kinds.find(k => k.id === plan.art), words = kind?.modifiers ?? this.arts[plan.art]?.modifiers ?? ['old'];
    const pairs = plan.names.flatMap(n => n.includes('/') ? [n.split('/') as [string, string]]
      : words.map(m => [m, n] as [string, string]));
    const zone = atlas.zones.find(z => z.cells.includes(cell));
    const old = this.old(draw.shuffle(pairs), at.names, kind ? 'westron' : 'aenean');
    const part = zone?.parts.findIndex(p => p.includes(cell));
    // The folk still say the kingdom's names much as it did; the makers' they have worn down.
    return { plan: plan.id, art: plan.art, cell, ...zone ? { zone: zone.id, part } : {},
      old, worn: kind ? old.name : Wearing.wear(old.name) };
  }
  // How well a cell suits a plan: by a river if it wants one, high if it is a tower, near the region's bounds if it
  // is a barrow; deeper in wild country; away from other works of the same kind.
  private static suits(atlas: Atlas, plan: WorkPlan, at: { c: number; taken: number[] }): number {
    const land = atlas.land, c = at.c, x = Terrain.x(land, c), y = Terrain.y(land, c);
    const river = atlas.rivers.some(r => r.cells.some(n => Terrain.distance(land, n, c) <= 1));
    const edge = Math.min(x, y, land.width - 1 - x, land.height - 1 - y);
    const zone = atlas.zones.find(z => z.cells.includes(c)), part = zone?.parts.findIndex(p => p.includes(c)) ?? -1;
    const crowd = at.taken.filter(t => zone?.cells.includes(t)).length;
    const road = plan.near === 'road' && atlas.ways.some(r => r.cells.some(n => Terrain.distance(land, n, c) <= 1));
    return (plan.near === 'river' && river ? 3 : 0) + (road ? 3 : 0) + (plan.kind === 'tower' ? 4 * land.heights[c]! : 0)
      + (plan.kind === 'barrow' ? Math.max(0, 3 - edge) : 0) + Math.min(2, part + 0.5) - 1.5 * crowd;
  }
}
