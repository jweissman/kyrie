import { Operators } from './operators';
import type { CampaignActor } from './definition';
import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';

// A campaign's actions grounded on demand: its operators, made again only when its module, its actions or its
// controllers change; and the actions open to the player, worked out once for each world.
export class CampaignGrounding {
  private grounded?: { module: Module; length: number; actors: CampaignActor[] | undefined; operators: Operators };
  private applicable?: { world: World; player: CampaignActor | undefined; actions: Operator[] };
  operators(module: Module, actors: CampaignActor[] | undefined): Operators {
    const g = this.grounded;
    if (g?.module === module && g.length === module.actions.length && g.actors === actors) { return g.operators; }
    const operators = new Operators(module, actors);
    this.grounded = { module, length: module.actions.length, actors, operators };
    return operators;
  }
  // The player's: those it may take (all of them, or those its declaration names).
  offered(world: World, player: CampaignActor | undefined, operators: Operators): Operator[] {
    const memo = this.applicable;
    if (memo?.world === world && memo.player === player) { return memo.actions; }
    const actions = operators.applicable(world, player?.id)
      .filter(action => !player || player.allActions || player.actions.includes(action.schema ?? action.id));
    this.applicable = { world, player, actions };
    return actions;
  }
}
