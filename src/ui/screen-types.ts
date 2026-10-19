// Renderer-independent game screen contract. Every executable leaf carries a PlayerView command id; the client
// never decides what is legal. Rows describe what the party can perceive at its current location.

export type Transition = 'walk' | 'enter' | 'leave' | 'ascend' | 'descend' | 'level' | 'travel' | 'cross_plane';
export type Passage = 'open' | 'guarded' | 'hazard' | 'climb' | 'hidden' | 'door';

export interface Act {
  key: string; label: string; command?: string; minutes?: number; risk?: boolean; children?: Act[];
}
export interface PlaceRef { id: string; name: string; kind: string }
export interface ExitRow {
  id: string; kind: 'exit'; name: string; destination: PlaceRef; transition: Transition; passage: Passage;
  scope?: string; via?: string; blocked?: string; visited: boolean; acts: Act[]; way?: string; hazard?: string;
}
export interface TargetRow {
  id: string; kind: 'person' | 'creature' | 'thing' | 'feature'; name: string; note?: string; activity?: string;
  state?: 'dead' | 'down'; acts: Act[];
}
export interface ItemRow {
  id: string; name: string; kind: string; description: string; owner: string; ownerName: string;
  equipped: boolean; slot?: string; acts: Act[];
}
export interface MemberRow {
  id: string; ref?: string; name: string; line: string; background?: string; level: number;
  hp: number; maxHp: number; mana: number; maxMana: number; experience: number; gold: number;
  conditions: string[]; abilities: { id: string; name: string; text: string; cost: number }[];
  attributes: Record<string, number>; acts: Act[];
  overlays?: { id: string; name: string; role: string; grants: string[] }[];
}
export interface LogEntry { at: string; title: string; lines: string[]; tone: 'act' | 'fight' | 'note' | 'fail' }
export interface Screen {
  title: string; clock: string; elapsed: number; running: boolean;
  path: PlaceRef[]; place: PlaceRef; prose: string[];
  exits: ExitRow[]; people: TargetRow[]; things: TargetRow[];
  party: MemberRow[]; items: ItemRow[]; camp: Act[];
  purse: { coin: number; rations: number };
  knowledge: string[]; deadlines: string[]; capabilities: string[];
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
  abilities: { id: string; name: string; text: string; cost: number; cooldown: number; scope: string;
    targets: { id: string; name: string }[] }[];
  log: string[];
}
export interface CombatantRow {
  id: string; name: string; line: string; hp: number; maxHp: number; mana: number; maxMana: number;
  statuses: string[]; acting: boolean; down: boolean;
}
