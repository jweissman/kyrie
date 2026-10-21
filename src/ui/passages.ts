import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import type { SpatialScene } from '../presentation/player-view';
import type { Act, ExitRow, Passage, PlaceRef, Transition } from './screen-types';
import { PassageModel } from './passage-model';

export interface ExitActs { acts: Act[]; passage?: Passage; via?: string }
interface Known {
  destination: string; passage: Passage; via?: string; blocked?: string; name?: string; mode?: Transition;
  way?: string; hazard?: string;
}

// Exits the party knows from its current place. Movement legality still comes only from the command list:
// this class adds orientation (transition scale, containing level/building) and an honest reason when a known
// way is unavailable. Route-based modules expose their passages through ordinary world relations.
export class Passages {
  constructor(private entities: Map<string, Entity>, private world: World, private actor: string) {}
  private has(name: string, ...args: string[]): boolean {
    return this.world.module.relations.some(r => r.name === name) && this.world.test(ModuleWriter.call(name, ...args));
  }
  private relations(name: string) { return this.world.snapshot.relations.filter(r => r.name === name); }
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
  private enclosures(id: string): string[] {
    return Spatial.ancestry(this.entities, id).slice(1)
      .filter(e => ['building', 'site', 'level'].includes(e.space!.kind)).map(e => e.id);
  }
  scope(origin: string, destination: string, transition: Transition): string | undefined {
    if (transition === 'walk') { return undefined; }
    if (transition === 'level') { return this.within(destination, 'level')?.name; }
    if (transition === 'leave') {
      const parent = Spatial.ancestry(this.entities, destination)[1];
      return parent ? parent.name : undefined;
    }
    // Entering, name the outermost enclosure crossed (the tower, not the level inside it).
    const crossed = Spatial.ancestry(this.entities, destination).slice(1)
      .filter(e => !Spatial.ancestry(this.entities, origin).some(o => o.id === e.id));
    return (transition === 'enter' ? crossed.at(-1) : crossed[0])?.name;
  }
  private known(here: string, spatial?: SpatialScene): Known[] {
    const rows: Known[] = [];
    for (const w of new PassageModel(this.world, this.actor, this.entities).ways(here)) {
      const passage: Passage = w.status === 'guarded' ? 'guarded' : w.status === 'hazard' ? 'hazard'
        : w.status === 'needs' ? 'climb' : w.status === 'blocked' ? 'door' : 'open';
      rows.push({ destination: w.to, passage, way: w.name, ...(w.via ? { via: w.via } : {}),
        ...(w.status === 'hazard' ? { hazard: w.reason! } : {}),
        ...(['blocked', 'guarded', 'needs'].includes(w.status) ? { blocked: w.reason! } : {}) });
    }
    for (const r of this.relations('route')) {
      if (r.args[0] !== here) { continue; }
      const d = r.args[1]!;
      const blocked = this.has('closed', d) ? 'The way is closed.' :
        this.has('denied', this.actor, here, d) ? 'The way is impassable for now.' : undefined;
      rows.push({ destination: d, passage: 'open', ...(blocked ? { blocked } : {}) });
    }
    for (const r of this.relations('footway')) {
      if (r.args[0] === here) { rows.push({ destination: r.args[1]!, passage: 'open' }); }
    }
    for (const r of this.relations('gate')) {
      if (r.args[1] !== here) { continue; }
      const keeper = r.args[0]!, name = this.entities.get(keeper)?.name ?? keeper;
      const open = this.has('released', keeper) || !this.has('able', keeper);
      rows.push({ destination: r.args[2]!, passage: 'guarded', via: name,
        ...(open ? {} : { blocked: `${name} bars the way.` }) });
    }
    for (const r of this.relations('hazardPassage')) {
      if (r.args[1] !== here) { continue; }
      const trap = r.args[0]!;
      rows.push({ destination: r.args[2]!, passage: 'hazard',
        via: `${this.entities.get(trap)?.name ?? trap}${this.has('armed', trap) ? '' : ' (spent)'}` });
    }
    for (const r of this.relations('climbingPassage')) {
      if (r.args[0] === here) {
        rows.push({ destination: r.args[1]!, passage: 'climb', via: 'a climb',
          blocked: 'Needs a climbing line, carried and equipped.' });
      }
    }
    for (const r of this.relations('informedPassage')) {
      if (r.args[0] === here && this.has('knows', this.actor, r.args[2]!)) {
        rows.push({ destination: r.args[1]!, passage: 'hidden', via: this.entities.get(r.args[2]!)?.name });
      }
    }
    for (const e of spatial?.exits ?? []) {
      const passage: Passage = e.barrier ? 'door' : 'open';
      rows.push({ destination: e.destination, passage, name: e.name, mode: e.mode as Transition,
        ...(e.barrier ? { via: e.barrier } : {}), ...(e.available ? {} : { blocked: e.reason ?? 'Unavailable.' }) });
    }
    return rows;
  }
  exits(here: string, grouped: Map<string, ExitActs>, options: { spatial?: SpatialScene; visited: Set<string> }) {
    const merged = new Map<string, Known>();
    const rank: Passage[] = ['door', 'hidden', 'climb', 'hazard', 'guarded', 'open'];
    for (const k of this.known(here, options.spatial)) {
      const prior = merged.get(k.destination);
      if (!prior) { merged.set(k.destination, k); continue; }
      const preferred = !!prior.blocked !== !!k.blocked ? (prior.blocked ? k : prior) :
        rank.indexOf(k.passage) < rank.indexOf(prior.passage) ? k : prior;
      const other = preferred === prior ? k : prior;
      merged.set(k.destination, { ...preferred, via: preferred.via ?? other.via });
    }
    for (const [destination, g] of grouped) {
      const prior = merged.get(destination);
      merged.set(destination, { destination, passage: g.passage ?? prior?.passage ?? 'open',
        ...(prior?.way ? { way: prior.way } : {}), ...(prior?.hazard ? { hazard: prior.hazard } : {}),
        ...(g.via ?? prior?.via ? { via: g.via ?? prior?.via } : {}), ...(prior?.name ? { name: prior.name } : {}),
        ...(prior?.mode ? { mode: prior.mode } : {}), ...(prior?.blocked ? { blocked: prior.blocked } : {}) });
    }
    return [...merged.values()].map(k => this.row(here, k, grouped.get(k.destination)?.acts ?? [], options.visited))
      .sort((a, b) => Number(!!a.blocked) - Number(!!b.blocked) || Passages.order(a) - Passages.order(b)
        || a.destination.name.localeCompare(b.destination.name));
  }
  private row(here: string, k: Known, acts: Act[], visited: Set<string>): ExitRow {
    const transition = k.mode && k.mode !== 'walk' ? k.mode : this.transition(here, k.destination);
    const scope = this.scope(here, k.destination, transition);
    return { id: `exit:${k.destination}`, kind: 'exit', name: k.name ?? this.place(k.destination).name,
      destination: this.place(k.destination), transition, passage: k.passage,
      ...(scope ? { scope } : {}), ...(k.via ? { via: k.via } : {}),
      ...(acts.length && !k.blocked ? {} : { blocked: k.blocked ?? 'Not possible from here right now.' }),
      ...(k.way ? { way: k.way } : {}), ...(k.hazard ? { hazard: k.hazard } : {}),
      visited: visited.has(k.destination), acts };
  }
  private static order(row: ExitRow): number {
    return ['walk', 'enter', 'leave', 'level', 'ascend', 'descend', 'travel', 'cross_plane'].indexOf(row.transition);
  }
}
