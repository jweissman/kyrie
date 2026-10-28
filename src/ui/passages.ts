import { Spatial } from '../spatial';
import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import type { SpatialScene } from '../presentation/player-view';
import type { Act, ExitRow, Passage, PlaceRef, Transition } from './screen-types';
import { PassageModel } from './passage-model';

export interface ExitActs { acts: Act[]; passage?: Passage; via?: string }
interface Known {
  destination: string; passage: Passage; via?: string; blocked?: string; name?: string; mode?: Transition;
  way?: string; hazard?: string; oneWay?: boolean;
}

// Exits the party knows from its current place. Movement legality still comes only from the command list:
// this class adds orientation (transition scale, containing level/building) and an honest reason when a known
// way is unavailable. Route-based modules expose their passages through ordinary world relations.
export class Passages {
  constructor(private entities: Map<string, Entity>, private world: World, private actor: string) {}
  private relations(name: string) { return this.world.related(name); }
  place(id: string): PlaceRef {
    const e = this.entities.get(id);
    return { id, name: e?.name ?? id, kind: e?.space?.kind ?? 'place' };
  }
  path(id: string): PlaceRef[] {
    return Spatial.ancestry(this.entities, id).reverse().map(e => ({ id: e.id, name: e.name, kind: e.space!.kind }));
  }
  private within(id: string, kind: string): Entity | undefined {
    return Spatial.ancestry(this.entities, id).find(e => e.space?.kind === kind);
  }
  transition(origin: string, destination: string): Transition {
    const kinds = ['plane', 'region', 'settlement', 'wilderness'];
    if (this.within(origin, 'plane')?.id !== this.within(destination, 'plane')?.id) { return 'cross_plane'; }
    if (kinds.slice(1).some(k => this.within(origin, k)?.id !== this.within(destination, k)?.id)) { return 'travel'; }
    const from = this.within(origin, 'level'), to = this.within(destination, 'level');
    if (from && to && from.id !== to.id) { return 'level'; }
    const a = this.enclosures(origin), b = this.enclosures(destination);
    if (b.some(id => !a.includes(id))) { return 'enter'; }
    if (a.some(id => !b.includes(id))) { return 'leave'; }
    return 'walk';
  }
  // What a way goes into or out of: a building, a site, a floor of one; not a terrace of a town, walked onto.
  private enclosures(id: string): string[] {
    return Spatial.ancestry(this.entities, id).slice(1)
      .filter(e => ['building', 'site', 'level'].includes(e.space!.kind) && !Spatial.terrace(e, this.entities))
      .map(e => e.id);
  }
  scope(origin: string, destination: string, transition: Transition): string | undefined {
    if (transition === 'walk') { return undefined; }
    if (transition === 'level') { return this.within(destination, 'level')?.name; }
    if (transition === 'leave') {
      const parent = Spatial.ancestry(this.entities, destination)[1];
      return parent ? parent.name : undefined;
    }
    return this.crossed(origin, destination, transition)?.name;
  }
  // Entering, the outermost enclosure crossed (the tower, not the level inside it).
  private crossed(origin: string, destination: string, transition: Transition): Entity | undefined {
    const crossed = Spatial.ancestry(this.entities, destination).slice(1)
      .filter(e => !Spatial.ancestry(this.entities, origin).some(o => o.id === e.id));
    return transition === 'enter' ? crossed.at(-1) : crossed[0];
  }
  // How many ways lead into an enclosure from outside it, of all the world's ways, known or not: read once for a
  // world's places and ways.
  private static readonly entered = new WeakMap<readonly Entity[], Map<string, number>>();
  private ways(enclosure: string): number {
    let counted = Passages.entered.get(this.world.module.entities);
    if (!counted) { counted = new Map(); Passages.entered.set(this.world.module.entities, counted); }
    if (!counted.has(enclosure)) {
      counted.set(enclosure, new Set(this.relations('connects').filter(r => this.inside(r.args[2]!, enclosure)
        && !this.inside(r.args[1]!, enclosure)).map(r => r.args[0]!)).size);
    }
    return counted.get(enclosure)!;
  }
  private inside(id: string, enclosure: string): boolean {
    return Spatial.ancestry(this.entities, id).some(e => e.id === enclosure);
  }
  // The ways the company knows from here, as the passages are (see PassageModel), and the exits a spatial scene
  // offers. The relations ways were written with before passages (route, footway, gate, hazardPassage,
  // climbingPassage, informedPassage) are no module's any longer, and are not read (Mission 17, the architecture
  // review's H3: what the engine reads by name is its contract with the rules).
  private known(here: string, spatial?: SpatialScene): Known[] {
    const rows: Known[] = [];
    for (const w of new PassageModel(this.world, this.actor, this.entities).ways(here)) {
      const passage: Passage = w.status === 'guarded' ? 'guarded' : w.status === 'hazard' ? 'hazard'
        : w.status === 'needs' ? 'climb' : w.status === 'blocked' ? 'door' : 'open';
      rows.push({ destination: w.to, passage, way: w.name, ...(w.via ? { via: w.via } : {}),
        ...w.oneWay ? { oneWay: true } : {}, ...(w.status === 'hazard' ? { hazard: w.reason! } : {}),
        ...(['blocked', 'guarded', 'needs'].includes(w.status) ? { blocked: w.reason! } : {}) });
    }
    for (const e of spatial?.exits ?? []) {
      const passage: Passage = e.barrier ? 'door' : 'open';
      rows.push({ destination: e.destination, passage, name: e.name, mode: e.mode as Transition,
        ...(e.barrier ? { via: e.barrier } : {}), ...(e.available ? {} : { blocked: e.reason ?? 'Unavailable.' }) });
    }
    return rows;
  }
  private static lower(s: string): string { return s.charAt(0).toLowerCase() + s.slice(1); }
  exits(here: string, grouped: Map<string, ExitActs>, options: { spatial?: SpatialScene; visited: Set<string> }) {
    const merged = new Map<string, Known>();
    const rank: Passage[] = ['door', 'hidden', 'climb', 'hazard', 'guarded', 'open'];
    for (const k of this.known(here, options.spatial)) {
      const prior = merged.get(k.destination);
      if (!prior) { merged.set(k.destination, k); continue; }
      const preferred = !!prior.blocked !== !!k.blocked ? (prior.blocked ? k : prior) :
        rank.indexOf(k.passage) < rank.indexOf(prior.passage) ? k : prior;
      const other = preferred === prior ? k : prior;
      // Both ways barred: what bars each is said, so that the other way's want (a rope for the climb) is not lost.
      const both = preferred.blocked && other.blocked && other.blocked !== preferred.blocked
        ? { blocked: `${preferred.blocked} Or by ${other.way ?? 'another way'}: ${Passages.lower(other.blocked)}` } : {};
      merged.set(k.destination, { ...preferred, via: preferred.via ?? other.via, ...both });
    }
    for (const [destination, g] of grouped) {
      const prior = merged.get(destination);
      merged.set(destination, { destination, passage: g.passage ?? prior?.passage ?? 'open',
        ...(prior?.way ? { way: prior.way } : {}), ...(prior?.hazard ? { hazard: prior.hazard } : {}),
        ...(g.via ?? prior?.via ? { via: g.via ?? prior?.via } : {}), ...(prior?.name ? { name: prior.name } : {}),
        ...(prior?.mode ? { mode: prior.mode } : {}), ...(prior?.blocked ? { blocked: prior.blocked } : {}),
        ...prior?.oneWay ? { oneWay: true } : {} });
    }
    return [...merged.values()].map(k => this.row(here, k, grouped.get(k.destination)?.acts ?? [], options.visited))
      .sort((a, b) => Number(!!a.blocked) - Number(!!b.blocked) || Passages.order(a) - Passages.order(b)
        || a.destination.name.localeCompare(b.destination.name));
  }
  private row(here: string, k: Known, acts: Act[], visited: Set<string>): ExitRow {
    const transition = k.mode && k.mode !== 'walk' ? k.mode : this.transition(here, k.destination);
    const scope = this.scope(here, k.destination, transition);
    // An enclosure entered by more than one way (the Strongrooms, through the black wall and up the drowned city's
    // drain) is entered by the way's own name.
    const entered = transition === 'enter' && k.way ? this.crossed(here, k.destination, transition) : undefined;
    const several = !!entered && this.ways(entered.id) > 1;
    const area = Spatial.ancestry(this.entities, here).find(e => ['settlement', 'site'].includes(e.space!.kind));
    const local = !!area && Spatial.ancestry(this.entities, k.destination).some(e => e.id === area.id);
    return { id: `exit:${k.destination}`, kind: 'exit', name: k.name ?? this.place(k.destination).name,
      destination: this.place(k.destination), transition, passage: k.passage, ...local ? { local } : {},
      ...(scope ? { scope } : {}), ...(k.via ? { via: k.via } : {}),
      ...(acts.length && !k.blocked ? {} : { blocked: k.blocked ?? 'Not possible from here right now.' }),
      ...(k.way ? { way: k.way } : {}), ...(k.hazard ? { hazard: k.hazard } : {}), ...several ? { several } : {},
      ...k.oneWay ? { oneWay: true } : {},
      visited: visited.has(k.destination), acts };
  }
  private static order(row: ExitRow): number {
    return ['walk', 'enter', 'leave', 'level', 'ascend', 'descend', 'travel', 'cross_plane'].indexOf(row.transition);
  }
}
