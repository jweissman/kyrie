import type { Read } from './country';
import type { Walked } from './walks';

// What the quantity gate reads, over the worlds and the walks (scripts/quantity/quantity.ts gathers them).
export interface Readings { golden?: Walked; gold: Walked[]; countries: Read[]; stranded?: Record<string, string[]> }
// A number as read: one for the measure, and where it is read per seed or walk, each (a band holds each).
export interface Reading { value: number | null; each?: Record<string, number>; note: string }
// band: held between a floor and a ceiling (either may be open); up, down: a ratchet that may only rise, or only
// fall; report: said, not held (yet).
export type Kind = 'band' | 'up' | 'down' | 'report';
// read: the Reckon method that works it out.
export interface Measure { id: string; label: string; kind: Kind; why: string; floor?: number; ceiling?: number;
  read: Reckoned }
export type Reckoned = 'fights' | 'bands' | 'fair' | 'economy' | 'treasure' | 'marks' | 'blank' | 'unwitnessed'
  | 'reach' | 'variety' | 'recurrence' | 'errand' | 'nowhere' | 'minutes' | 'hexes' | 'ready' | 'levels' | 'outfit'
  | 'stranded'
  | 'identity';

// The measures, each with its kind and why it is held so (doc/architecture/quantity.md says them at length). A band's
// floor and ceiling here are its first; baseline.json holds them after.
export class QuantityMeasures {
  static readonly all: Measure[] = [
    { id: 'fights', label: '1. Fights met per game hour, walked', kind: 'band', floor: 0.1, ceiling: 1.5,
      why: 'at least one fight in ten hours of play, and no more than one every forty minutes: conflict is met, and '
        + 'is not the whole of the game', read: 'fights' },
    { id: 'bands', label: '1. Bands within four hours of the start', kind: 'band', floor: 5, ceiling: 40,
      why: 'enough to choose among in the first hours; not a country of nothing but foes', read: 'bands' },
    { id: 'fair', label: '2. Bands that can kill, asked before (%)', kind: 'up',
      why: 'a fight that can end a first-level life is asked before it is begun (Grave: grave or deadly); it should be '
        + '100%, and may only rise', read: 'fair' },
    { id: 'economy', label: '3. A day\'s coin ÷ (starter kit + dearest ware)', kind: 'band', floor: 0.5, ceiling: 3,
      why: 'a day\'s work buys the kit and goes most of the way to the best thing in town, but not many times over: '
        + 'neither starved nor flooded', read: 'economy' },
    { id: 'treasure', label: '4. Treasure lying ÷ what the markets sell', kind: 'band', floor: 0.5, ceiling: 3,
      why: 'what can be found is worth spending, and the markets have enough to spend it on', read: 'treasure' },
    { id: 'marks', label: '5. Atlas marks per turn, walked', kind: 'band', floor: 1, ceiling: 8,
      why: 'every turn offers something marked to want, and not so much that the marks stop saying anything',
      read: 'marks' },
    { id: 'blank', label: '5. Turns with no mark (%)', kind: 'band', ceiling: 25,
      why: 'a quarter of turns with nothing marked leaves the player without a lead', read: 'blank' },
    { id: 'unwitnessed', label: '5. Marks without a witness', kind: 'down',
      why: 'a trust contract (AGENTS.md: a pip has a witness): it must be none, and may only fall', read: 'unwitnessed' },
    { id: 'reach', label: '6. Things worth doing within two hexes of the first town', kind: 'band', floor: 3,
      why: 'the first town has somewhere to go that repays going (OR-311, OR-312)', read: 'reach' },
    { id: 'variety', label: '7. Structural kinds of first-hour aim, across seeds', kind: 'up',
      why: 'the opening roster varies in shape, not in names (OR-310); may only rise', read: 'variety' },
    { id: 'recurrence', label: '7. First-hour aims met in every seed (%)', kind: 'down',
      why: 'the same situation in every world is sameness (OR-310); may only fall', read: 'recurrence' },
    { id: 'errand', label: '8. Median minutes travelled per aim', kind: 'down',
      why: 'hours of travel for trivial reasons (OR-310); may only fall', read: 'errand' },
    { id: 'nowhere', label: '8. Aims seen through by arriving alone (%)', kind: 'down',
      why: 'a fetch to a place with nothing to do there (OR-310); may only fall', read: 'nowhere' },
    { id: 'dungeon', label: '9. Minutes from the first town to the first dungeon', kind: 'band', floor: 15, ceiling: 180,
      why: 'the opening dungeon (the nearest site of two levels or more, each with a boss and a cache) is near and '
        + 'unmistakable (OR-311): not the town itself, not a day off', read: 'minutes' },
    { id: 'levels', label: '9. Levels of the first dungeon with a boss and a cache', kind: 'band', floor: 2,
      why: 'significant and deep: at least two levels of serious resistance, each with a boss and a treasure cache '
        + '(the owner, 24 November: OR-311)', read: 'levels' },
    { id: 'hexes', label: '9. Hexes from the first town to the first dungeon', kind: 'band', ceiling: 2,
      why: 'in the town\'s hex or within two (OR-311)', read: 'hexes' },
    { id: 'ready', label: '9. Companion, light and provisions in reach of it (of 3)', kind: 'band', floor: 3,
      why: 'notice, prepare, recruit, explore (OR-311): each to be had in the first town', read: 'ready' },
    { id: 'outfit', label: '9. At the first dungeon: a companion, and light, provisions, gear found near its way in (of 4)',
      kind: 'report', why: 'ideally (the owner, 24 November: OR-311): a companion at the dungeon, and searchable gear '
        + 'near the secure entry; said, not yet held', read: 'outfit' },
    { id: 'stranded', label: '10. Authored content no played world reaches', kind: 'down',
      why: 'content that never reaches a player is cost without return; may only fall', read: 'stranded' },
    { id: 'identity', label: 'Consequential people with a name (%)', kind: 'report',
      why: 'OR-304, OR-281: unbaselined at first', read: 'identity' }];
}
