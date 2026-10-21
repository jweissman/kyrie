import type { World } from '../lang/world';

// Orsino's environment for a combatant (a dungeon's terrain: urban, forest, cave, desert), read from where it stands:
// in a settlement, urban; in an unlit place, a cave; otherwise the terrain of the region it is in, if the region says.
export class Environment {
  static of(world: World, actor: string | undefined): string | undefined {
    const rel = world.snapshot.relations, entities = world.module.entities;
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
