import { ModuleWriter } from '../lang/module-writer';
import type { Change, Operator } from '../lang/module';
import type { World } from '../lang/world';

export interface Leg { actor: string; origin: string; destination: string; way?: string; followers: string[] }
// What a journey needs of the campaign it is made in.
export interface JourneyHost {
  readonly world: World;
  commitWorld(world: World): void; applyAction(action: Operator, success?: boolean): void; refreshProjection(): void;
}

// A command that takes the company from where it stands to somewhere else, and takes more than one watch to do it.
// The company sets out at once, with whoever is following it, and is on the way while the time passes: nothing at
// either end can reach it, and the world goes on. It arrives for the last watch, so whoever is there meets it as it
// comes. A way that stops being passable while the company is on it turns the company back to where it set out.
export class Journey {
  static of(world: World, action: Operator, player: string | undefined, watches: number): Leg | undefined {
    if (!player || watches < 2) { return undefined; }
    const relations = world.snapshot.relations;
    const origin = relations.find(r => r.name === 'at' && r.args[0] === player)?.args[1];
    const destination = action.success.find(c => c.kind === 'assert' && c.call.name === 'at'
      && c.call.args[0] === player)?.call.args[1];
    if (!origin || !destination || destination === origin) { return undefined; }
    const way = Object.values(action.bindings ?? {})
      .find(id => world.module.entities.some(e => e.id === id && e.type === 'passage'));
    const moved = new Set(action.success.filter(c => c.kind === 'assert' && c.call.name === 'at')
      .map(c => c.call.args[0]!));
    const followers = relations.filter(r => r.name === 'following' && r.args[1] === player && !moved.has(r.args[0]!)
      && relations.some(a => a.name === 'at' && a.args[0] === r.args[0] && a.args[1] === origin)).map(r => r.args[0]!);
    return { actor: player, origin, destination, ...way ? { way } : {}, followers };
  }
  // A move too short to be a journey still takes along whoever is following the company from where it stood.
  static along(before: World, after: World, player: string | undefined): World {
    const from = player && this.where(before, player), to = player && this.where(after, player);
    if (!player || !from || !to || from === to) { return after; }
    const followers = before.snapshot.relations.filter(r => r.name === 'following' && r.args[1] === player
      && this.where(before, r.args[0]!) === from && this.where(after, r.args[0]!) === from).map(r => r.args[0]!);
    return followers.length
      ? after.apply(followers.flatMap(g => [this.at('retract', g, from), this.at('assert', g, to)])) : after;
  }
  private static where(world: World, group: string): string | undefined {
    return world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === group)?.args[1];
  }
  static depart(world: World, leg: Leg): World {
    return world.apply([...[leg.actor, ...leg.followers].map(g => this.at('retract', g, leg.origin)),
      ...this.travelling(world, leg, 'assert')]);
  }
  // Whether the way is still passable for the company, were it back where it set out.
  static open(world: World, leg: Leg): boolean {
    if (!leg.way || !world.module.queries.some(q => q.name === 'passable')) { return true; }
    return world.apply([this.at('assert', leg.actor, leg.origin)])
      .test(ModuleWriter.call('passable', leg.way, leg.actor));
  }
  static back(world: World, leg: Leg): World {
    return world.apply([...this.travelling(world, leg, 'retract'),
      ...[leg.actor, ...leg.followers].map(g => this.at('assert', g, leg.origin))]);
  }
  static arrived(world: World, leg: Leg): World {
    return world.apply([...this.travelling(world, leg, 'retract'),
      ...leg.followers.map(g => this.at('assert', g, leg.destination))]);
  }
  private static at(kind: 'assert' | 'retract', group: string, place: string): Change {
    return { kind, call: ModuleWriter.call('at', group, place) };
  }
  // Rules can see a company on the way: enRoute(company, passage), on the still lake or in the basket.
  private static travelling(world: World, leg: Leg, kind: 'assert' | 'retract'): Change[] {
    return leg.way && world.module.relations.some(r => r.name === 'enRoute')
      ? [{ kind, call: ModuleWriter.call('enRoute', leg.actor, leg.way) }] : [];
  }
  // The company comes where it was going, with its followers, and the command takes effect.
  static arrive(host: JourneyHost, action: Operator, leg: Leg) {
    host.commitWorld(this.arrived(host.world, leg));
    host.applyAction(action, true);
    host.refreshProjection();
  }
  // A journey turned back did not arrive; one cut short by anything else ends where it was going.
  static landed(host: JourneyHost, action: Operator, leg: Leg, turned: boolean): boolean {
    if (turned) { return false; }
    if (!host.world.snapshot.relations.some(r => r.name === 'at' && r.args[0] === leg.actor)) {
      this.arrive(host, action, leg);
    }
    return true;
  }
  static told(world: World, leg: Leg): string {
    const name = world.module.entities.find(e => e.id === leg.origin)?.name ?? leg.origin;
    return `The way is no longer open. You turn back to ${name}.`;
  }
}
