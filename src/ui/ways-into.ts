import type { Call, Entity } from '../lang/module';
import { Spatial } from '../spatial';

// The ways into each place from outside it: for every way (connects(way, from, to)), each place its far end is in and
// its near end is not. Worked out once for a world's ways and its places (what the ways are is the same from world to
// world until one is written), not once for each place a company has been told of: each had gone through every way of
// the country and walked up from both its ends (OR-91's profile, 19 November: a tenth of the screen).
export class WaysInto {
  private static readonly kept = new WeakMap<readonly Call[],
    { byId: Map<string, Entity>; into: Map<string, string[]> }>();
  static of(connects: readonly Call[], byId: Map<string, Entity>, place: string): readonly string[] {
    let kept = this.kept.get(connects);
    if (kept?.byId !== byId) { kept = { byId, into: this.read(connects, byId) }; this.kept.set(connects, kept); }
    return kept.into.get(place) ?? [];
  }
  private static read(connects: readonly Call[], byId: Map<string, Entity>): Map<string, string[]> {
    const into = new Map<string, string[]>();
    for (const c of connects) {
      const from = this.within(byId, c.args[1]!);
      for (const place of this.within(byId, c.args[2]!)) {
        if (from.has(place)) { continue; }
        const ways = into.get(place);
        if (ways) { ways.push(c.args[0]!); } else { into.set(place, [c.args[0]!]); }
      }
    }
    return into;
  }
  // A place and every place it is within.
  private static within(byId: Map<string, Entity>, id: string): Set<string> {
    return new Set([id, ...Spatial.ancestry(byId, id).map(e => e.id)]);
  }
}
