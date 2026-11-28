import type { Read } from './country';
import type { Walked } from './walks';
import type { Delved } from './delver';
import type { Trip } from './expeditions';
import type { Led } from './leads';
import type { Ladder } from './ladder';
import type { Painted } from './painted';

// What the quantity gate reads, over the worlds and the walks (scripts/quantity/quantity.ts gathers them).
export interface Readings { golden?: Walked; gold: Walked[]; countries: Read[]; stranded?: Record<string, string[]>;
  delved?: Delved[]; expeditions?: Trip[]; ladder?: Ladder; leads?: Led[];
  // The five expeditions of each reference life (QuantityExpeditions.lives), the first's also as expeditions.
  lives?: Record<string, Trip[]>;
  takes?: { id: string; take: number }[]; painted?: Painted[] }
// A number as read: one for the measure, and where it is read per seed or walk, each (a band holds each).
export interface Reading { value: number | null; each?: Record<string, number>; note: string }
// band: held between a floor and a ceiling (either may be open); up, down: a ratchet that may only rise, or only
// fall; report: said, not held (yet).
export type Kind = 'band' | 'up' | 'down' | 'report';
// read: the Reckon method that works it out.
export interface Measure { id: string; label: string; kind: Kind; why: string; floor?: number; ceiling?: number;
  read: Reckoned }
export type Reckoned = 'fights' | 'places' | 'roads' | 'returned' | 'again' | 'bands' | 'fair' | 'economy' | 'treasure' | 'marks' | 'blank' | 'unwitnessed'
  | 'reach' | 'variety' | 'recurrence' | 'errand' | 'nowhere' | 'minutes' | 'hexes' | 'ready' | 'levels' | 'outfit' | 'handed'
  | 'stranded' | 'bestiary' | 'delved' | 'renewed' | 'prepared' | 'routine' | 'answered' | 'kept'
  | 'identity' | 'mouth' | 'strayed' | 'colours' | 'connected' | 'aimless' | 'rungs' | 'rung1' | 'rung2' | 'bought'
  | 'take1' | 'take2' | 'takeBelow' | 'fifth' | 'unpainted' | 'forebode' | 'swift' | 'forced';

