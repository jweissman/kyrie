import type { Call, Entity } from '../lang/module';

interface Size { rooms: number; levels: number; up: boolean }

// How big a place set out for is, as those who tell of it would say: one that goes down level under level (or up,
// a tower's), a large place, or a small one; said before the journey (NAV-09: a minor cave could be taken for the
// reward of a long one).
export class SiteScale {
  private static readonly read = new WeakMap<readonly Entity[], Map<string, Size>>();
  private static readonly doors = new WeakMap<readonly Call[], Map<string, string>>();
  // The place set out for is the site, or the ground before it in wild country (region__w3, its site
  // region__w3_site), or the foot of a site its ways go into (a lone tower's, its keep a module's own site); the
  // ways are the world's `connects` facts.
  static of(entities: readonly Entity[], id: string, ways: readonly Call[] = []): string | undefined {
    const sizes = this.sizes(entities), size = sizes.get(id) ?? sizes.get(`${id}_site`)
      ?? sizes.get(this.behind(entities, id, ways) ?? '');
    if (!size) { return undefined; }
    return size.levels >= 2 ? size.up ? 'level upon level' : 'goes down a long way' : size.rooms >= 10 ? 'a large place'
      : size.rooms <= 3 ? 'a small place' : undefined;
  }
  // The site whose ways in go from this place, itself in no site: the keep behind a tower's foot.
  static behind(entities: readonly Entity[], id: string, ways: readonly Call[]): string | undefined {
    let doors = this.doors.get(ways);
    if (!doors) {
      const byId = new Map(entities.map(e => [e.id, e]));
      doors = new Map(ways.flatMap(w => {
        const into = this.sites(byId, w.args[2]!)[0];
        return into && !this.sites(byId, w.args[1]!).length && byId.get(w.args[1]!)?.space?.kind !== 'site'
          ? [[w.args[1]!, into] as const] : [];
      }));
      this.doors.set(ways, doors);
    }
    return doors.get(id);
  }
  // Every site's rooms and levels, counted once for each module: each place counts to every site it lies within.
  private static sizes(entities: readonly Entity[]): Map<string, Size> {
    const kept = this.read.get(entities);
    if (kept) { return kept; }
    const byId = new Map(entities.map(e => [e.id, e])), sizes = new Map<string, Size>();
    for (const e of entities.filter(x => x.type === 'place' && x.space)) {
      for (const up of this.sites(byId, e.id)) {
        const size = sizes.get(up) ?? sizes.set(up, { rooms: 0, levels: 0, up: false }).get(up)!;
        if (e.space!.kind === 'level') { size.levels++; size.up ||= this.rising.test(e.name); }
        else if (e.space!.kind === 'room') { size.rooms++; }
      }
    }
    this.read.set(entities, sizes);
    return sizes;
  }
  // The sites a place lies within, nearest first.
  private static sites(byId: Map<string, Entity>, id: string): string[] {
    const found: string[] = [];
    for (let up = byId.get(id)?.space?.parent, n = 0; up && n < 8; up = byId.get(up)?.space?.parent, n++) {
      if (byId.get(up)?.space?.kind === 'site') { found.push(up); }
    }
    return found;
  }
  // A level above the ground: the top of a tower, its roof (a mine's "upper works" are not).
  private static readonly rising = /\b(top|roof|leads|battlements|belfry)\b/i;
}
