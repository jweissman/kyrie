export interface Call { kind: 'call'; name: string; args: string[] }
export type NumberValue = { kind: 'number'; value: number } | { kind: 'deem'; expression: string };
export type Value = NumberValue | Call;
export type Predicate = Call | { kind: 'boolean'; value: boolean }
  | { kind: 'not'; value: Predicate }
  | { kind: 'and' | 'or'; left: Predicate; right: Predicate }
  | { kind: 'compare'; operator: '>=' | '<=' | '>' | '<' | '==' | '!='; left: Value; right: Value };
export type Change = { kind: 'assert'; call: Call } | { kind: 'retract'; call: Call }
  | { kind: 'set'; call: Call; value: Value }
  | { kind: 'increase'; call: Call; value: Value }
  | { kind: 'decrease'; call: Call; value: Value };
export type PlaceKind = 'plane' | 'region' | 'settlement' | 'wilderness' | 'site' | 'building' | 'level' | 'room';
export type MovementMode = 'walk' | 'enter' | 'leave' | 'ascend' | 'descend' | 'travel' | 'cross_plane';
// Whether a place is under the sky, under a roof or under the ground: what can be seen and felt there of the weather
// and the day.
export type Shelter = 'outdoors' | 'indoors' | 'underground';
export interface PlaceDefinition { kind: PlaceKind; parent?: string; grid?: [number, number]; shelter?: Shelter }
export interface ExitDefinition {
  passage?: string; origin: string; destination: string; mode: MovementMode; door?: string; knowledge?: string;
}
export interface Entity {
  creatureId?: string; id: string; type: string; name: string; space?: PlaceDefinition; exit?: ExitDefinition;
  effect?: string;
  // What a place is called by a company that does not know the fact naming it ("a lone tower").
  alias?: { name: string; until: string };
}
export interface Signature { name: string; types: string[]; exclusive: boolean }
export interface Query { name: string; parameters: { name: string; type: string }[]; body: Predicate }
export interface Operator {
  searchPlace?: string;
  report?: string; seen?: string; speaker?: string; movement?: ExitDefinition;
  parameters?: { name: string; type: string }[];
  actor?: string; schema?: string; bindings?: Record<string, string>;
  id: string; name: string; description: string; requires: Predicate;
  success: Change[]; failure: Change[]; cost: number; time: number; duration?: Call; resolve?: Call;
  // An activity that something can interrupt: its time passes a watch at a time, and it stops when this comes to
  // hold (having not held when it began) or something happens where the company is. Its success changes apply only
  // if it runs its course; if it is interrupted, its failure changes apply instead.
  interrupt?: Predicate;
  // A watchful activity also stops when anyone comes or goes where the company is, or what it sees there changes.
  watchful?: boolean;
}
export interface Pursuit {
  id: string; actor: string; label?: string; priority: number; when: Predicate; target: Predicate;
  // The actions the actor may use in this pursuit, beyond those its own declaration gives it.
  using?: string[];
}
export type Anchor = 'at' | 'near' | 'beside';
export interface WorldRule {
  id: string; when: Predicate; effects: Change[]; say?: string; place?: string; anchor?: Anchor;
}
// What an observation tells of: what a place is (a fixture, the default), a part worth a closer look (a feature),
// evidence of something (a sign), the sky (weather), the passing life of the place (ambience), something happening
// (an event), or a discovery that deserves the page to itself (a revelation).
export type Aspect = 'fixture' | 'feature' | 'sign' | 'weather' | 'ambience' | 'event' | 'revelation';
export interface Observation {
  id: string; place: string; anchor?: Anchor; when: Predicate; text: string; teaches?: string;
  // The entity described, which is not perceived while the company has not noticed it.
  about?: string;
  aspect?: Aspect;
  // A capability someone in the company must bring to notice it at all (lore, stonework, woodcraft).
  by?: string;
}
export interface Objective { id: string; when: Predicate; text: string }
export interface Person { role?: string; id: string; name: string; place: string; raceId?: string; classId?: string;
  level: number; actions: string[]; horizon?: number;
  // creature: constraints for the Deem creature generator; count: how many creatures the group has (default 1);
  // names: what each of them is called, in order.
  creature?: Record<string, string | number>; count?: number; names?: string[]; wants?: string[];
  authored?: string[]; professionId?: string; backgroundId?: string; traits?: string[]; gear?: string[];
  offers?: { kind: string; text: string; fee: number }[]; sells?: { what: string; fee: number; stock: number }[];
  // What the person will pay for each kind of thing brought to them.
  buys?: { what: string; fee: number }[] }
export interface CompanyDeclaration { id: string; name: string; size: number; place: string }
export interface Module {
  people?: Person[];
  observations?: Observation[];
  company?: CompanyDeclaration;
  objectives?: Objective[];
  rules?: WorldRule[];
  pursuits?: Pursuit[];
  id: string; name: string; description: string; kinds: string[]; entities: Entity[];
  relations: Signature[]; measures: Signature[]; queries: Query[]; initial: Change[];
  goal: Predicate; actions: Operator[]; budget: NumberValue;
  // The land of each region with one, by the region's id: what its map is drawn from.
  charts?: Record<string, LandChart>;
}
// A region's land for its map: each cell's cover in one string (row by row), the cells of its rivers, of each road
// (by its way), of each part of its wild country (by room), and the cell of each place on it.
export interface LandChart {
  width: number; height: number; cover: string; rivers: number[][]; roads: Record<string, number[]>;
  parts: Record<string, number[]>; places: Record<string, number>;
}
export interface WorldState {
  relations: Call[];
  measures: { call: Call; value: number }[];
}
export interface Instance { module: Module; world: WorldState; budget: number; campaign?: import('../campaign/definition').CampaignDefinition }
