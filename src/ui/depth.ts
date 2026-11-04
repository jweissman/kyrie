import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import { Spatial } from '../spatial';

interface Way { passage: string; from: string; to: string }

// How many storeys under the ground a place is (the owner, 4 November: the page should say how deep below the town
// the company has gone): as its author says ("underground 2 down"); otherwise reckoned from the open air, or from a
// place whose depth its author gives, one more for each stair, steps, ladder or shaft taken, and for each level of a
// site below the one before; the least any way to it gives. Nothing for a place above the ground.
export class Depth {
  private static readonly down = new Set(['way_stair', 'way_steps', 'way_ladder', 'way_shaft']);
  // Reckoned once for a module's places: the ways between them do not change from one command to the next.
  private static readonly cache = new WeakMap<Map<string, Entity>, Map<string, number>>();
  private constructor(private readonly entities: Map<string, Entity>, private readonly world: World) {}
  static of(entities: Map<string, Entity>, world: World, id: string): number | undefined {
    if (entities.get(id)?.space?.shelter !== 'underground') { return undefined; }
    let depths = this.cache.get(entities);
    if (!depths) { depths = new Depth(entities, world).reckon(); this.cache.set(entities, depths); }
    return Math.max(1, depths.get(id) ?? 1);
  }
  private under(id: string): boolean { return this.entities.get(id)?.space?.shelter === 'underground'; }
  private said(id: string): number | undefined { return this.entities.get(id)?.space?.depth; }
  private reckon(): Map<string, number> {
    const ways: Way[] = this.world.related('connects').map(r => ({ passage: r.args[0]!, from: r.args[1]!, to: r.args[2]! }))
      .filter(w => this.under(w.to));
    const depths = new Map<string, number>();
    for (const w of ways) {
      if (!this.under(w.from)) { depths.set(w.from, 0); }
      for (const end of [w.from, w.to]) { if (this.said(end) !== undefined) { depths.set(end, this.said(end)!); } }
    }
    // Relaxed until nothing comes nearer the surface: a way adds what it goes down by.
    for (let changed = true, rounds = 0; changed && rounds < 64; rounds++) {
      changed = false;
      for (const w of ways) {
        const from = depths.get(w.from);
        if (from === undefined || this.said(w.to) !== undefined) { continue; }
        const to = from + this.drop(w);
        if (to < (depths.get(w.to) ?? Infinity)) { depths.set(w.to, to); changed = true; }
      }
    }
    return depths;
  }
  private level(id: string): Entity | undefined {
    return Spatial.ancestry(this.entities, id).find(e => e.space?.kind === 'level');
  }
  private drop(w: Way): number {
    const [a, b] = [this.level(w.from), this.level(w.to)];
    if (a && b && a.id !== b.id && a.space?.parent === b.space?.parent) {
      const levels = [...this.entities.values()].filter(e => e.space?.kind === 'level' && e.space.parent === a.space?.parent);
      return Math.max(1, levels.indexOf(b) - levels.indexOf(a));
    }
    return Depth.down.has(this.world.one('passageKind', w.passage) ?? '') ? 1 : 0;
  }
}
