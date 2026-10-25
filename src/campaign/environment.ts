import type { World } from '../lang/world';
import type { Entity } from '../lang/module';

// Orsino's environment for a combatant (a dungeon's terrain: urban, forest, cave, desert), read from where it stands:
// in a settlement, urban; in an unlit place, a cave; otherwise the terrain of the region it is in, if the region says.
// Every creature's facts are projected with it on every watch, so it reads the world by its indexes, never by going
// through every fact (Mission 15's profile found the scans a sixth of a long journey's time).
export class Environment {
  // What a fight where an actor stands is fought under: the ground (Orsino's environment), the place's laws, and
  // whether the members fighting are weary, or ready for what they fight.
  static encounter(world: World, actor: string | undefined, members: string[] = [], against?: string):
    { environment?: string; laws: string[]; weary?: string[]; ready?: string[] } {
    const environment = Environment.of(world, actor);
    return { ...environment ? { environment } : {}, laws: Environment.laws(world, actor),
      ...Environment.weary(world, actor, members), ...Environment.ready(world, { actor, against }, members) };
  }
  // A company that drew out what it fights, and waited for it (inhabitants.kyr): its members meet it ready.
  static ready(world: World, at: { actor?: string; against?: string }, members: string[]): { ready?: string[] } {
    return at.actor && at.against && world.related('awaits', at.actor).some(r => r.args[1] === at.against)
      ? { ready: members } : {};
  }
  // A company weary for want of sleep (needs.kyr): its members fight weary.
  static weary(world: World, actor: string | undefined, members: string[]): { weary?: string[] } {
    return actor && world.related('weary', actor).length ? { weary: members } : {};
  }
  // The laws of where an actor stands: every law of its place and of each place it is within (a plane's, a
  // temple's), as the catalog conditions they name.
  static laws(world: World, actor: string | undefined): string[] {
    const laws = this.chain(world, actor).flatMap(p => world.related('law', p).map(r => r.args[1]!));
    return [...new Set(laws)];
  }
  static of(world: World, actor: string | undefined): string | undefined {
    const chain = this.chain(world, actor), places = this.places(world.module.entities), here = chain[0];
    if (!here) { return undefined; }
    if (chain.some(id => places.get(id)?.space?.kind === 'settlement')) { return 'urban'; }
    if (world.related('unlit', here).length) { return 'cave'; }
    // The nearest place that says: the downs are hills though the valley is mountains.
    for (const p of chain) {
      const terrain = world.one('terrain', p);
      if (terrain) { return terrain; }
    }
    return undefined;
  }
  // Where an actor stands, and each place that is within, outward.
  private static chain(world: World, actor: string | undefined): string[] {
    const places = this.places(world.module.entities), chain: string[] = [];
    for (let p = actor ? world.one('at', actor) : undefined; p && !chain.includes(p); p = places.get(p)?.space?.parent) {
      chain.push(p);
    }
    return chain;
  }
  // A module's entities by id, kept while the list is the same list of the same length (a frontier adds to it).
  private static readonly indexed = new WeakMap<Entity[], { length: number; byId: Map<string, Entity> }>();
  private static places(entities: Entity[]): Map<string, Entity> {
    const kept = this.indexed.get(entities);
    if (kept?.length === entities.length) { return kept.byId; }
    const byId = new Map(entities.map(e => [e.id, e]));
    this.indexed.set(entities, { length: entities.length, byId });
    return byId;
  }
}
