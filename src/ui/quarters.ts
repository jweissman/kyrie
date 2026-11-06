import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import table from '../../data/generation/town/quarters.json';
import { Spatial } from '../spatial';

// One quarter of the town the company is in (see RegionQuarters): its name, the place it is walked to, the places in
// it, and whether the company is in it now.
export interface QuarterRow { id: string; name: string; heart: string; places: string[]; here: boolean }

// The quarters of the town the company is in, as the world says them (inQuarter, heartOf): for Go… to set out the town
// by its parts (the owner, 6 November), the company's own first. None where the town has none.
export class Quarters {
  // A place of another module standing in the town with no quarter of its own (a going-on's ground, a scenario's
  // yard): in the quarter its role names (the last word of its id, as the town's quarters table has them), else in the
  // quarter of a place of the town it opens off, else none.
  private static placed(world: World, e: Entity, at: { town: string; chain: Entity[]; own: Set<string> }):
    string | undefined {
    if (e.space?.parent !== at.town || e.space.kind === 'settlement' || e.space.shelter === 'underground') {
      return undefined;
    }
    const role = e.id.replace(/_[a-z]$/, '').split(/_+/).at(-1) ?? '';
    const named = Object.entries(table.quarters).find(([, q]) => q.roles.includes(role))?.[0];
    const mine = named && [...at.own].find(q => q.endsWith(`_q_${named}`));
    if (mine) { return mine; }
    const ends = world.related('connects').filter(c => c.args[1] === e.id || c.args[2] === e.id)
      .map(c => (c.args[1] === e.id ? c.args[2] : c.args[1])!);
    return ends.map(id => world.one('inQuarter', id)).find(Boolean);
  }
  static shown(world: World, byId: Map<string, Entity>, at?: string): { quarters?: QuarterRow[] } {
    const quarters = at ? this.of(world, byId, at) : undefined;
    return quarters ? { quarters } : {};
  }
  static of(world: World, byId: Map<string, Entity>, at: string): QuarterRow[] | undefined {
    if (!world.relates('inQuarter')) { return undefined; }
    const chain = Spatial.ancestry(byId, at), town = chain.find(e => e.space?.kind === 'settlement');
    if (!town) { return undefined; }
    const facts = world.related('inQuarter').map(r => [r.args[0]!, r.args[1]!] as const)
      .filter(([place]) => Spatial.ancestry(byId, place).some(e => e.id === town.id));
    if (!facts.length) { return undefined; }
    const mine = chain.map(e => facts.find(([place]) => place === e.id)?.[1]).find(Boolean);
    // Each place of the town in the quarter of the nearest place round it that has one (the inn's taproom with the
    // inn), in one pass over the town.
    const quarterOf = new Map<string, string>(facts), places = new Map<string, string[]>();
    const own = new Set(facts.map(([, q]) => q));
    for (const e of byId.values()) {
      if (!e.space) { continue; }
      const chain = Spatial.ancestry(byId, e.id);
      const q = chain.map(a => quarterOf.get(a.id)).find(Boolean)
        ?? this.placed(world, e, { town: town.id, chain, own });
      if (q) { places.set(q, [...places.get(q) ?? [], e.id]); }
    }
    // Standing in a place another module set here (a garden behind the inn), the quarter it was placed in.
    const here = mine ?? [...places].find(([, held]) => held.includes(at))?.[0];
    return [...places].map(([id, held]) => ({ id, name: byId.get(id)?.name ?? id, heart: world.one('heartOf', id) ?? '',
      places: held, here: id === here }))
      .sort((a, b) => Number(b.here) - Number(a.here));
  }
}
