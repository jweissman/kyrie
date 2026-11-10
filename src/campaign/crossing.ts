import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { HexBoundary } from '../hex-boundary';

// How a command is carried out: by the player's own choice, or as a leg of a journey set out on from the map, the one
// way another hex of the country is gone into. Never read from the command's own words.
export interface ExecutionContext { movement?: 'local' | 'map-travel' }

// A way into another hex of the country is gone by only as a leg of a journey set out on from the map (Travel.go says
// so, leg by leg, through travelling); any other command that would cross is refused before it changes anything. The
// page had kept the rule by hiding such ways, and a command sent without it crossed anyway (the quest-intent and
// travel-contract review, 9 November). A planar threshold is not a hex crossed (see HexBoundary).
export class Crossing {
  // The leg of a journey being taken (its destination), for as long as the journey takes it: what Travel.go confers
  // on the one command it plans, never what a command says of itself.
  private leg?: string;
  async travelling<T>(destination: string, take: () => Promise<T>): Promise<T> {
    const was = this.leg;
    this.leg = destination;
    try { return await take(); } finally { this.leg = was; }
  }
  bound(at: { module: Module; world: World; playerActor?: string }, action: Operator, context: ExecutionContext) {
    const to = Crossing.whither(action), actor = at.playerActor;
    if (!to || !actor || context.movement === 'map-travel' || this.leg === to) { return; }
    const from = action.movement?.origin ?? action.bindings?.origin ?? at.world.one('at', actor);
    if (from && HexBoundary.crosses(at.module, from, to)) {
      throw new Error(`Crossing into another hex is a journey set out on from the map: ${action.id}`);
    }
  }
  // Where a way gone by goes: an exit lowered as a movement, or a rule's going (go, escort) that binds a way, from, to.
  static whither(action: Operator): string | undefined {
    const b = action.bindings ?? {};
    return action.movement?.destination ?? (b.way && b.origin ? b.destination : undefined);
  }
}
