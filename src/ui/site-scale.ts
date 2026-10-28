import type { Entity } from '../lang/module';

// How big a place set out for is, as those who tell of it would say: one that goes down level under level, a large
// place, or a small one; said before the journey (NAV-09: a minor cave could be taken for the reward of a long one).
export class SiteScale {
  private static readonly read = new WeakMap<readonly Entity[], Map<string, { rooms: number; levels: number }>>();
  // The place set out for is the site, or the ground before it in wild country (region__w3, its site region__w3_site).
  static of(entities: readonly Entity[], id: string): string | undefined {
    const sizes = this.sizes(entities), size = sizes.get(id) ?? sizes.get(`${id}_site`);
    if (!size) { return undefined; }
    return size.levels >= 2 ? 'goes down a long way' : size.rooms >= 10 ? 'a large place'
      : size.rooms <= 3 ? 'a small place' : undefined;
  }
  // Every site's rooms and levels, counted once for each module: each place counts to every site it lies within.
  private static sizes(entities: readonly Entity[]): Map<string, { rooms: number; levels: number }> {
    const kept = this.read.get(entities);
    if (kept) { return kept; }
    const byId = new Map(entities.map(e => [e.id, e])), sizes = new Map<string, { rooms: number; levels: number }>();
    for (const e of entities.filter(x => x.type === 'place' && x.space)) {
      for (let up = e.space!.parent, n = 0; up && n < 8; up = byId.get(up)?.space?.parent, n++) {
        if (byId.get(up)?.space?.kind !== 'site') { continue; }
        const size = sizes.get(up) ?? sizes.set(up, { rooms: 0, levels: 0 }).get(up)!;
        if (e.space!.kind === 'level') { size.levels++; } else if (e.space!.kind === 'room') { size.rooms++; }
      }
    }
    this.read.set(entities, sizes);
    return sizes;
  }
}
