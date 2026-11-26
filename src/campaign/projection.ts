import { CreatureFacts } from './creature-facts';
import { Environment } from './environment';
import { QuietWatches } from './quiet-watches';
import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import type { CreatureStore } from '../creature-store';
import type { World } from '../lang/world';

interface Scan { world: World; store: CreatureStore; records: boolean; places: boolean; all: boolean;
  touched: Set<string | undefined>; moved: Set<string | undefined>; references: Map<string, string> }
interface Input { actor: CampaignActor; members: readonly Creature[]; environment?: string }
// Which actors' facts are projected again (see CreatureFacts.project). An actor's projection turns on its members'
// records, the environment where it stands, and what the world holds of the relations the projection writes and
// reads about it; an actor none of these has changed for since the last projection is left as it is. What changed is
// found without going through every actor's facts: a creature's record is replaced when it changes, and a world
// shares a relation's facts with the world before until it writes that relation (Mission 15's profile: every actor's
// facts projected again on every watch of a rest, because a torch burned down).
export class Projection {
  // The relations and measures read for the projection, and for where an actor stands and what is there.
  private static readonly places = ['at', 'unlit', 'terrain'];
  private seen?: World;
  private store?: CreatureStore;
  private revision = -1;
  private inputs = new Map<string, Input>();
  refresh(world: World, actors: readonly CampaignActor[], store: CreatureStore): World {
    if (world === this.seen && store === this.store && store.version === this.revision) { return world; }
    const dirty = this.dirty(world, actors, store);
    const projected = dirty.length ? CreatureFacts.project(world, dirty, store) : world;
    this.seen = projected; this.store = store; this.revision = store.version;
    return projected;
  }
  // As it stands, for a copy of the campaign (Campaign.fork) playing in the same world under its own module, with a
  // copy of its creatures: an actor stands projected where it stood here, while each of its members' records is
  // the same in the copy as it was here (a copy's record is made again as it is taken in, and is compared, not
  // assumed). Not as it stands where it does not stand for this world and these creatures: then all of it again.
  forked(world: World, was: CreatureStore, to: { world: World; store: CreatureStore }): Projection {
    const copy = new Projection(), store = to.store;
    if (this.seen !== world || this.store !== was || this.revision !== was.version) { return copy; }
    copy.seen = to.world; copy.store = store; copy.revision = store.version;
    for (const [id, input] of this.inputs) {
      const members = input.members.map(c => store.peek(c.id));
      if (members.every((c, i) => JSON.stringify(c) === JSON.stringify(input.members[i]))) {
        copy.inputs.set(id, { ...input, members });
      }
    }
    return copy;
  }
  private dirty(world: World, actors: readonly CampaignActor[], store: CreatureStore): CampaignActor[] {
    const seen = this.seen;
    const all = !seen || seen.module !== world.module || !seen.sameLine(world);
    const touched = new Set((all ? [] : world.differing(seen, CreatureFacts.reads)).flatMap(c => c.args));
    const moves = all ? [] : world.differing(seen, Projection.places), moved = new Set(moves.map(c => c.args[0]));
    // A place gone dark or lit, or its ground said, may be anyone's environment.
    const places = all || moves.some(c => c.name !== 'at');
    const records = store !== this.store || store.version !== this.revision;
    const references = CreatureFacts.declared(world.module).references, dirty: CampaignActor[] = [];
    const scan = { world, store, records, places, all, touched, moved, references };
    // Where only facts were written (the actors, their records and every place's darkness and ground as they were),
    // only the actors those facts name, or who moved, are read again: of the country's hundreds of actors, a watch on
    // a route had read every one again, several times a watch, to find none or one (OR-721).
    if (!all && !records && !places && !QuietWatches.afresh && this.same(actors)) {
      const named = this.named(actors, references), at = new Set<number>();
      const every = QuietWatches.witness && actors.filter(a => this.stale(a, scan, false));
      for (const id of [...touched, ...moved]) { for (const i of named.get(id!) ?? []) { at.add(i); } }
      for (const i of [...at].sort((a, b) => a - b)) { if (this.stale(actors[i]!, scan)) { dirty.push(actors[i]!); } }
      if (every) { Projection.checked(every, dirty); }
      return dirty;
    }
    for (const actor of actors) { if (this.stale(actor, scan)) { dirty.push(actor); } }
    this.scanned = [...actors]; this.index = undefined;
    return dirty;
  }
  // Under the oracle (test/quiet-watches), the actors read again are those a reading of every one finds.
  private static checked(every: CampaignActor[], dirty: CampaignActor[]) {
    if (every.length !== dirty.length || every.some((a, i) => a !== dirty[i])) {
      throw new Error(`Projection: ${dirty.map(a => a.id).join()} read again, not ${every.map(a => a.id).join()}`);
    }
  }
  private stale(actor: CampaignActor, at: Scan, keep = true) {
    const was = this.inputs.get(actor.id), kept = was?.actor === actor ? was : undefined;
    const members = at.records || !kept ? actor.members.map(id => at.store.peek(id)) : kept.members;
    const environment = at.places || !kept || at.moved.has(actor.id) ? Environment.of(at.world, actor.id)
      : kept.environment;
    if (keep) { this.inputs.set(actor.id, { actor, members, environment }); }
    return at.all || !kept || kept.environment !== environment || Projection.replaced(kept.members, members)
      || at.touched.has(actor.id) || actor.members.some(id => at.touched.has(at.references.get(id) ?? id))
      // The player's company come somewhere new may have earned a surface there (a library: see Earned).
      || (!!actor.player && at.moved.has(actor.id));
  }
  // The actors last read whole, and by whom each is named (itself, its members, or who stands for them).
  private scanned: readonly CampaignActor[] = [];
  private index?: { references: Map<string, string>; named: Map<string, number[]> };
  private same(actors: readonly CampaignActor[]): boolean {
    return actors.length === this.scanned.length && actors.every((a, i) => a === this.scanned[i]);
  }
  private named(actors: readonly CampaignActor[], references: Map<string, string>): Map<string, number[]> {
    if (this.index?.references === references) { return this.index.named; }
    const named = new Map<string, number[]>();
    for (const [i, actor] of actors.entries()) {
      for (const id of [actor.id, ...actor.members.map(m => references.get(m) ?? m)]) {
        const those = named.get(id);
        if (!those) { named.set(id, [i]); } else if (those.at(-1) !== i) { those.push(i); }
      }
    }
    this.index = { references, named };
    return named;
  }
  private static replaced(was: readonly Creature[], is: readonly Creature[]): boolean {
    return was.length !== is.length || is.some((c, i) => c !== was[i]);
  }
}
