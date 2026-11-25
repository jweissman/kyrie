// The owner's ruling (25 November): "I wonder if we shouldn't forbid using the old masters painting for backgrounds;
// only commissioned pieces … they should only be for tarot cards and ofc the portraits." A scene's or a room's
// background is one of the owner's commissioned scenes (the scene-* paintings from assets/bg, data/paintings/
// sources.json), never an old master; the old masters stay for portraits and the tarot. The scenery tables are read
// through this, so that no list of them yields an old master, and a list that held only old masters is empty, and gives
// way to what the place would otherwise be painted by (its terrain, its site, its kind).
export class Commissioned {
  static is(painting: string): boolean { return painting.startsWith('scene-'); }
  static only(list: readonly string[]): string[] { return list.filter(p => this.is(p)); }
  static lists(table: Record<string, string[]>): Record<string, string[]> {
    return Object.fromEntries(Object.entries(table).map(([k, v]) => [k, this.only(v)]));
  }
  // An author's own painting for a place, or several: those commissioned, none where none is.
  static places(table: Record<string, string | string[]>): Record<string, string | string[]> {
    return Object.fromEntries(Object.entries(table).map(([k, v]) => [k, typeof v === 'string' ? v : this.only(v)] as const)
      .filter(([, v]) => typeof v === 'string' ? this.is(v) : v.length));
  }
  // A list's commissioned paintings; no list where it held only old masters (an empty list says a dim ground).
  static kept(list: readonly string[] | undefined): string[] | undefined {
    return !list || (list.length && !this.only(list).length) ? undefined : this.only(list);
  }
  // The first list with anything in it: a kind's or a land's own, else what it gives way to.
  static first(...lists: (readonly string[] | undefined)[]): string[] {
    return [...lists.find(l => l?.length) ?? []];
  }
}
