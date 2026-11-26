import type { CombatEvent, Fighter } from './model';

// A kind's natural attack routine (a dragon's claw, claw and bite; see Species.statistics.attacks): its plain blow is
// each of them in turn, a roll each, as one action, until what it strikes at is down. The second and later strikes
// are told as strikes, not as actions of their own.
export class AttackRoutine {
  // perform strikes once and says whether what was struck at is down.
  static strike(actor: Fighter, ability: string, history: CombatEvent[], perform: () => boolean) {
    const routine = ability === 'melee' && actor.equipment?.routine?.length ? actor.equipment.routine : [undefined];
    for (const [i, weapon] of routine.entries()) {
      if (weapon) { actor.equipment = { ...actor.equipment!, weapon }; }
      const start = history.length;
      const down = perform();
      if (i > 0 && history[start]?.type === 'action') { history.splice(start, 1); }
      if (down) { return; }
    }
  }
}
