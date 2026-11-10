import type { QuarterRow } from './quarters';
import type { Counter } from './trade-model';
import type { Danger } from '../presentation/danger-sense';
import type { CharacterSheet, Development, Recruit } from '../presentation/character-sheet';
import type { Face } from '../paintings/company-portraits';

// Renderer-independent game screen contract. Every executable leaf carries a PlayerView command id; the client
// never decides what is legal. Rows describe what the party can perceive at its current location.

export type Transition = 'walk' | 'enter' | 'leave' | 'ascend' | 'descend' | 'level' | 'travel' | 'cross_plane';
export type Passage = 'open' | 'guarded' | 'hazard' | 'climb' | 'hidden' | 'door';

export interface Act {
  key: string; label: string; command?: string; minutes?: number; risk?: boolean; children?: Act[];
  // What kind of act it is (its action's schema: talk_to, take_lodging, look_closely…), whether or not it can be done
  // now: what the page goes by, never the command's or the label's words (the architecture review's P0).
  does?: string;
  // What it is done to or with: the entities its action binds, besides who does it and where (an item, its kind, a
  // merchant), by id.
  targets?: string[];
  // Whether doing it takes the company somewhere (its action moves it), as against what is done at a way.
  moves?: boolean;
  // What the action's author says it means, shown before it is chosen.
  about?: string;
  // Who in the company makes it possible (the one with the skill it needs), or why it cannot be done.
  by?: string[]; disabled?: string;
  // The names of what it is done to or with, to tell it from another choice that reads the same.
  bound?: string[];
  // What cannot be undone by it, said before it is done.
  grave?: string;
  // An answer to a question the company has just been put (Topic … answering), told with it, not among the rest.
  answer?: boolean;
  // When a night's sleep it is would end, as the clock says it ("5:00 p.m."): a bed taken in the morning sleeps eight
  // hours, until the evening, and said only "8h" (the cold evaluation).
  until?: string;
  // Whether it gives the company light (a spell of light: see Illumination).
  light?: boolean;
  // One of the place's own, an adventure's or a country's (the swing-boat, a penny a stair), not one done anywhere.
  own?: boolean;
  // One of those own that is done, not said to anyone (no speaker): kept beside a person, not folded into talking to
  // them ("Keep still, as the Wainscot does" had become "Talk to the Lady": Behind the Wainscot's F3).
  deed?: boolean;
  // A fight it begins (a challenge to single combat), weighed up before it is chosen, as an attack is.
  reckoned?: { danger: Danger; text: string };
}
// underground: below the ground (a cellar, a crypt, a mine), where the town's walks and the map are not to hand; and
// how many storeys down (see Depth).
// open: said to be under the sky though within a level or a building (a keep's bailey, a barrow's forecourt).
export interface PlaceRef {
  id: string; name: string; kind: string; underground?: boolean; open?: boolean; depth?: number;
}
export interface ExitRow {
  id: string; kind: 'exit'; name: string; destination: PlaceRef; transition: Transition; passage: Passage;
  scope?: string; via?: string; blocked?: string; visited: boolean; acts: Act[]; way?: string; hazard?: string;
  // What the hazard on it does to whoever goes first, on an average roll.
  harm?: number;
  // A way about the settlement or site the company is in (a lane to the hall, a shaft to the level below), however
  // long it takes: not a way out.
  local?: boolean;
  // A way into another hex of the country (the next stretch of the wild, the road's next hex, a town further off):
  // taken on the world map only (see Passages.crosses).
  crosses?: boolean;
  // The cell of the land it comes to, for the map to take it from.
  cell?: number;
  // A way into an enclosure that more than one way leads into: said by its own name.
  several?: boolean;
  // A way that goes one way only (the great pipe, feet first): said by its own name, and asked about again.
  oneWay?: boolean;
  // A way that does not say where it goes, to a company that has not been there: said by its own name (LOR-11).
  unmarked?: boolean;
  // Which way a step across the open country goes (north-east), as the land lies (see Headings).
  bearing?: string;
}
export interface TargetRow {
  id: string; kind: 'person' | 'creature' | 'animal' | 'thing' | 'feature'; name: string; note?: string; activity?: string;
  // The emblem drawn for them where there is no likeness: their people's, or an animal's (see Emblems).
  emblem?: string;
  // What a group is, seen from outside: how many of what, how seasoned, how hurt.
  look?: string; state?: 'dead' | 'down'; acts: Act[];
  // A device that fights without being a creature (a ward, a turret): broken, not dead (register M19-238).
  device?: boolean;
  // A treasure lying where the company is, there to be taken (not for sale).
  valuable?: boolean;
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
  // Someone who would join the company: what they would bring, seen before they are asked.
  recruit?: Recruit;
  // Someone the company has a stake in (its family; whoever an aim it holds turns on): met first (see Stakes).
  stake?: boolean;
  // Someone with something written to be asked of them (a Topic): talking to them can go somewhere.
  asked?: boolean;
  // Someone with something for the company now: a thing to be said to them, open now, that pays it (see Owed).
  owed?: boolean;
  // A creature's kind, for its entry in the encyclopedia: the base kind's id, and the kind's name to search by.
  entry?: { id: string; name: string };
}
export interface ItemRow {
  // kind: the catalog's id for what it is (torch, lamp_oil), not its name.
  id: string; name: string; kind: string; description: string; owner: string; ownerName: string;
  equipped: boolean; slot?: string; acts: Act[];
  // Where it is kept: worn or in hand, among the supplies a journey uses up, or carried (see ItemStow); and, for what
  // was packed at the start, where from (the calling's kit, the background's), so a bundle of firewood is accounted
  // for (the owner, 9 November: "firewood in my inventory without understanding how or why").
  stow: 'worn' | 'supplies' | 'carried'; packed?: string;
  // Using it brings light.
  light?: boolean;
  // What it is kept for, when its use is not offered now (see ItemUses).
  kept?: string;
  // Which way it points, where it points to somewhere the canon names (the Dun Rìerdan waystone: see Seats).
  points?: string;
  // Its kind's plate, where one is cut (see ItemPlates): what the pack shows it by.
  plate?: { src: string; large: string; focus: number; credit?: string };
}
export interface MemberRow {
  id: string; ref?: string; name: string; line: string; background?: string; level: number;
  // The emblems of their people and calling, where each has one, drawn beside the line (see Emblems).
  emblems?: string[];
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
  // Down: what follows for them, which no cure changes (see Standing).
  fallen?: string;
  abilities: { id: string; name: string; text: string; cost: number; price: string }[];
  attributes: Record<string, number>; acts: Act[];
  // The member as the rules have them (qualities as they stand, how they fight and are fought, saves, skills), and a
  // level's development still to spend, each way with what it would change (see CharacterSheets).
  sheet?: CharacterSheet; development?: Development;
  // The painting chosen to be them, where one was (the protagonist's, at creation).
  portrait?: { src: string; large: string; focus: number; credit?: string };
  // A portrait of someone of their calling, people and presentation, where one fits (see CompanyPortraits).
  face?: Face;
  overlays?: { id: string; name: string; role: string; grants: string[] }[];
}
export interface LogEntry { at: string; title: string; lines: string[]; tone: 'act' | 'fight' | 'note' | 'fail' }
export interface Screen {
  title: string; clock: string; elapsed: number; running: boolean;
  // Who is warning the company off where it stands, and the minutes they will wait (see Patience).
  warned?: { by: string; left: number; id?: string };
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
  // What the company has seen through, and when (see SeenThrough).
  done: string[];
  deadlines: string[]; capabilities: string[];
  // The formations the company makes (Orsino's party traits), and what each perk does.
  formations: { name: string; perks: string[] }[];
  // Merchants here: what each sells, at what price and stock, and what each buys.
  trade: Counter[];
  // Lines of this scene the company has not seen before, at a place it has been before: what has changed.
  fresh: string[];
  map: { id: string; name: string; zone: string; visited: boolean; here: boolean }[];
  chart?: Chart; region?: RegionChart; plan?: Plan;
  // What the company means to do, in words, the aim followed first; and each by its id: the one followed (see
  // Undertakings), whether the player chose it, and the company's own errand.
  objectives: string[];
  // Each with the places it is about, by id, and who it names that might know where (by name).
  aims?: { id: string; text: string; followed?: true; chosen?: true; own?: true; places?: string[]; who?: string[] }[];
  // Whom and what the company's aims and family name (people, places, ways): met and gone to first (see Stakes).
  aimed?: string[];
  expedition: { time: string; daylight: string; rations: number; hungry: boolean; weary?: boolean; nextMeal?: string;
    // The company's light, where it matters (somewhere unlit, or a light burning): who carries what is lit and how
    // long it has left, and what there is to spare. "Rharash's torch, 40 minutes left · 2 torches to spare".
    light?: string;
    // The flame it goes by there, if one burns: its kind, who carries it, and the minutes it has left (see the stage's
    // glow, which rises with it and draws in as it runs down).
    flame?: { kind: 'lantern' | 'torch' | 'candle' | 'conjured'; who: string; left?: number } };
  unplaced: Act[];
  // The places the company knows the way to and could set out for, more than a step away, with the legs of the way;
  // and those it could set out toward, as far as the wild country a place is said to lie in.
  // A site's scale, as its tellers would put it (see SiteScale).
  destinations?: { id: string; name: string; minutes: number; toward?: string; scale?: string;
    legs: { way: string; to: string; minutes: number }[] }[];
  // The towns the known roads go to besides, which the map and the notes can set out for (not the place's own leads).
  roads?: NonNullable<Screen['destinations']>;
  // The other places of the town the company is in, further than a step (by its square), to walk to directly.
  around?: NonNullable<Screen['destinations']>;
  // The quarters of the town the company is in, its own first (see Quarters): what Go… sets the town out by.
  quarters?: QuarterRow[];
  // Every other place the map draws that the company knows a way to (see Itineraries.mapped), to set out for from it.
  mapped?: NonNullable<Screen['destinations']>;
  // Where in the settlement the company is in what anyone needs is found (see Services): each need, who meets it,
  // where, whether that is here, and what of it they have.
  services?: { need: string; who: string; place: PlaceRef; here: boolean; has: string[] }[];
}
// The plan of the town or the building the company is in (see TownPlan): each place a cell on its grid, by its id
// (a building's, the room its door opens into; a door out, the place outside), and the ways between.
export interface Plan {
  name: string; kind: 'settlement' | 'building' | 'site' | 'level' | 'under';
  cells: { id: string; name: string; x: number; y: number; indoors: boolean; here: boolean; been: boolean;
    building?: boolean; door?: boolean;
    // Whom the company last spoke with there, by name (see CompanyRecall): what it knows, not where they are now.
    met?: string[] }[];
  lanes: { from: string; to: string }[];
}
export interface Chart {
  // A way out of the plan is drawn as a place beyond it (external); one to another level of the site goes up or down.
  places: { id: string; name: string; x: number; y: number; visited: boolean; here: boolean; area: string;
    external?: boolean; rise?: 'up' | 'down' }[];
  edges: { id: string; name: string; from: string; to: string; status: string; oneWay: boolean; explored: boolean }[];
  // The level of a site it is a plan of (the adit level), drawn even where the site stands in wild country; and the
  // site's levels the company has been on, top to bottom, this one among them.
  level?: string;
  levels?: { name: string; here: boolean }[];
}
// How much the company knows of a place on its map (the owner's corrections of 2026-10-29, OWN-23, OWN-24, OWN-26):
// only heard of (told, rumoured, read in a notice), its name as heard and where it is said to be, not the land about
// it nor the way to it; something near the country known that it has not made out, no name and no kind; seen (from
// afar, or come upon), its look and the name it was given; been to, all of it.
export type Knowing = 'heard' | 'unknown' | 'seen' | 'visited';
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
  // and which cells it knows; the cell the company is at; each place known of that is not a settlement or wild
  // country (a landmark, a site, a march-stone), with how much of it is known (see Knowing), and how much of each
  // town; the known cells of each stretch of wild country; and what names mean. The board and the flat map draw
  // both by these, and work out nothing of their own about what is known.
  land?: { width: number; height: number; cover: string; rivers: number[][]; roads: Record<string, number[]>;
    known: number[]; here?: number;
    marks: { id: string; name: string; cell: number; kind: string; visited: boolean; here: boolean; state: Knowing }[];
    towns: Record<string, Knowing>;
    zones: { id: string; name: string; form?: string; cells: number[] }[];
    glosses: Record<string, string>;
    // Where an authored region's places stand on its land, a stretch each (see AuthoredLand): the rooms of the one
    // the company is in are drawn on it.
    blocks?: Record<string, number[]>;
    // The id of a generated country's stretches of open country, but for each one's cell (region__t), to go to one.
    tracts?: string;
    // Where a journey to each cell goes (a stretch of open country; an authored place), by cell: the engine's own.
    goes?: Record<number, string> };
}
export interface CombatScreen {
  turn: number; actor: string; actorName: string; ours: boolean; outcome: string | null;
  // The round the fight is in: each begins with everyone's order drawn again.
  round: number;
  foes: CombatantRow[]; allies: CombatantRow[];
  abilities: { id: string; name: string; text: string; cost: number; price: string; cooldown: number; scope: string;
    // What it does besides a blow, for its card (see MechanicsText.gist): nothing for a plain blow or a spell.
    gist?: string;
    spell?: { level: number; ready: number };
    // How much good it would do now, as the game's own tactics weigh it: the best of its uses.
    rank?: number;
    // Each target, with how it takes the ability's damage, and for a blow, the chance it lands.
    targets: { id: string; name: string; against?: string; odds?: number }[];
    // For running, the chance of getting away now; for a thing carried to use up, how many of it the one acting has.
    odds?: number; carried?: number }[];
  // The moment before a fight that came at the company closes: it acts first, and can get back the way it came; and
  // how the company reckons the fight from there ("It is more than you can take.").
  moment?: 'seen' | 'sprung'; reckoned?: string;
  // How the fight stands as the company reckons it now, every round it is not over (the owner, 6 November: a plain
  // danger line, not a ledger to read the odds from).
  standing?: { danger: Danger; text: string };
  // Who is still to act this round, in order, the one acting first.
  order: string[];
  // The laws of the place the fight is fought in, held by everyone in it.
  laws?: { name: string; text: string }[];
  // Each exchange (someone acts, and what follows) told as the company saw it, with the dice behind it, numbered from
  // the start of the fight, with its round and who acted.
  log: string[]; exchanges: { n: number; text: string; detail: string; round: number; actor?: string }[];
  // A fight that has ended: how it ended, and what was gained by it, held on its page until the player goes on.
  after?: string[];
}
export interface CombatantRow {
  id: string; name: string; line: string; hp: number; maxHp: number; mana: number; maxMana: number;
  slots?: number[]; maxSlots?: number[];
  // Conditions by name: those that hurt, and those that help (a guard, a blessing).
  statuses: string[]; boons?: string[]; acting: boolean; down: boolean;
  // For a foe: what it means to do this round, and the damage it shrugs off or fears.
  intent?: string; defenses?: string;
  // For a member of the company: their portrait, as on their page (see MemberRow).
  face?: Face;
}