// The measures, each with its kind and why it is held so (doc/architecture/quantity.md says them at length). A band's
// floor and ceiling here are its first; baseline.json holds them after.
export class QuantityMeasures {
  static readonly all: Measure[] = [
    { id: 'places', label: '1. Fights per game hour at combat places, walked', kind: 'band', floor: 0.5, ceiling: 4,
      why: 'combat dense in specific places: in a site or under a town, a fight at least every two hours and not '
        + 'more than one every quarter hour (the owner, 24 November, OR-321)', read: 'places' },
    { id: 'delved', label: '1. Fights per game hour delving the first dungeon (a delver)', kind: 'up',
      why: 'what a player meets who goes down into the first dungeon, the reference game\'s whole point (the owner, 26 '
        + 'November: "3-10x more combat"); the golden walk and the gold-follower never go down; may only rise',
      read: 'delved' },
    { id: 'renewed', label: '1. Expeditions after the first that open an option and change the loop (of 4)', kind: 'report',
      why: 'every expedition after the first creates at least one new option and one persistent change (the economy '
        + 'review, §8 Priority 0, OR-1390; scripts/quantity/expeditions.ts); said, not held, for it does not hold yet '
        + '(OR-1442); a ratchet once it does',
      read: 'renewed' },
    { id: 'prepared', label: '1. Distinct preparations over five expeditions', kind: 'report',
      why: 'the review\'s disconfirming test: five trips whose preparations are the same (OR-1440); said, not held',
      read: 'prepared' },
    { id: 'answered', label: '1. Kinds of answer to what is met below, over five expeditions', kind: 'up',
      why: 'each of the first dungeon\'s levels its own conflict grammar (OR-1392): fought, gone round, listened for, '
        + 'talked round, lied to, warned off, asked, searched, a thing worked, a trap risked; may only rise',
      read: 'answered' },
    { id: 'routine', label: '1. Traversal and administration after the first expedition (%)', kind: 'down',
      why: 'the review\'s first threshold, at most a fifth of post-first moves (§9.3, OR-1440, OR-1395): a deep level\'s '
        + 'known, unchanged ground crossed in one act (OR-1448), the way down made sure (Descents); read by presses, a '
        + 'journey one, its legs the same moves as walked; may only fall, and only beside kept, which says the '
        + 'world time and the ground known did not fall with it',
      read: 'routine' },
    { id: 'kept', label: '1. Watches spent below and above after the first expedition', kind: 'report',
      why: 'the review\'s acceptance for compressing routine: no fall in meaningful world time, nor in the company\'s '
        + 'sense of where it is (the rooms below it has been in, by each return); said beside routine',
      read: 'kept' },
    { id: 'roads', label: '1. Fights per game hour on the roads, walked', kind: 'report',
      why: 'roads with a little more danger (the owner, 24 November): said, not held, a modest chance', read: 'roads' },
    { id: 'returned', label: '1. Combat places quests return a company to, near the first town', kind: 'band', floor: 2,
      why: 'two or three easy-to-find places where fights are dense, which two aims or more send the company to, '
        + 'the first dungeon among them (OR-321)', read: 'returned' },
    { id: 'again', label: '1. Expeditions back to a combat place that still meet a fight and reward, walked',
      kind: 'band', floor: 1, why: 'places that reward multiple expeditions, not only the first (OR-321)',
      read: 'again' },
    { id: 'bands', label: '1. Bands within four hours of the start', kind: 'band', floor: 5, ceiling: 40,
      why: 'enough to choose among in the first hours; not a country of nothing but foes', read: 'bands' },
    { id: 'fair', label: '2. Bands that can kill, asked before (%)', kind: 'up',
      why: 'a fight that can end a first-level life is asked before it is begun (Marks.asks: grave, deadly, or '
        + 'its reckoning\'s fights felled the one who plays); it should be '
        + '100%, and may only rise', read: 'fair' },
    { id: 'forebode', label: '2. First-dungeon bands that fall on whoever comes in, with a way to them under two signs',
      kind: 'band', ceiling: 0, why: 'an unwarned fight is only very occasionally lethal, and the place itself gives '
        + 'warning (the owner, 27 November; OR-1854): every way to a band that falls on whoever comes in, or one of '
        + 'the deep\'s worst, tells it by two signs of its own kind (its sound, its spoor), the way in from outside '
        + 'among them; none, by the generator\'s own observations', read: 'forebode' },
    { id: 'swift', label: '1. Rounds of a fight with a swarm of beasts (three or more of a kind), delved (median)',
      kind: 'down', why: 'small fights quick, so that big ones matter (OR-1855): a wary band of beasts loses heart at '
        + 'the first of it to fall; a bear, a pack of two, the dead are no swarm. Three rounds or fewer is the aim, a '
        + 'band once it holds; the deep\'s first bands, whose death the deep renewed waits on, still fight to the last '
        + '(OR-1864); may only fall (28 November: from 6)', read: 'swift' },
    { id: 'forced', label: '2. Expeditions of five forced back hurt, or lost (%)', kind: 'report',
      why: 'OSR-level difficulty with fair warning (the owner, 27 November): the deep should send a careful company '
        + 'home hurt some of the time, never kill it unwarned; said, a band once it has been read on CI', read: 'forced' },
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
    { id: 'handed', label: '8. First-town aims handed out, not uncovered (%)', kind: 'down',
      why: 'a first town\'s jobs are found by looking and asking (a question of the right person, a search, a check), '
        + 'not given out constantly (the owner, 24 November); may only fall', read: 'handed' },
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
      kind: 'band', floor: 4, why: 'a companion at the dungeon, and searchable gear near the secure entry (the owner, '
        + '24 November: OR-311): someone to take on, and a light, food and gear found by searching, by its way in',
      read: 'outfit' },
    { id: 'bestiary', label: '1. Kinds of the bestiary the deep can field', kind: 'up',
      why: 'as much of the bestiary as possible deployed (the owner, 26 November; OR-1230): its tables and rooms, and '
        + 'beside it every generated placement; may only rise', read: 'bestiary' },
    { id: 'stranded', label: '10. Authored content no played world reaches', kind: 'down',
      why: 'an executable spell offered by an installed calling’s SpellSelection plan is reachable without an authored '
        + 'text mention; other content no world reaches is cost without return, so this may only fall', read: 'stranded' },
    // Pointless wandering on the reference game (the owner's playtest of 27 November, OR-1500:
    // scripts/quantity/leads.ts), over fifteen lives (warrior, mage and thief, each begun for each of the reference
    // town's five reasons) on s0.
    { id: 'mouth', label: '9. Moves from a new life to the first dungeon\'s mouth, by the page\'s leads (median)',
      kind: 'down', why: 'the first dungeon is unmistakable from the first town: the page\'s gold leads to it within a '
        + 'few acts of a new life (OR-1501); may only fall (27 November: from 22)', read: 'mouth' },
    { id: 'strayed', label: '9. Lives whose wanderer never comes to the first dungeon\'s mouth in the first hour',
      kind: 'down', why: 'its mouth is a named, seen point of interest, never found by circling (OR-1501): a player '
        + 'who never follows the gold still comes on it; may only fall (27 November: from 4)', read: 'strayed' },
    { id: 'colours', label: '5. Atlas colours met above ground in the first hour (median, of 5)', kind: 'up',
      why: 'opportunities of each kind are where the company can find them, the town and the woods too (OR-1500); '
        + 'may only rise (27 November: from 2)', read: 'colours' },
    { id: 'connected', label: '8. First-hour aims seen through that open something later play reads (%)',
      kind: 'report', why: 'a job resolves into a person, a place, a fact or the next job (OR-1503), never a fetch that '
        + 'ends where it ends; said, a ratchet up once it moves', read: 'connected' },
    { id: 'aimless', label: '5. Moves with nothing worth going to in reach, first hour (median a life)', kind: 'down',
      why: 'every place a company stands in shows what in reach is worth going to, and no stretch is blank (OR-1502); '
        + 'may only fall (27 November: from 14, then 1 with the way on marked, OR-1502)', read: 'aimless' },
    // The economy's ladder (OR-1124, OR-1125: scripts/quantity/ladder.ts), read from the five expeditions on s0.
    { id: 'rungs', label: '3. Rungs of the ladder with a ware in the reference town (of 4)', kind: 'band', floor: 4,
      why: 'something worth saving for at each rung: a start\'s purse, the first rung (26 to 250), the second (251 to '
        + '1,500), the long haul (OR-1124)', read: 'rungs' },
    { id: 'rung1', label: '3. Expeditions to afford the first rung (its first ware)', kind: 'band', floor: 1,
      ceiling: 2, why: 'OR-1124: the first rung after one or two expeditions, read from the gold-follower\'s five '
        + 'expeditions (the dearest said beside it); a band since the take met it (OR-1520); the purse the median of '
        + 'three reference lives, s0, s4 and s7 (OR-1622: one life is a lottery)', read: 'rung1' },
    { id: 'rung2', label: '3. Expeditions to afford the second rung (its first ware)', kind: 'band', floor: 3,
      ceiling: 6, why: 'OR-1124: the second rung after three to six expeditions; past the fifth return, the purse\'s '
        + 'mean gain carried on, 99 for none; a band since the take met it (OR-1520)', read: 'rung2' },
    { id: 'bought', label: '3. One expedition\'s best take against a rung\'s whole shelf (%, the most)', kind: 'band',
      ceiling: 100, why: 'no rung bought out by one expedition (OR-1124)', read: 'bought' },
    // The dungeon's treasure by level, against the ladder (OR-1129): each level's take pays the rung of its depth.
    { id: 'take1', label: '3. Coin and what a dealer pays for the first level of the reference dungeon', kind: 'band',
      floor: 26, ceiling: 250, why: 'the first level pays the first rung (26 to 250), so that the next rung is a '
        + 'reason to go deeper (OR-1129); read on s0 before anyone goes down', read: 'take1' },
    { id: 'take2', label: '3. Coin and what a dealer pays for the second level of the reference dungeon', kind: 'band',
      floor: 251, ceiling: 1500, why: 'the second level pays the second rung (251 to 1,500: OR-1129)', read: 'take2' },
    { id: 'takeBelow', label: '3. Coin and what a dealer pays for the level below the makers\' works', kind: 'band',
      floor: 1501, why: 'the old dark under the reference dungeon pays the long haul (above 1,500): a reason to go '
        + 'deeper than the makers did (OR-1622)', read: 'takeBelow' },
    { id: 'fifth', label: '3. What the fifth expedition brings home (coin)', kind: 'band', floor: 26,
      why: 'the fifth expedition is worth making: at least a first-rung ware (26), by what the world does when the '
        + 'company is away and below where it has been (OR-1622); its share of the best take said beside it',
      read: 'fifth' },
    // Painting misses in a new life's first steps (the owner, 27 November: scripts/quantity/painted.ts).
    { id: 'unpainted', label: '11. Frames of a new life\'s first five steps with no painting, one against the sky, or a '
      + 'talk with no portrait (%)', kind: 'band', ceiling: 2, why: 'the painting is the place (the resting scene) and a '
      + 'conversation is its speaker\'s painting: "no more than 2% paintings unresolved in the first 5 steps of 100 '
      + 'random worlds" (the owner, 27 November)', read: 'unpainted' },
    { id: 'identity', label: 'Consequential people with a name (%)', kind: 'report',
      why: 'OR-304, OR-281: unbaselined at first', read: 'identity' }];
}
