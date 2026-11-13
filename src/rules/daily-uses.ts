import { Canon } from '../canon/canon';

// What a creature has used today of what it can do only so often a day: its kind's own spells cast (cast), and each
// ability used that names its uses a day (used, by the ability). Kept on the creature beyond a fight; a night's rest
// gives them back (Grant … uses).
// restoredOn: the day a use that comes back once a day last came back (see Ability.recharges).
export interface Daily { cast?: number; used?: Record<string, number>; restoredOn?: number }
// What a recovery is: any rest, or a night's (an inn's bed, a camp), on a day of the calendar (FictionalTime.day).
export interface Recovery { kind: 'rest' | 'night'; day: number }
interface User { level?: number; innate?: string[]; daily?: Daily }
interface Use { id?: string; spell?: { level: number }; uses?: number }

// Uses a day. A creature with no calling casts its kind's spells (a ghoul's paralysing touch, a vampire's charm) from
// Orsino's spells a day for one (Combat.maxSpellSlotsForLevel: 2 + its level, every spell of it one), until it rests;
// and an ability that says how often a day it can be used (a dragon's breath, three times) is used no more often.
export class DailyUses {
  static castings(level: number): number {
    const { base, perLevel } = Canon.rules.combat.castings;
    return base + perLevel * level;
  }
  static innate(user: User, ability: Use): boolean { return !!ability.spell && !!user.innate?.includes(ability.id ?? ''); }
  // What is left of it today: undefined for what is not limited so.
  static left(user: User, ability: Use): number | undefined {
    const own = ability.uses !== undefined ? ability.uses - (user.daily?.used?.[ability.id ?? ''] ?? 0) : undefined;
    const cast = this.innate(user, ability) ? this.castings(user.level ?? 1) - (user.daily?.cast ?? 0) : undefined;
    return own === undefined ? cast : cast === undefined ? own : Math.min(own, cast);
  }
  static ready(user: User, ability: Use): boolean { return (this.left(user, ability) ?? 1) > 0; }
  static spend(user: User, ability: Use) {
    if (ability.uses !== undefined) {
      const used = (user.daily ??= {}).used ??= {};
      used[ability.id!] = (used[ability.id!] ?? 0) + 1;
    }
    if (this.innate(user, ability)) { const daily = user.daily ??= {}; daily.cast = (daily.cast ?? 0) + 1; }
  }
  // Gives back up to `count` uses, its spells first and then each ability in turn, as each says what gives it back
  // (Ability.recharges: any rest, a night, the first night of a day); how many came back. A recovery not said is a
  // rest, as every recovery was.
  static restore(user: { daily?: Daily }, count: number, recovery?: Recovery): number {
    const daily = user.daily;
    if (!daily) { return 0; }
    let back = Math.min(count, daily.cast ?? 0);
    if (daily.cast) { daily.cast -= back; }
    const used = daily.used ?? {}, day = DailyUses.dayBack(daily, recovery);
    let restoredDaily = false;
    for (const id of Object.keys(used).sort()) {
      if (!DailyUses.recharged(Canon.abilities[id]?.recharges, recovery, day)) { continue; }
      const n = Math.min(count - back, used[id]!);
      if (n > 0 && Canon.abilities[id]?.recharges === 'day') { restoredDaily = true; }
      back += n; used[id] = used[id]! - n;
      if (used[id] <= 0) { delete used[id]; }
    }
    // A use that comes back once a day, come back, marks the day (none of the catalog's does yet, so nothing else is
    // kept on anyone).
    if (day && recovery && restoredDaily) { daily.restoredOn = recovery.day; }
    if (!daily.cast) { delete daily.cast; }
    if (daily.used && !Object.keys(daily.used).length) { delete daily.used; }
    if (!Object.keys(daily).length) { delete user.daily; }
    return back;
  }
  // Whether a recovery gives back what recharges so: a rest gives back what any rest does; a night, that and what a
  // night does; the first night of a day, that and what a day does.
  private static recharged(recharges: string | undefined, recovery: Recovery | undefined, day: boolean): boolean {
    if (!recharges || recharges === 'rest') { return true; }
    return recovery?.kind === 'night' && (recharges === 'night' || day);
  }
  // Whether this recovery is the first night of its day, for what comes back once a day.
  private static dayBack(daily: Daily, recovery: Recovery | undefined): boolean {
    return recovery?.kind === 'night' && daily.restoredOn !== recovery.day;
  }
  static validate(daily: unknown): boolean {
    if (daily === undefined) { return true; }
    const d = daily as Daily;
    return typeof d === 'object' && d !== null && [d.cast ?? 0, d.restoredOn ?? 0, ...Object.values(d.used ?? {})]
      .every(n => Number.isSafeInteger(n) && n >= 0);
  }
}
