import type { World } from '../lang/world';

// Orsino's environment for a combatant (a dungeon's terrain: urban, forest, cave, desert), read from where it stands:
// in a settlement, urban; in an unlit place, a cave; otherwise the terrain of the region it is in, if the region says.
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
    return at.actor && at.against && world.view.relations.some(r => r.name === 'awaits' && r.args[0] === at.actor
      && r.args[1] === at.against) ? { ready: members } : {};
  }
  // A company weary for want of sleep (needs.kyr): its members fight weary.
  static weary(world: World, actor: string | undefined, members: string[]): { weary?: string[] } {
    return actor && world.view.relations.some(r => r.name === 'weary' && r.args[0] === actor) ? { weary: members } : {};
  }
  // The laws of where an actor stands: every law of its place and of each place it is within (a plane's, a
  // temple's), as the catalog conditions they name.
  static laws(world: World, actor: string | undefined): string[] {
    const rel = world.view.relations, entities = world.module.entities;
    const here = actor && rel.find(r => r.name === 'at' && r.args[0] === actor)?.args[1];
    const laws: string[] = [];
    for (let p: string | undefined = here || undefined; p; p = entities.find(e => e.id === p)?.space?.parent) {
      laws.push(...rel.filter(r => r.name === 'law' && r.args[0] === p).map(r => r.args[1]!));
    }
    return [...new Set(laws)];
  }
  static of(world: World, actor: string | undefined): string | undefined {
    const rel = world.view.relations, entities = world.module.entities;
    const here = actor && rel.find(r => r.name === 'at' && r.args[0] === actor)?.args[1];
    if (!here) { return undefined; }
    const chain: string[] = [];
    for (let p: string | undefined = here; p; p = entities.find(e => e.id === p)?.space?.parent) { chain.push(p); }
    if (chain.some(id => entities.find(e => e.id === id)?.space?.kind === 'settlement')) { return 'urban'; }
    if (rel.some(r => r.name === 'unlit' && r.args[0] === here)) { return 'cave'; }
    // The nearest place that says: the downs are hills though the valley is mountains.
    for (const p of chain) {
      const terrain = rel.find(r => r.name === 'terrain' && r.args[0] === p)?.args[1];
      if (terrain) { return terrain; }
    }
    return undefined;
  }
}
