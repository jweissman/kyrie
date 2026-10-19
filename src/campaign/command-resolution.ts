import type { CampaignActor } from './definition';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';
import type { Change, Entity, Operator, WorldState } from '../lang/module';
import { World } from '../lang/world';

export interface CommandResolution {
  version: 1; id: string; actor?: string; source: string;
  bindings: Record<string, string>; elapsed: { start: number; end: number };
  outcome: 'success' | 'failure' | 'partial' | 'interrupted';
  bodies: { id: string; before: Creature['state']; after: Creature['state'] }[];
  world: Change[]; events: CombatEvent[];
}

// A committed receipt, not an executor. World and CreatureStore remain the only state owners.
export class CommandResolutions {
  static survived(action: Operator, creatures: Creature[], actors: CampaignActor[] | undefined, entities: Entity[]) {
    const members = actors?.find(a => a.id === action.actor)?.members;
    if (members && !creatures.some(c => members.includes(c.id) && c.state.hp > 0)) { return false; }
    const target = action.resolve?.name === 'expose'
      ? entities.find(e => e.id === action.resolve!.args[1])?.creatureId : undefined;
    return !target || creatures.some(c => c.id === target && c.state.hp > 0);
  }
  static world(before: WorldState, after: WorldState): Change[] {
    const changes: Change[] = [];
    for (const call of before.relations) {
      if (!after.relations.some(c => World.key(c) === World.key(call))) { changes.push({ kind: 'retract', call }); }
    }
    for (const call of after.relations) {
      if (!before.relations.some(c => World.key(c) === World.key(call))) { changes.push({ kind: 'assert', call }); }
    }
    for (const m of after.measures) {
      if (before.measures.find(c => World.key(c.call) === World.key(m.call))?.value !== m.value) {
        changes.push({ kind: 'set', call: m.call, value: { kind: 'number', value: m.value } });
      }
    }
    return structuredClone(changes);
  }
  static receipt(action: Operator, before: { creatures: Creature[]; world: WorldState; elapsed: number },
    after: { creatures: Creature[]; world: WorldState; elapsed: number },
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
      bodies: after.creatures.flatMap(c => {
        const previous = before.creatures.find(b => b.id === c.id);
        return previous && JSON.stringify(previous.state) !== JSON.stringify(c.state)
          ? [{ id: c.id, before: structuredClone(previous.state), after: structuredClone(c.state) }] : [];
      }), world: this.world(before.world, after.world), events: structuredClone(events) };
  }
}
