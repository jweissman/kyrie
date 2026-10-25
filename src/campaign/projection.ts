import { CreatureFacts } from './creature-facts';
import { Environment } from './environment';
import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import type { CreatureStore } from '../creature-store';
import type { World } from '../lang/world';

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
  private dirty(world: World, actors: readonly CampaignActor[], store: CreatureStore): CampaignActor[] {
    const seen = this.seen;
    const all = !seen || seen.module !== world.module || !seen.sameLine(world);
    const touched = new Set((all ? [] : world.differing(seen, CreatureFacts.reads)).flatMap(c => c.args));
    const moves = all ? [] : world.differing(seen, Projection.places), moved = new Set(moves.map(c => c.args[0]));
    // A place gone dark or lit, or its ground said, may be anyone's environment.
    const places = all || moves.some(c => c.name !== 'at');
    const records = store !== this.store || store.version !== this.revision;
    const references = CreatureFacts.declared(world.module).references, dirty: CampaignActor[] = [];
    for (const actor of actors) {
      const was = this.inputs.get(actor.id), kept = was?.actor === actor ? was : undefined;
      const members = records || !kept ? actor.members.map(id => store.peek(id)) : kept.members;
      const environment = places || !kept || moved.has(actor.id) ? Environment.of(world, actor.id) : kept.environment;
      this.inputs.set(actor.id, { actor, members, environment });
      if (all || !kept || kept.environment !== environment || Projection.replaced(kept.members, members)
        || touched.has(actor.id) || actor.members.some(id => touched.has(references.get(id) ?? id))) {
        dirty.push(actor);
      }
    }
    return dirty;
  }
  private static replaced(was: readonly Creature[], is: readonly Creature[]): boolean {
    return was.length !== is.length || is.some((c, i) => c !== was[i]);
  }
}
