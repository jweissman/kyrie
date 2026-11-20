import type { Module, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { KeptReading, type Kept } from '../lang/kept-reading';

type Grounding = Kept<Operator[]> & { module: Module };
// What one schema grounds to for one actor, kept from one world to the next of its line while nothing it read has
// been written, or nothing of what it picked of a name written (see KeptReading): an act writes a few names, and of two
// thousand schemas grounded for every world (what the company may do, worked out again after each act) all but a few
// dozen read none of them, and of those most asked only whether the company knows one thing or where one thing stands
// (OR-91: the offered actions a sixth of an act). A grounding that read everything keeps nothing. Kept by the
// Operators it was made by, so a changed module, entity list or controllers keep nothing either.
export class KeptGroundings {
  private readonly by = new Map<string, Map<string, Grounding>>();
  // How many actors' groundings are kept at once: the player's, and a few townsfolk planning in turn.
  private static readonly actors = 16;
  of(world: World, schema: Operator, actor: string | undefined, ground: () => Operator[]): Operator[] {
    const kept = this.actor(actor ?? ''), was = kept.get(schema.id);
    if (was && was.module === world.module && KeptReading.holds(world, was)) { return was.value; }
    const read = KeptReading.read(world, ground);
    if (read.kept) { kept.set(schema.id, { ...read.kept, module: world.module }); } else { kept.delete(schema.id); }
    return read.value;
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
