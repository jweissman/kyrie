import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';

// A company beaten by those who take prisoners (the lord's riders, a reeve's men, customs-men with a warrant) is taken,
// not killed: each of its fallen is left with a little life, and the world knows who has them (captured), so that what
// happens next (a night in the lockup, a fine taken from the purse) is the captors' to say. Those who would kill keep
// killing; only those the world says take prisoners spare anyone.
export class Mercy {
  static spare(world: World, creatures: CreatureStore, at: { partyIds: string[]; inhabitants: Record<string, string[]>;
    player?: string | undefined; combat: CombatEvent[] }): World | undefined {
    if (!at.player || !world.module.relations.some(r => r.name === 'takesPrisoners')) { return undefined; }
    const fought = new Set(at.combat.flatMap(e => e.type === 'action' ? [e.command.actor] : []));
    const captor = Object.entries(at.inhabitants).find(([group, members]) => members.some(m => fought.has(m))
      && world.test(ModuleWriter.call('takesPrisoners', group)))?.[0];
    const fallen = at.partyIds.filter(id => creatures.snapshot.find(c => c.id === id)?.state.hp === 0);
    if (!captor || fallen.length < at.partyIds.length) { return undefined; }
    const lease = creatures.acquire(fallen);
    try {
      for (const c of lease.creatures) { c.state.hp = 1; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    return world.apply([{ kind: 'assert', call: ModuleWriter.call('captured', captor, at.player) },
      { kind: 'retract', call: ModuleWriter.call('assails', captor, at.player) }]);
  }
}
