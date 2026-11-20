import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { WorldReads } from '../lang/world-reads';

interface Grounding { module: Module; reads: string[]; stamped: number[]; ops: Operator[] }
// What one schema grounds to for one actor, kept from one world to the next of its line while nothing it read has
// been written (see WorldReads, World.agrees): an act writes a few names, and of two thousand schemas grounded for
// every world (what the company may do, worked out again after each act) all but a few dozen read none of them
// (OR-91: the offered actions a sixth of an act). A grounding that read everything keeps nothing. Kept by the
// Operators it was made by, so a changed module, entity list or controllers keep nothing either.
export class KeptGroundings {
  private readonly by = new Map<string, Map<string, Grounding>>();
  // How many actors' groundings are kept at once: the player's, and a few townsfolk planning in turn.
  private static readonly actors = 16;
  of(world: World, schema: Operator, actor: string | undefined, ground: () => Operator[]): Operator[] {
    const kept = this.actor(actor ?? ''), was = kept.get(schema.id);
    if (was && was.module === world.module && world.agrees(was.reads, was.stamped)) {
      WorldReads.note(was.reads);
      return was.ops;
    }
    const { value, reads } = WorldReads.of(ground);
    if (reads) { kept.set(schema.id, { module: world.module, reads, stamped: world.stamped(reads), ops: value }); }
    else { kept.delete(schema.id); }
    return value;
  }
  private actor(actor: string): Map<string, Grounding> {
    let kept = this.by.get(actor);
    if (kept) { this.by.delete(actor); this.by.set(actor, kept); return kept; }
    kept = new Map();
    this.by.set(actor, kept);
    if (this.by.size > KeptGroundings.actors) { this.by.delete(this.by.keys().next().value!); }
    return kept;
  }
}
