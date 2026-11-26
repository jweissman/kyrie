import { Operators } from './operators';
import type { CampaignActor } from './definition';
import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { Crossing } from './crossing';

// A campaign's actions grounded on demand: its operators, made again only when its module, its actions, its entities
// or its controllers change; and the actions open to the player, worked out once for each world. A thing given the
// company (Give lantern to actor.; a potion made) is an entity new to the module, and had been in no action's domain:
// it could not be sold, set down or used.
export class CampaignGrounding {
  private grounded?: { module: Module; length: number; entities: number; actors: CampaignActor[] | undefined;
    operators: Operators };
  private applicable?: { world: World; player: CampaignActor | undefined; actions: Operator[] };
  operators(module: Module, actors: CampaignActor[] | undefined): Operators {
    const g = this.grounded;
    if (g?.module === module && g.length === module.actions.length && g.entities === module.entities.length
      && g.actors === actors) { return g.operators; }
    const operators = new Operators(module, actors);
    this.grounded = { module, length: module.actions.length, entities: module.entities.length, actors, operators };
    return operators;
  }
  // The player's: those it may take (all of them, or those its declaration names), less any act that is no way gone
  // by and would put the company in another hex, which is never offered (see Crossing.carried: TR-20).
  // The player's action of this id, as offered would find it among all of them, its schema alone grounded where the
  // world's actions are not worked out already. Under the oracle (checking), held to the whole list.
  one(world: World, player: CampaignActor | undefined, operators: Operators, id: string): Operator | undefined {
    const memo = this.applicable;
    if (memo?.world === world && memo.player === player && !CampaignGrounding.checking) {
      return memo.actions.find(a => a.id === id);
    }
    const at = { module: operators.module, world, ...player ? { playerActor: player.id } : {} };
    const action = operators.one(world, id, player?.id);
    const found = action && (!player || player.allActions || player.actions.includes(action.schema ?? action.id))
      && !Crossing.carried(at, action) ? action : undefined;
    if (CampaignGrounding.checking) { CampaignGrounding.check(this.offered(world, player, operators), id, found); }
    return found;
  }
  // The oracle (test/one-action): each action asked for is also found in the whole list, and any that is not, or that
  // the list has and one did not find, is kept here.
  static checking = false;
  static readonly checked = { asked: 0, differ: [] as string[] };
  private static check(all: readonly Operator[], id: string, found: Operator | undefined) {
    this.checked.asked++;
    const listed = all.find(a => a.id === id);
    if (listed?.id !== found?.id) { this.checked.differ.push(`${id}: listed ${!!listed}, found ${!!found}`); }
  }
  offered(world: World, player: CampaignActor | undefined, operators: Operators): Operator[] {
    const memo = this.applicable;
    if (memo?.world === world && memo.player === player) { return memo.actions; }
    const at = { module: operators.module, world, ...player ? { playerActor: player.id } : {} };
    const actions = operators.applicable(world, player?.id)
      .filter(action => !player || player.allActions || player.actions.includes(action.schema ?? action.id))
      .filter(action => !Crossing.carried(at, action));
    this.applicable = { world, player, actions };
    return actions;
  }
}
