import { Canon } from '../canon/canon';

// What a creature has used today of what it can do only so often a day: its kind's own spells cast (cast), and each
// ability used that names its uses a day (used, by the ability). Kept on the creature beyond a fight; a night's rest
// gives them back (Grant … uses).
export interface Daily { cast?: number; used?: Record<string, number> }
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
  // Gives back up to `count` uses, its spells first and then each ability in turn; how many came back.
  static restore(user: { daily?: Daily }, count: number): number {
    const daily = user.daily;
    if (!daily) { return 0; }
    let back = Math.min(count, daily.cast ?? 0);
    if (daily.cast) { daily.cast -= back; }
    const used = daily.used ?? {};
    for (const id of Object.keys(used).sort()) {
      const n = Math.min(count - back, used[id]!);
      back += n; used[id] = used[id]! - n;
      if (used[id] <= 0) { delete used[id]; }
    }
    if (!daily.cast) { delete daily.cast; }
    if (daily.used && !Object.keys(daily.used).length) { delete daily.used; }
    if (!Object.keys(daily).length) { delete user.daily; }
    return back;
  }
  static validate(daily: unknown): boolean {
    if (daily === undefined) { return true; }
    const d = daily as Daily;
    return typeof d === 'object' && d !== null && [d.cast ?? 0, ...Object.values(d.used ?? {})]
      .every(n => Number.isSafeInteger(n) && n >= 0);
  }
}
