import type { Module, Operator, World } from '../lang';
import { KeptReading, type Kept } from '../lang/kept-reading';
import { WorldReads } from '../lang/world-reads';

type Grounding = Kept<Operator[]> & { module: Module };
// Every schema an actor may ground, as last grounded together: the world they were asked in, the names each one's
// grounding read and the schemas that read each name (with its stamp in that world), those that read everything, and
// what they ground to, each and in order.
interface Line {
  // line: the world line they were asked in (World.stamped), never the world itself (see Kept).
  line: number[]; module: Module; schemas: readonly Operator[]; out: Operator[]; values: Map<string, Operator[]>;
  by: Map<string, Set<string>>; names: Map<string, readonly string[]>; stamps: Map<string, number>;
  unkept: Set<string>;
}
// How the caller grounds a schema, and finds it shut (see all).
export interface Asking { ground(schema: Operator): Operator[]; closed?(schema: Operator): boolean }
interface Actor { kept: Map<string, Grounding>; line?: Line }
// What one schema grounds to for one actor, kept from one world to the next of its line while nothing it read has
// been written, or nothing of what it picked of a name written (see KeptReading): an act writes a few names, and of two
// thousand schemas grounded for every world (what the company may do, worked out again after each act) all but a few
// dozen read none of them, and of those most asked only whether the company knows one thing or where one thing stands
// (OR-91: the offered actions a sixth of an act). A grounding that read everything keeps nothing. Kept by the
// Operators it was made by, so a changed module, entity list or controllers keep nothing either.
// And all an actor's schemas at once (all): only those that read a name written since are asked again, found by the
// names each read, not by asking each of the two thousand whether it still holds (OR-91: observe's grounding walk).
export class KeptGroundings {
  private readonly by = new Map<string, Actor>();
  private static readonly none: Operator[] = [];
  // How many actors' groundings are kept at once: the player's, and a few townsfolk planning in turn.
  private static readonly actors = 16;
  of(world: World, schema: Operator, actor: string | undefined, ground: () => Operator[]): Operator[] {
    const kept = this.actor(actor ?? '').kept, was = kept.get(schema.id);
    if (was && was.module === world.module && KeptReading.holds(world, was)) { return was.value; }
    const read = KeptReading.read(world, ground);
    // The same operators as were kept are given as the same list, so that what is kept by it holds (see all).
    const value = was && KeptGroundings.alike(was.value, read.value) ? was.value : read.value;
    if (read.kept) { kept.set(schema.id, { ...read.kept, value, module: world.module }); }
    else { kept.delete(schema.id); }
    return value;
  }
  // What the schemas ground to together, in their order: each as `of` has it. A schema the caller finds shut in this
  // world (closed: no one it needs is with the actor, see PresenceGate) grounds to nothing without a reading of its
  // own, and is asked again every time: when the company moves, a thousand words with people elsewhere had each been
  // found stale by where the company is, and each read afresh to find it so (OR-183).
  all(world: World, actor: string | undefined, schemas: readonly Operator[], ask: Asking): Operator[] {
    const a = this.actor(actor ?? ''), was = a.line, same = !!was && this.same(was, world, schemas);
    const line = same ? was! : KeptGroundings.line(world, schemas);
    const stale = same ? this.stale(line, world) : new Set(schemas.map(s => s.id));
    let changed = !same;
    for (const schema of schemas) {
      if (!stale.has(schema.id)) { if (WorldReads.under()) { this.noted(a, schema.id); } continue; }
      const shut = ask.closed?.(schema);
      if (shut) { a.kept.delete(schema.id); }
      const value = shut ? KeptGroundings.none : this.of(world, schema, actor, () => ask.ground(schema));
      this.index(line, schema.id, a.kept.get(schema.id));
      const had = line.values.get(schema.id);
      if (value !== had && !(had && KeptGroundings.alike(had, value))) {
        changed = true; line.values.set(schema.id, value);
      }
    }
    if (changed) { line.out = schemas.flatMap(s => line.values.get(s.id) ?? []); }
    for (const name of line.by.keys()) { line.stamps.set(name, world.stamp(name)); }
    line.line = world.stamped([]);
    a.line = line;
    return line.out;
  }
  private static alike(a: readonly Operator[], b: readonly Operator[]): boolean {
    return a.length === b.length && a.every((op, i) => op === b[i]);
  }
  private static line(world: World, schemas: readonly Operator[]): Line {
    return { line: world.stamped([]), module: world.module, schemas, out: [], values: new Map(), by: new Map(),
      names: new Map(), stamps: new Map(), unkept: new Set() };
  }
  // Whether the schemas are those last grounded, in a world of the same line and module.
  private same(line: Line, world: World, schemas: readonly Operator[]): boolean {
    return line.module === world.module && world.agrees([], line.line) && line.schemas.length === schemas.length
      && line.schemas.every((s, i) => s === schemas[i]);
  }
  // The schemas that read a name written since the world they were last asked in, and those that read everything.
  private stale(line: Line, world: World): Set<string> {
    const stale = new Set(line.unkept);
    for (const [name, ids] of line.by) {
      if (world.stamp(name) !== line.stamps.get(name)) { for (const id of ids) { stale.add(id); } }
    }
    return stale;
  }
  // The names a schema's grounding read, by which it is found stale (none kept: stale every time).
  private index(line: Line, id: string, kept: Grounding | undefined) {
    for (const name of line.names.get(id) ?? []) { line.by.get(name)?.delete(id); }
    if (!kept) { line.names.delete(id); line.unkept.add(id); return; }
    line.unkept.delete(id);
    line.names.set(id, kept.reads);
    for (const name of kept.reads) {
      const ids = line.by.get(name);
      if (ids) { ids.add(id); } else { line.by.set(name, new Set([id])); }
    }
  }
  // A grounding kept and not asked again is still read by whatever reading is under way (see WorldReads.note).
  private noted(a: Actor, id: string) {
    const kept = a.kept.get(id);
    if (kept) { WorldReads.note(kept.reads, kept.picks); } else { WorldReads.all(); }
  }
  private actor(actor: string): Actor {
    let kept = this.by.get(actor);
    if (kept) { this.by.delete(actor); this.by.set(actor, kept); return kept; }
    kept = { kept: new Map() };
    this.by.set(actor, kept);
    if (this.by.size > KeptGroundings.actors) { this.by.delete(this.by.keys().next().value!); }
    return kept;
  }
}
