import type { CreatureStore } from '../creature-store';

// What of the world the reckoning reads: who is dead and who awake, what would raise whom and who can cast it.
interface Facts { related(name: string, first?: string): readonly { args: string[] }[];
  relatedTo(name: string, second: string): readonly { args: string[] }[] }

// The one who plays, dead where they fell, ends the life (OR-683, cold play 2 of 25 November): Brokk did not come
// round at a rest, and the game went on, his ranger offered his axe, "0 of 30" over a corpse, no ending and no new
// life. The one who plays is the company's first (everyone else is a companion: CreatureFacts.companions), dead as
// the care rules say (slain). Unless one of the company still awake can raise them where they lie (a raising
// prepared, which the field offers: FieldUse), the story is over, as it is when no one is left standing.
export class LifeLost {
  static lost(world: Facts, entities: readonly { id: string; creatureId?: string }[], creatures: CreatureStore,
    first?: string): boolean {
    if (first === undefined || creatures.peek(first).state.hp > 0) { return false; }
    const ref = entities.find(e => e.creatureId === first)?.id;
    if (!ref || !world.related('slain', ref).length) { return false; }
    const raisings = world.related('treatable', ref).map(t => t.args[1]!);
    return !raisings.some(a => world.relatedTo('canCast', a).some(k => world.related('awake', k.args[0]!).length > 0));
  }
}
