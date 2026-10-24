import mine from '../../../data/generation/deep/deep.json';
import barrow from '../../../data/generation/deep/barrow.json';
import waterworks from '../../../data/generation/deep/waterworks.json';
import singing from '../../../data/generation/deep/singing.json';
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
import type { Alteration } from './deep-history';

export interface Valuable { id: string; name: string; worth: number; weight: number; text: string }
// The words a purpose gives its working parts (DeepMechanisms): a way between levels that its gear must be freed to
// work, a seal with the makers' warning cut in it, a drowned level and the wheel that drains it, a hidden way out.
export interface MechanismWords {
  winch?: { kind: string; thing: string; seized: string; turning: string; free: string; shut: string; climb: string };
  // What opening and shutting it needs, if not main force (brawn or a crowbar): a door that opens to a note, lore.
  seal?: { kind: string; thing: string; noun: string; opened: string; standing: string; broken: string; break: string;
    rebuild: string; words: string; unread: string; read: string; readLabel: string; told: string; needs?: string };
  vent?: { found: string; sign: string; night?: string; crawl: string; rungs: string };
  drowned?: { flooded: string; deep: string; going: string; gate: string; gateShut: string; gateOpen: string;
    open: string;
    shut: string; chain: string; slack: string; engaged: string; engage: string; drained: string; running: string;
    idle: string; dry: string; heard: string;
    // The water running out of the site at its mouth and outside, and once it is turned down the race instead.
    flowing?: string; diverted?: string };
}
// What a deep site was for, and so how it is laid out, what lives in it, and what lies at the bottom of it.
export interface DeepPurpose {
  art: string; plan: { id: string; kind: string; seen: string; names: string[]; ground: string[]; danger: number };
  mechanisms: MechanismWords;
  // What a way between two rooms of a level is called (a gallery, a drift in a mine).
  walks?: string[];
  // How the home town speaks of it: what the innkeeper is asked about, what its trader buys from it, and says.
  // How it is told of at the inn, what the merchant buys, and what the innkeeper says when its heart comes home.
  hook: { topic: string; trade?: { topic: string; says: string }; home?: string };
  levels: DeepLevelSpec[]; connectors: DeepConnector[]; roles: Record<string, DeepRole>;
  dwellers: { depth: number; groups: DeepGroup[] }[];
  // Who leads at a depth, or is worse than the rest: what an elite room holds.
  elites?: { depth: number; groups: DeepGroup[] }[];
  // What keeps the bottom, too strong to fight when the site is first found: where it shrinks back to, and what it
  // cannot bear.
  keeper: DeepGroup & { level: number; words?: Record<string, string>; refuge?: string; fears?: string };
  // What it cannot bear, and where the makers left it: an item in a room of a role, how it looks there, the words
  // they cut about it (read with lore where they walled the way down), and what reading them tells.
  bane?: { item: string; role: string; seen: string; cut: string; fact: string;
    // A kind of the site's own, made like a catalog item it is carried as (an oath-tablet, as a book is), and what it
    // brings whoever carries it, which is what the keeper fears.
    like?: { name: string; base: string; text: string; grants?: string } };
  // What they died for: the thing at the bottom, what it is, what it is to bring it up, and how that is told.
  objective: { item: string; kind: string; text: string; goal?: string; raised?: string; worth?: number;
    weight?: number };
  rumours: string[];
  // How the land round it shows what keeps its bottom: a blight anyone can see while the keeper is there; what someone
  // with a skill reads in it, which says something of what the keeper is and cannot bear; and the land after.
  land?: { blight: string; signs: Record<string, string>; healed: string };
  // What it was dug or built for, left where it was got: so many of a local kind in rooms of these roles.
  ore?: { kind: string; name: string; worth: number; weight: number; text: string; roles: Record<string, number> };
  // What lies about in it, by Orsino's treasure tier: what its makers and those after them would have left; and the
  // wonders that would be in a place like it.
  finds?: Record<string, string[]>; wonders?: string[];
  // Its makers' own things of worth, by the same tiers: kinds of its own, drawn as treasure more often than gear,
  // and worth what a company is paid in experience when it sells them.
  valuables?: Record<string, Valuable[]>;
  // What came after: what each kind of kingdom that followed the makers did with it, and what each way that kingdom
  // fell left in it (see DeepHistory).
  after?: Record<string, Alteration[]>; fallen?: Record<string, Alteration[]>;
  // Rooms where a company can rest (a hall with a hearth, a store-room), if nothing finds it there first.
  rest?: string[];
  // How it looks from outside, with its old name cut over the way in ({oldup}).
  outside: string;
  // An earlier party's camp, left where they turned back (or did not): how it looks, and what their notebook says
  // at each depth.
  camp: { scene: string; journal: string[] };
}

// The deep sites a region's first makers may have left, one for each art that has one
// (data/generation/deep/<art>.json): the Delvers' mine, the Barrow-Kin's king-barrow, the Water-Wardens' cisterns,
// the Stone-Singers' hall. A country has one deep site, of the first of these its makers had, in that order.
export class DeepPurposes {
  static readonly all: Record<string, DeepPurpose> = { deep: mine as unknown as DeepPurpose,
    bone: barrow as unknown as DeepPurpose, water: waterworks as unknown as DeepPurpose,
    stone: singing as unknown as DeepPurpose };
  static readonly order = ['deep', 'bone', 'water', 'stone'];
  static of(art: string): DeepPurpose | undefined { return this.all[art]; }
  // A deep site as a work plan, so that it is placed, named and told of as the makers' other works are; what is
  // written of it is its own (DeepSites), not a plan's sections.
  static plan(purpose: DeepPurpose): WorkPlan {
    const p = purpose.plan;
    return { id: p.id, about: `the deep ${p.seen}`, art: purpose.art, kind: p.kind as WorkPlan['kind'],
      ground: p.ground as WorkPlan['ground'], seen: p.seen, names: p.names, danger: p.danger, sections: [], deep: true };
  }
}
