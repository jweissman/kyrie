import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';
import type { Change, Entity, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';

export interface CommandResolution {
  version: 1; id: string; actor?: string; source: string;
  bindings: Record<string, string>; elapsed: { start: number; end: number };
  outcome: 'success' | 'failure' | 'partial' | 'interrupted';
  bodies: { id: string; before: Creature['state']; after: Creature['state'] }[];
  world: Change[]; events: CombatEvent[];
}

// A committed receipt, not an executor. World and CreatureStore remain the only state owners.
export class CommandResolutions {
  static survived(action: Operator, creatures: readonly Creature[], actors: CampaignActor[] | undefined,
    entities: Entity[]) {
    const members = actors?.find(a => a.id === action.actor)?.members;
    if (members && !creatures.some(c => members.includes(c.id) && c.state.hp > 0)) { return false; }
    const target = action.resolve?.name === 'expose'
      ? entities.find(e => e.id === action.resolve!.args[1])?.creatureId : undefined;
    return !target || creatures.some(c => c.id === target && c.state.hp > 0);
  }
  // What a failed exposure says where its author said nothing: the one who went first brought down, and, on a way, the
  // company not over it (that it "does not cross" was said of a rack heaved off a guest: the architecture review's L1).
  static downed(action: Operator, world: World): string {
    if (action.schema === 'risk') {
      return 'The hazard brings down the exposed adventurer. The company does not cross; the injury is permanent until treated.';
    }
    return `${ObservationText.label(world, action.resolve!.args[1]!)} is brought down; the hurt lasts until it is treated.`;
  }
  // What a command changed in the world: of the relations and measures it wrote, not of every fact.
  static world(before: World, after: World): Change[] { return structuredClone(after.changesSince(before)); }
  static receipt(action: Operator, before: { creatures: readonly Creature[]; world: World; elapsed: number },
    after: { creatures: readonly Creature[]; world: World; elapsed: number },
    result: { events: CombatEvent[]; success: boolean; sequence: number }): CommandResolution {
    const { events, success, sequence } = result;
    const interrupted = events.some(e => e.type === 'end' && e.outcome === 'escaped')
      || (!success && ['recover', 'rough'].includes(action.resolve?.name ?? '')
        && !events.some(e => e.type === 'death'));
    const effectSource = action.resolve?.name !== 'combat'
      ? events.find(e => e.type === 'action')?.source?.id : undefined;
    return { version: 1, id: `command:${sequence}`, ...(action.actor ? { actor: action.actor } : {}),
      source: effectSource ?? action.bindings?.trap ?? action.actor ?? action.id,
      bindings: structuredClone(action.bindings ?? {}),
      elapsed: { start: before.elapsed, end: after.elapsed },
      outcome: interrupted ? 'interrupted' : success ? 'success' : 'failure',
      bodies: CommandResolutions.bodies(before.creatures, after.creatures),
      world: this.world(before.world, after.world),
      events: structuredClone(events) };
  }
  // The bodies a command changed: a creature's record is replaced when it changes and never changed where it lies,
  // so one still the same record is unchanged; of the others, those whose state differs.
  private static bodies(before: readonly Creature[], after: readonly Creature[]): CommandResolution['bodies'] {
    const prior = new Map(before.map(c => [c.id, c]));
    return after.flatMap(c => {
      const previous = prior.get(c.id);
      return previous && previous !== c && JSON.stringify(previous.state) !== JSON.stringify(c.state)
        ? [{ id: c.id, before: structuredClone(previous.state), after: structuredClone(c.state) }] : [];
    });
  }
}
