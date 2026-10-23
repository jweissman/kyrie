import type { Counter } from './trade-model';
import type { Danger } from '../presentation/danger-sense';

// Renderer-independent game screen contract. Every executable leaf carries a PlayerView command id; the client
// never decides what is legal. Rows describe what the party can perceive at its current location.

export type Transition = 'walk' | 'enter' | 'leave' | 'ascend' | 'descend' | 'level' | 'travel' | 'cross_plane';
export type Passage = 'open' | 'guarded' | 'hazard' | 'climb' | 'hidden' | 'door';

export interface Act {
  key: string; label: string; command?: string; minutes?: number; risk?: boolean; children?: Act[];
  // What the action's author says it means, shown before it is chosen.
  about?: string;
  // Who in the company makes it possible (the one with the skill it needs), or why it cannot be done.
  by?: string[]; disabled?: string;
  // The names of what it is done to or with, to tell it from another choice that reads the same.
  bound?: string[];
}
export interface PlaceRef { id: string; name: string; kind: string }
export interface ExitRow {
  id: string; kind: 'exit'; name: string; destination: PlaceRef; transition: Transition; passage: Passage;
  scope?: string; via?: string; blocked?: string; visited: boolean; acts: Act[]; way?: string; hazard?: string;
}
export interface TargetRow {
  id: string; kind: 'person' | 'creature' | 'animal' | 'thing' | 'feature'; name: string; note?: string; activity?: string;
  // What a group is, seen from outside: how many of what, how seasoned, how hurt.
  look?: string; state?: 'dead' | 'down'; acts: Act[];
  // More than one of them (the goblins), to be spoken of as they are.
  many?: boolean;
  // What can be seen of them now ("Wren stands with one hand shading her eyes"), told with them, not in the prose.
  says?: string[];
  // For those the company could fight: how the most seasoned member reckons a fight would go.
  reckoning?: { danger: Danger; text: string };
  // Someone who has joined the company: not here so much as with you, and to be talked to wherever you are.
  companion?: boolean;
  // The painting shown beside them: for what they do, not of them (see Likeness), and how it is credited.
  // A painting of someone who could be them: the small copy, the large one for conversation, where the face sits (a
  // percentage of the height, for cropping), and who painted it, as far as the painting itself says.
  portrait?: { src: string; large: string; focus: number; credit?: string };
}
export interface ItemRow {
  id: string; name: string; kind: string; description: string; owner: string; ownerName: string;
  equipped: boolean; slot?: string; acts: Act[];
  // Using it brings light.
  light?: boolean;
}
export interface MemberRow {
  id: string; ref?: string; name: string; line: string; background?: string; level: number;
  hp: number; maxHp: number; mana: number; maxMana: number; slots?: number[]; maxSlots?: number[];
  // Spells by level: each prepared one, and whether it is still ready to cast.
  spells?: { level: number; name: string; ready: boolean }[];
  experience: number; gold: number;
  // What the next level brings in kind (a technique, a calling trait, a new level of spells), if anything.
  next?: string[];
  // How far they are from it, in a sentence.
  progress?: string;
  // Conditions that harm by name, and those that help (a lit torch) apart.
  conditions: string[]; boons?: string[];
  abilities: { id: string; name: string; text: string; cost: number; price: string }[];
  attributes: Record<string, number>; acts: Act[];
  overlays?: { id: string; name: string; role: string; grants: string[] }[];
}
export interface LogEntry { at: string; title: string; lines: string[]; tone: 'act' | 'fight' | 'note' | 'fail' }
export interface Screen {
  title: string; clock: string; elapsed: number; running: boolean;
  // The day as the calendar has it ("20 Leaffall", and in full with the season), and the weather, when known.
  date?: { short: string; long: string }; weather?: string;
  path: PlaceRef[]; place: PlaceRef; prose: string[];
  // Every observation perceived here, as told, for the narrator to choose among.
  observed: { id: string; text: string }[];
  // The company stands in the dark without a light.
  dark?: boolean;
  exits: ExitRow[]; people: TargetRow[]; things: TargetRow[];
  party: MemberRow[]; items: ItemRow[]; camp: Act[];
  purse: { coin: number; rations: number; other: string[] };
  // What the company knows, newest first, each with how it came to know it ("Agnes told you", "you saw it") and when.
  // What the company knows, and how sure it can be: seen or found for itself, heard and since borne out, or only heard.
  knowledge: { text: string; how: string; kind: 'seen' | 'confirmed' | 'reported' | 'known' }[];
  deadlines: string[]; capabilities: string[];
  // The formations the company makes (Orsino's party traits), and what each perk does.
  formations: { name: string; perks: string[] }[];
  // Merchants here: what each sells, at what price and stock, and what each buys.
  trade: Counter[];
  // Lines of this scene the company has not seen before, at a place it has been before: what has changed.
  fresh: string[];
  map: { id: string; name: string; zone: string; visited: boolean; here: boolean }[];
  chart?: Chart; region?: RegionChart; objectives: string[];
  expedition: { time: string; daylight: string; rations: number; hungry: boolean; weary?: boolean; nextMeal?: string };
  unplaced: Act[];
}
export interface Chart {
  places: { id: string; name: string; x: number; y: number; visited: boolean; here: boolean; area: string;
    external?: boolean }[];
  edges: { id: string; name: string; from: string; to: string; status: string; oneWay: boolean; explored: boolean }[];
}
export interface RegionChart {
  // An area's form is the land it is, when its region says (river, wood, lake, pass, peak); the terrain is the
  // region's own (forest, marsh, mountain, frost), which the chart is textured with.
  areas: { id: string; name: string; kind: string; x: number; y: number; visited: boolean; here: boolean;
    form?: string }[];
  terrain?: string;
  // Each known way between areas; on a region with land, the cells it runs over (along a road, or its own path) and
  // what shuts it, if anything does.
  edges: { from: string; to: string; label: string; status: string; course?: number[]; road?: boolean;
    reason?: string }[];
  // The area each known place lies in, so a journey to a place can be drawn between areas.
  within: Record<string, string>;
  // The region's land, as far as the company knows it: every cell's cover, the rivers and the known roads' cells,
  // and which cells it knows; the cell the company is at; each known place that is not a settlement or wild country
  // (a landmark, a site, a march-stone); the known cells of each stretch of wild country; and what names mean.
  land?: { width: number; height: number; cover: string; rivers: number[][]; roads: Record<string, number[]>;
    known: number[]; here?: number;
    marks: { id: string; name: string; cell: number; kind: string; visited: boolean; here: boolean }[];
    zones: { id: string; name: string; form?: string; cells: number[] }[];
    glosses: Record<string, string> };
}
export interface CombatScreen {
  turn: number; actor: string; actorName: string; ours: boolean; outcome: string | null;
  // The round the fight is in: each begins with everyone's order drawn again.
  round: number;
  foes: CombatantRow[]; allies: CombatantRow[];
  abilities: { id: string; name: string; text: string; cost: number; price: string; cooldown: number; scope: string;
    spell?: { level: number; ready: number };
    // How much good it would do now, as the game's own tactics weigh it: the best of its uses.
    rank?: number;
    // Each target, with how it takes the ability's damage, and for a blow, the chance it lands.
    targets: { id: string; name: string; against?: string; odds?: number }[] }[];
  // Who is still to act this round, in order, the one acting first.
  order: string[];
  // The laws of the place the fight is fought in, held by everyone in it.
  laws?: { name: string; text: string }[];
  // Each exchange (someone acts, and what follows) told as the company saw it, with the dice behind it, numbered from
  // the start of the fight, with its round and who acted.
  log: string[]; exchanges: { n: number; text: string; detail: string; round: number; actor?: string }[];
}
export interface CombatantRow {
  id: string; name: string; line: string; hp: number; maxHp: number; mana: number; maxMana: number;
  slots?: number[]; maxSlots?: number[];
  // Conditions by name: those that hurt, and those that help (a guard, a blessing).
  statuses: string[]; boons?: string[]; acting: boolean; down: boolean;
  // For a foe: what it means to do this round, and the damage it shrugs off or fears.
  intent?: string; defenses?: string;
}
