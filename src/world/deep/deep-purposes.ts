import mine from '../../../data/generation/deep/deep.json';
import type { WorkPlan } from '../history/work-plans';

// What a room of a deep site is for, and how it is told.
export interface DeepRole { names: string[]; scenes: string[]; lit?: boolean }
// One level: a spine of rooms in order (a role, or ?role for one that may not be there), branches off it, and loops
// through it; a flooded level stands under water until something drains it.
export interface DeepLevelSpec {
  id: string; names: string[]; spine: string[]; flooded?: boolean;
  branches?: { at: string; roles: string[] }[];
  loops?: { from: string; to: string; kind: string; chance: number; names: string[] }[];
}
// A way between two levels: from a room of one to a room of the next, of a kind, maybe one way, maybe worked by a
// mechanism (a cage on a winding wheel, a wall across a stair).
export interface DeepConnector {
  kind: string; from: [string, string]; to: [string, string]; minutes: number; names: string[];
  mechanism?: string; oneWay?: boolean; needs?: string[];
}
// Who lives at a depth: a species (or a people and a calling), how many, what they are called.
export interface DeepGroup {
  species?: string; ancestry?: string; calling?: string; count: number; label: string; role: string;
  temperament: string;
}
// What a deep site was for, and so how it is laid out, what lives in it, and what lies at the bottom of it.
export interface DeepPurpose {
  art: string; plan: { id: string; seen: string; names: string[]; ground: string[]; danger: number };
  levels: DeepLevelSpec[]; connectors: DeepConnector[]; roles: Record<string, DeepRole>;
  dwellers: { depth: number; groups: DeepGroup[] }[];
  // Who leads at a depth, or is worse than the rest: what an elite room holds.
  elites?: { depth: number; groups: DeepGroup[] }[];
  // What keeps the bottom, too strong to fight when the site is first found: where it shrinks back to, and what it
  // cannot bear.
  keeper: DeepGroup & { level: number; words?: Record<string, string>; refuge?: string; fears?: string };
  // What it cannot bear, and where the makers left it: an item in a room of a role, how it looks there, the words
  // they cut about it (read with lore where they walled the way down), and what reading them tells.
  bane?: { item: string; role: string; seen: string; cut: string; fact: string };
  // What they died for: the thing at the bottom, what it is, what it is to bring it up, and how that is told.
  objective: { item: string; kind: string; text: string; goal?: string; raised?: string };
  rumours: string[];
  // What it was dug or built for, left where it was got: so many of a local kind in rooms of these roles.
  ore?: { kind: string; name: string; roles: Record<string, number> };
  // What lies about in it, by Orsino's treasure tier: what its makers and those after them would have left; and the
  // wonders that would be in a place like it.
  finds?: Record<string, string[]>; wonders?: string[];
  // Rooms where a company can rest (a hall with a hearth, a store-room), if nothing finds it there first.
  rest?: string[];
  // How it looks from outside, with its old name cut over the way in ({oldup}).
  outside: string;
  // An earlier party's camp, left where they turned back (or did not): how it looks, and what their notebook says
  // at each depth.
  camp: { scene: string; journal: string[] };
}

// The deep sites a region's first makers may have left, one for each art that has one
// (data/generation/deep/<art>.json): the Delvers' mine.
export class DeepPurposes {
  static readonly all: Record<string, DeepPurpose> = { deep: mine as unknown as DeepPurpose };
  static of(art: string): DeepPurpose | undefined { return this.all[art]; }
  // A deep site as a work plan, so that it is placed, named and told of as the makers' other works are; what is
  // written of it is its own (DeepSites), not a plan's sections.
  static plan(purpose: DeepPurpose): WorkPlan {
    const p = purpose.plan;
    return { id: p.id, about: `the deep ${p.seen}`, art: purpose.art, kind: 'mine',
      ground: p.ground as WorkPlan['ground'], seen: p.seen, names: p.names, danger: p.danger, sections: [], deep: true };
  }
}
