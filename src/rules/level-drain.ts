import { Amounts } from './amounts';
import { Canon } from '../canon/canon';
import { Fighting } from './fighting';
import { Spellcasting } from './spellcasting';
import type { Attribute, ConditionInstance } from '../creature';
import type { CombatEvent, Fighter } from '../model';

interface Drained extends Partial<Record<Attribute, number>> {
  level: number; maxHp: number; hp: number; raceId: string; classId?: string; constitution: number;
  maxSlots?: number[]; slots?: number[]; ready?: string[][];
}

// Energy drain, as the old games have it of the wight, the wraith and the vampire: each level taken is a level its
// holder no longer stands at — its attacks and saves, the spells it can reach and the slots it has, and the hit points
// that level gave, for as long as it holds the condition that counts them (drained: until it is lifted). It is kept
// on the creature beyond the fight and in a saved game as any lasting condition is, and only a restoration (a temple's,
// or a cleric's spell) lifts it; a raising does not. One at its first level has no level to give, and the drain takes
// the hit points a level would have given instead, so that it is consequential and can be recovered from (the owner's
// ruling of 7 November): it kills only as any wound does. The levels are held
// down, not unlearned: what it knows, and its experience, are as they were, and come back whole when it is lifted.
export class LevelDrain {
  static get id(): string { return Canon.rules.combat.ids.drained; }
  static drains(id: string): boolean { return !!Canon.conditions[Canon.resolve('conditions', id)]?.drains; }
  // The levels taken, of what it holds.
  static levels(conditions: readonly ConditionInstance[]): number {
    return conditions.filter(c => this.drains(c.id)).reduce((n, c) => n + c.remaining, 0);
  }
  // The level it stands at.
  static level(creature: { base: { level: number }; state: { conditions: readonly ConditionInstance[] } }): number {
    return Math.max(1, creature.base.level - this.levels(creature.state.conditions));
  }
  // The hit points a level gives it, on the average: its calling's die (half and one) with its Constitution, or its
  // kind's growth a level; never less than one.
  static perLevel(f: Pick<Drained, 'raceId' | 'classId' | 'constitution'>): number {
    const die = f.classId ? Canon.classes[f.classId]?.hitDie : undefined;
    const st = Canon.isBody(f.raceId) ? Canon.creature(f.raceId).statistics : undefined;
    // A fixed stat block loses a Hit Die's worth, on the average (a d12's six).
    const sides = st?.hitDice ? Amounts.dice(st.hitDice)[0]?.sides : undefined;
    const grown = sides ? Math.floor((sides + 1) / 2) : st?.growth?.hitPoints?.perLevel;
    return Math.max(1, die ? Math.floor(die / 2) + 1 + Fighting.statMod(f.constitution) : grown ?? 1);
  }
  // A body as it stands with `n` levels more taken: lower in level and in hit points, its slots those of the level it
  // stands at (a slot it no longer has is spent). Whether it was drained below its first level.
  static lower(f: Drained, n: number): boolean {
    const taken = Math.min(n, f.level - 1);
    f.level -= taken;
    f.maxHp = Math.max(1, f.maxHp - taken * this.perLevel(f));
    f.hp = Math.min(f.hp, f.maxHp);
    if (f.maxSlots && f.slots) {
      const table = Spellcasting.table(f.classId, f.level, f);
      f.slots = f.slots.map((s, i) => Math.min(s, table[i] ?? 0));
      if (f.ready) { f.ready = f.ready.map((r, i) => r.slice(0, f.slots![i])); }
    }
    return taken < n;
  }
  // Lifted (what a remove takes from it, a restoration among them): the levels it had lost are its own again, and the
  // hit points with them (its wounds are as they were).
  static without(f: Fighter, removed: readonly ConditionInstance[]) {
    f.statuses = f.statuses.filter(s => !removed.includes(s));
    const n = this.levels(removed);
    if (n > 0) { f.level += n; f.maxHp += n * this.perLevel(f); }
  }
  // Levels taken in a fight: counted on its condition, the body lowered now; a level it could not give, past its first,
  // taken from its life instead, and it falls if that leaves none. What happened, as events.
  static take(f: Fighter, n: number, at: { turn: number; actor?: { id: string }; source?: { id: string } }):
    CombatEvent[] {
    if (n <= 0 || f.hp === 0) { return []; }
    const by = at.actor?.id ?? at.source?.id ?? f.id;
    const before = f.level, past = this.lower(f, n), taken = before - f.level;
    const events: CombatEvent[] = [];
    if (taken) {
      const held = f.statuses.find(s => s.id === this.id);
      if (held) { held.remaining += taken; } else {
        f.statuses.push({ id: this.id, remaining: taken, clock: 'until-removed', by });
      }
      events.push({ type: 'status', turn: at.turn, actor: by, target: f.id, detail: this.id, amount: taken,
        clock: 'until-removed' });
    }
    if (past) {
      const lost = Math.min(f.hp, (n - taken) * this.perLevel(f));
      f.hp -= lost;
      events.push({ type: 'damage', turn: at.turn, actor: by, target: f.id, rolled: lost, amount: lost, hp: f.hp });
      if (f.hp === 0) { events.push({ type: 'death', turn: at.turn, actor: f.id }); }
    }
    return events;
  }
}
