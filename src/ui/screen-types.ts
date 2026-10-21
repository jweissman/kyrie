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
}
export interface PlaceRef { id: string; name: string; kind: string }
export interface ExitRow {
  id: string; kind: 'exit'; name: string; destination: PlaceRef; transition: Transition; passage: Passage;
  scope?: string; via?: string; blocked?: string; visited: boolean; acts: Act[]; way?: string; hazard?: string;
}
export interface TargetRow {
  id: string; kind: 'person' | 'creature' | 'thing' | 'feature'; name: string; note?: string; activity?: string;
  // What a group is, seen from outside: how many of what, how seasoned, how hurt.
  look?: string; state?: 'dead' | 'down'; acts: Act[];
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
  // Conditions that harm by name, and those that help (a lit torch) apart.
  conditions: string[]; boons?: string[];
  abilities: { id: string; name: string; text: string; cost: number; price: string }[];
  attributes: Record<string, number>; acts: Act[];
  overlays?: { id: string; name: string; role: string; grants: string[] }[];
}
export interface LogEntry { at: string; title: string; lines: string[]; tone: 'act' | 'fight' | 'note' | 'fail' }
export interface Screen {
  title: string; clock: string; elapsed: number; running: boolean;
  path: PlaceRef[]; place: PlaceRef; prose: string[];
  // The company stands in the dark without a light.
  dark?: boolean;
  exits: ExitRow[]; people: TargetRow[]; things: TargetRow[];
  party: MemberRow[]; items: ItemRow[]; camp: Act[];
  purse: { coin: number; rations: number; other: string[] };
  // What the company knows, newest first, each with how it came to know it ("Agnes told you", "you saw it") and when.
  knowledge: { text: string; how: string }[]; deadlines: string[]; capabilities: string[];
  map: { id: string; name: string; zone: string; visited: boolean; here: boolean }[];
  chart?: Chart; region?: RegionChart; objectives: string[];
  expedition: { time: string; daylight: string; rations: number; hungry: boolean; nextMeal?: string };
  unplaced: Act[];
}
export interface Chart {
  places: { id: string; name: string; x: number; y: number; visited: boolean; here: boolean; area: string;
    external?: boolean }[];
  edges: { id: string; name: string; from: string; to: string; status: string; oneWay: boolean; explored: boolean }[];
}
export interface RegionChart {
  areas: { id: string; name: string; x: number; y: number; visited: boolean; here: boolean }[];
  edges: { from: string; to: string; label: string; status: string }[];
}
export interface CombatScreen {
  turn: number; actor: string; actorName: string; ours: boolean; outcome: string | null;
  foes: CombatantRow[]; allies: CombatantRow[];
  abilities: { id: string; name: string; text: string; cost: number; price: string; cooldown: number; scope: string;
    spell?: { level: number; ready: number }; targets: { id: string; name: string; against?: string }[] }[];
  // Who is still to act this round, in order, the one acting first.
  order: string[];
  log: string[]; exchanges: string[][];
}
export interface CombatantRow {
  id: string; name: string; line: string; hp: number; maxHp: number; mana: number; maxMana: number;
  slots?: number[]; maxSlots?: number[];
  // Conditions by name: those that hurt, and those that help (a guard, a blessing).
  statuses: string[]; boons?: string[]; acting: boolean; down: boolean;
  // For a foe: what it means to do this round, and the damage it shrugs off or fears.
  intent?: string; defenses?: string;
}
