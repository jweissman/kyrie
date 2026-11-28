import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';
import type { Operators } from './operators';
import { HexBoundary } from '../hex-boundary';
import { CrossingRefused } from './crossing-refused';

// How a command is carried out: by the player's own choice, or as a leg of a journey set out on from the map, the one
// way another hex of the country is gone into. Never read from the command's own words.
export interface ExecutionContext { movement?: 'local' | 'map-travel' }
interface At { module: Module; world: World; playerActor?: string }
interface Open extends At { running: boolean; operators: Operators; operator(id: string): Operator | undefined }

// A way into another hex of the country is gone by only as a leg of a journey set out on from the map (Travel.go says
// so, leg by leg, through travelling); any other command that would cross is refused before it changes anything. The
// page had kept the rule by hiding such ways, and a command sent without it crossed anyway (the quest-intent and
// travel-contract review, 9 November). A planar threshold is not a hex crossed (see HexBoundary).
// Nor does an act that is no way gone by put the company in another hex: a topic's effects, an authored relocation, a
// boat poled down a cut to the town are never offered where they would (CampaignGrounding.offered), and are refused
// if asked (TR-20; the owner, 19 November: "I got from my quest destination back to town without the map"). The
// engine's own travel is the one way across; the menu may propose a journey, and the journey is walked on the map.
// What is allowed, each for its reason:
// - a planar threshold, a ship's deck, a house between the worlds: either end on no land drawn, so no hex is crossed
//   (HexBoundary.hex);
// - lost in a wild country (data/generation/wild/astray.kyrt): the place of the lost is nowhere on the land, as its
//   author says, so striking out into it and following the water out of it cross none (HexBoundary.nowhere);
// - what the world does to the company in the time a command takes, not the act itself: a captor's lock-up (Mercy),
//   the circus's wagons the company rides with (ride_out, ride_in), a fellow or a bearing bringing it out of the lost
//   (the wild country's guided and bearing). Rules are the world's, and only the act's own changes are held to this;
//   the page walks any hex they change on the map all the same (see JourneyCourse).
export class Crossing {
  // How many hexes lie between where a place stands and the nearest of others on the same land (a road stands on every
  // cell it runs over), the land set out in hexes as the page's map draws it (as Terrain.hexes counts them); none, if
  // the first or every other stands on no land, or another. What a placement held back waits on (PendingPlacements).
  static hexes(module: Module, from: string, places: readonly string[]): number | undefined {
    const here = this.cells(module, from), width = here && module.charts?.[here.land]?.width;
    if (!here || !width) { return undefined; }
    let least: number | undefined;
    for (const place of places) {
      const at = this.cells(module, place);
      if (at?.land !== here.land) { continue; }
      for (const a of here.cells) {
        for (const b of at.cells) { least = Math.min(least ?? Infinity, this.apart(width, a, b)); }
      }
    }
    return least;
  }
  private static cells(module: Module, id: string): { land: string; cells: number[] } | undefined {
    const hex = id ? HexBoundary.hex(module, id) : undefined;
    if (!hex) { return undefined; }
    const [land, a, road] = hex.split(':') as [string, string, string?];
    return { land, cells: a === 'road' ? module.charts?.[land]?.roads[road!] ?? [] : [Number(a)] };
  }
  private static apart(width: number, a: number, b: number): number {
    const [q1, r1] = this.cube(width, a), [q2, r2] = this.cube(width, b), dq = q1 - q2, dr = r1 - r2;
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  }
  private static cube(width: number, c: number): [number, number] {
    const y = Math.floor(c / width);
    return [c % width - (y - (y & 1)) / 2, y];
  }
  // The leg of a journey being taken (its destination), for as long as the journey takes it: what Travel.go confers
  // on the one command it plans, never what a command says of itself.
  private leg?: string;
  async travelling<T>(destination: string, take: () => Promise<T>): Promise<T> {
    const was = this.leg;
    this.leg = destination;
    try { return await take(); } finally { this.leg = was; }
  }
  bound(at: At, action: Operator, context: ExecutionContext) {
    const carried = Crossing.carried(at, action);
    if (carried) { throw new CrossingRefused(action.id, carried.from, carried.to); }
    const to = Crossing.whither(action), actor = at.playerActor;
    if (!to || !actor || context.movement === 'map-travel' || this.leg === to) { return; }
    const from = action.movement?.origin ?? action.bindings?.origin ?? at.world.one('at', actor);
    if (from && HexBoundary.crosses(at.module, from, to)) { throw new CrossingRefused(action.id, from, to); }
  }
  // Where a command is committed: the act's own changes made (before, after), the company is in the hex it was in,
  // unless the act is a way gone by (held to bound, and gone by on a journey's leg). A backstop to bound, for what an
  // act's changes do that its grounded words did not say. What it keeps it gives back (after).
  static kept(at: { module: Module; playerActor?: string }, action: Operator, before: World, after: World): World {
    const actor = at.playerActor;
    if (!actor || Crossing.whither(action)) { return after; }
    const from = before.one('at', actor), to = after.one('at', actor);
    if (from && to && from !== to && HexBoundary.crosses(at.module, from, to)) {
      throw new CrossingRefused(action.id, from, to);
    }
    return after;
  }
  // Where a way gone by goes: an exit lowered as a movement, or a rule's going (go, escort) that binds a way, from, to.
  static whither(action: Operator): string | undefined {
    const b = action.bindings ?? {};
    return action.movement?.destination ?? (b.way && b.origin ? b.destination : undefined);
  }
  // An act open to the company that is not offered because it would put it in another hex (see carried): its
  // refusal, said as one, where a command asks for it.
  static withheld(at: Open, id: string): CrossingRefused | undefined {
    const op = at.operator(id), actor = at.playerActor;
    if (!op || !actor || !at.running) { return undefined; }
    const open = at.operators.applicable(at.world, actor, new Set([op.schema ?? op.id])).find(a => a.id === id);
    const carried = open && Crossing.carried(at, open);
    return carried ? new CrossingRefused(id, carried.from, carried.to) : undefined;
  }
  // An act that is no way gone by, whose own changes (done or failed) put the company in another hex than the one it
  // stands in: where from and where to; else nothing.
  static carried(at: At, action: Operator): { from: string; to: string } | undefined {
    const actor = at.playerActor;
    if (!actor || Crossing.whither(action)) { return undefined; }
    const from = at.world.one('at', actor);
    if (!from) { return undefined; }
    for (const c of at.world.due([...action.success, ...action.failure])) {
      const to = c.kind === 'assert' && c.call.name === 'at' && c.call.args[0] === actor ? c.call.args[1] : undefined;
      if (to && HexBoundary.crosses(at.module, from, to)) { return { from, to }; }
    }
    return undefined;
  }
}
