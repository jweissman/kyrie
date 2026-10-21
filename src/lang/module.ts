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
export interface PlaceDefinition { kind: PlaceKind; parent?: string; grid?: [number, number] }
export interface ExitDefinition {
  passage?: string; origin: string; destination: string; mode: MovementMode; door?: string; knowledge?: string;
}
export interface Entity {
  creatureId?: string; id: string; type: string; name: string; space?: PlaceDefinition; exit?: ExitDefinition;
  effect?: string;
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
export interface Observation { id: string; place: string; anchor?: Anchor; when: Predicate; text: string }
export interface Objective { id: string; when: Predicate; text: string }
export interface Person { role?: string; id: string; name: string; place: string; raceId?: string; classId?: string;
  level: number; actions: string[]; horizon?: number;
  // creature: constraints for the Deem creature generator; count: how many creatures the group has (default 1);
  // names: what each of them is called, in order.
  creature?: Record<string, string | number>; count?: number; names?: string[]; wants?: string[];
  authored?: string[]; professionId?: string; backgroundId?: string; traits?: string[]; gear?: string[];
  offers?: { kind: string; text: string; fee: number }[]; sells?: { what: string; fee: number; stock: number }[] }
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
}
export interface WorldState {
  relations: Call[];
  measures: { call: Call; value: number }[];
}
export interface Instance { module: Module; world: WorldState; budget: number; campaign?: import('../campaign/definition').CampaignDefinition }
