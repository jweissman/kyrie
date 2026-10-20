import { Creation } from './creation';
import { Fighting } from './fighting';
import type { Attribute } from '../creature';

interface Caster { slots?: number[]; mana: number }
interface Spell { cost?: number; spell?: { level: number } }

// Old-school spellcasting: a caster has slots for each spell level, from its class table and level. Casting a spell
// spends one slot of its level or higher (the lowest that is free); a cantrip spends none. Slots return with rest.
// Techniques that cost something still spend from the general pool.
export class Spellcasting {
  static table(classId: string | undefined, level: number, scores: Partial<Record<Attribute, number>>): number[] {
    const casting = Creation.classOf(classId)?.spellcasting;
    if (!casting) { return []; }
    const row = casting.slots[Math.min(Math.max(level, 1), casting.slots.length) - 1] ?? [];
    const bonus = Fighting.statMod(scores[casting.attribute] ?? 10) >= 2 ? 1 : 0;
    return row.map((n, i) => (i === 0 ? n + bonus : n));
  }
  // Gives a creature the slots its class and level allow, all unspent. A creature that already has them keeps them.
  static equip<T extends { classId?: string; state: { slots?: number[] };
    base: { level: number; maxSlots?: number[] } & Partial<Record<Attribute, number>> }>(creature: T): T {
    if (creature.base.maxSlots) { return creature; }
    const slots = this.table(creature.classId, creature.base.level, creature.base);
    if (slots.length) { creature.base.maxSlots = slots; creature.state.slots = [...slots]; }
    return creature;
  }
  static needsSlot(ability: Spell): boolean { return (ability.spell?.level ?? 0) > 0; }
  // The index of the slot a spell would spend, if any is free.
  static slotFor(slots: number[], ability: Spell): number | undefined {
    for (let i = (ability.spell?.level ?? 1) - 1; i < slots.length; i++) { if ((slots[i] ?? 0) > 0) { return i; } }
    return undefined;
  }
  static affordable(caster: Caster, ability: Spell): boolean {
    if (ability.spell) { return !this.needsSlot(ability) || this.slotFor(caster.slots ?? [], ability) !== undefined; }
    return (ability.cost ?? 0) <= caster.mana;
  }
  static spend(caster: Caster, ability: Spell) {
    if (!ability.spell) { caster.mana -= ability.cost ?? 0; return; }
    if (!this.needsSlot(ability)) { return; }
    const i = this.slotFor(caster.slots ?? [], ability);
    if (i === undefined) { throw new Error('No spell slot of that level is free'); }
    caster.slots![i]!--;
  }
  // Returns up to `count` spent slots, lowest level first; how many came back.
  static restore(caster: { maxSlots?: number[]; slots?: number[] }, count: number): number {
    let restored = 0;
    (caster.maxSlots ?? []).forEach((most, i) => {
      const back = Math.min(most - (caster.slots![i] ?? 0), count - restored);
      if (back > 0) { caster.slots![i]! += back; restored += back; }
    });
    return restored;
  }
  static ordinal(level: number): string { return ['first', 'second', 'third', 'fourth', 'fifth'][level - 1] ?? `level ${level}`; }
}
