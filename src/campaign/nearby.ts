import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import { WorldReads } from '../lang/world-reads';

interface Near { near: Set<string>; beside: Set<string> }

// What a company is near, and the ways it stands beside, wherever it stands: each read from the indexes of what is
// where it is (relatedTo), once for a world and a company, where LocalObservations.perceives asks of one thing at a
// time. A country's observations near a thing or beside a way are a thousand and more, each had been a search of
// where the company stands and whether the thing is near it (OR-91's profile: twice an act, about 15 ms each). What is
// near is what LocalObservations.near says is: where it is; travelling with someone where they are; guarding a way
// from its far end; carried by one of a company where the company is; set on a way from here; inside an open
// container here. Beside: a way from here.
export class Nearby {
  // What it read is noted again where it is used again inside a reading under way (see WorldReads).
  private static readonly kept = new WeakMap<World, Map<string, ReturnType<typeof WorldReads.of<Near>>>>();
  static of(world: World, actor: string): Near {
    const kept = this.kept.get(world) ?? new Map<string, ReturnType<typeof WorldReads.of<Near>>>();
    this.kept.set(world, kept);
    const had = kept.get(actor);
    if (had) {
      if (had.reads) { WorldReads.note(had.reads, had.picks); } else { WorldReads.all(); }
      return had.value;
    }
    const found = WorldReads.of(() => {
      const near: Near = { near: new Set(), beside: new Set() };
      for (const here of world.related('at', actor).map(r => r.args[1]!)) { this.read(world, here, near); }
      return near;
    });
    kept.set(actor, found);
    return found.value;
  }
  private static read(world: World, here: string, found: Near) {
    const { near, beside } = found, at = this.firsts(world, 'at', here), ways = world.relatedTo('connects', here);
    for (const e of at) { near.add(e); }
    if (world.relates('travelsWith')) { for (const w of at) { this.add(near, this.firsts(world, 'travelsWith', w)); } }
    if (world.relates('guards')) {
      for (const c of ways) {
        for (const e of this.firsts(world, 'guards', c.args[0]!)) {
          if (world.test(ModuleWriter.call('at', e, c.args[2]!))) { near.add(e); }
        }
      }
    }
    if (world.relates('ownedItem') && world.relates('memberOf')) {
      for (const company of at) {
        for (const bearer of this.firsts(world, 'memberOf', company)) {
          this.add(near, this.firsts(world, 'ownedItem', bearer));
        }
      }
    }
    for (const c of ways) { beside.add(c.args[0]!); }
    if (world.relates('on')) { for (const c of ways) { this.add(near, this.firsts(world, 'on', c.args[0]!)); } }
    if (world.relates('inside')) {
      for (const box of at) {
        if (!world.test(ModuleWriter.call('shut', box))) { this.add(near, this.firsts(world, 'inside', box)); }
      }
    }
  }
  // Whatever stands in a relation to this one (at(?, here)).
  private static firsts(world: World, name: string, second: string): string[] {
    return world.relatedTo(name, second).map(r => r.args[0]!);
  }
  private static add(to: Set<string>, ids: readonly string[]) { for (const id of ids) { to.add(id); } }
}
