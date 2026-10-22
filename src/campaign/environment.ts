import type { World } from '../lang/world';

// Orsino's environment for a combatant (a dungeon's terrain: urban, forest, cave, desert), read from where it stands:
// in a settlement, urban; in an unlit place, a cave; otherwise the terrain of the region it is in, if the region says.
export class Environment {
  // What a fight where an actor stands is fought under: the ground (Orsino's environment) and the place's laws.
  static encounter(world: World, actor: string | undefined): { environment?: string; laws: string[] } {
    const environment = Environment.of(world, actor);
    return { ...environment ? { environment } : {}, laws: Environment.laws(world, actor) };
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
