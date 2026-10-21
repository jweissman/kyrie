import { Creation } from './creation';
import { Fighting } from './fighting';
import { Content } from '../content';
import type { Attribute } from '../creature';

// What a caster carries for spells: slots by spell level, the spell prepared in each, and which are still ready.
interface Caster { slots?: number[]; mana: number; prepared?: string[][]; ready?: string[][] }
interface Spell { id?: string; cost?: number; spell?: { level: number } }

// Old-school spellcasting. A caster has slots for each spell level, from its class table and level, and prepares a
// known spell in each one (a spell of that level or lower). Casting spends a ready slot holding that spell; a cantrip
// spends none. Rest makes every slot ready again. Preparing a different spell takes an hour: in a slot still ready,
// it can be cast at once; in a spent slot, after the next rest.
export class Spellcasting {
  static table(classId: string | undefined, level: number, scores: Partial<Record<Attribute, number>>): number[] {
    const casting = Creation.classOf(classId)?.spellcasting;
    if (!casting) { return []; }
    const row = casting.slots[Math.min(Math.max(level, 1), casting.slots.length) - 1] ?? [];
    const bonus = Fighting.statMod(scores[casting.attribute] ?? 10) >= 2 ? 1 : 0;
    return row.map((n, i) => (i === 0 ? n + bonus : n));
  }
  static levelOf(id: string): number { return Content.abilities.find(a => a.id === id)?.spell?.level ?? 0; }
  // The levelled spells a creature knows, in the order it learned them.
  static known(creature: { base: { abilities: string[] }; state: { learnedAbilities?: string[] } }): string[] {
    return [...new Set([...creature.base.abilities, ...creature.state.learnedAbilities ?? []])]
      .filter(id => this.levelOf(id) > 0);
  }
  // A first preparation: each slot takes a known spell of its own level if there is one, else of a lower level,
  // in turn, so that a caster starts the day with a spread of what it knows.
  static fill(slots: number[], known: string[], prior: string[][] = []): string[][] {
    return slots.map((count, i) => {
      const own = known.filter(id => this.levelOf(id) === i + 1), lower = known.filter(id => this.levelOf(id) <= i + 1);
      const pool = own.length ? own : lower, kept = (prior[i] ?? []).filter(id => lower.includes(id)).slice(0, count);
      return [...kept, ...Array.from({ length: count - kept.length }, (_, k) => pool[(kept.length + k) % pool.length]!)]
        .filter(Boolean);
    });
  }
  // Gives a creature the slots its class and level allow, prepared and ready; one that has them keeps them, and one
  // whose slots grew (a level gained) prepares the new ones.
  static equip<T extends { classId?: string; state: Caster & { learnedAbilities?: string[] };
    base: { level: number; maxSlots?: number[]; abilities: string[] } & Partial<Record<Attribute, number>> }>(
    creature: T): T {
    if (!creature.base.maxSlots) {
      const slots = this.table(creature.classId, creature.base.level, creature.base);
      if (!slots.length) { return creature; }
      creature.base.maxSlots = slots; creature.state.slots = [...slots];
    }
    const most = creature.base.maxSlots, known = this.known(creature);
    const prepared = this.fill(most, known, creature.state.prepared);
    if (!creature.state.prepared || prepared.some((p, i) => p.length !== (creature.state.prepared![i]?.length ?? 0))) {
      // Ready spells are the prepared ones not yet spent: as many of each level as the slots still unspent.
      const left = creature.state.slots ?? most;
      creature.state.ready = prepared.map((p, i) => p.slice(0, Math.min(p.length, left[i] ?? 0)));
      creature.state.prepared = prepared;
      creature.state.slots = creature.state.ready.map(r => r.length);
    }
    return creature;
  }
  static needsSlot(ability: Spell): boolean { return (ability.spell?.level ?? 0) > 0; }
  // The level index of the ready slot a spell would spend, if any: the lowest that holds it.
  static slotFor(caster: Caster, ability: Spell): number | undefined {
    const ready = caster.ready ?? [];
    for (let i = (ability.spell?.level ?? 1) - 1; i < ready.length; i++) { if (ready[i]!.includes(ability.id ?? '')) { return i; } }
    return undefined;
  }
  static affordable(caster: Caster, ability: Spell): boolean {
    if (ability.spell) { return !this.needsSlot(ability) || this.slotFor(caster, ability) !== undefined; }
    return (ability.cost ?? 0) <= caster.mana;
  }
  static spend(caster: Caster, ability: Spell) {
    if (!ability.spell) { caster.mana -= ability.cost ?? 0; return; }
    if (!this.needsSlot(ability)) { return; }
    const i = this.slotFor(caster, ability);
    if (i === undefined) { throw new Error(`No ready slot holds ${ability.id}`); }
    caster.ready![i]!.splice(caster.ready![i]!.indexOf(ability.id!), 1);
    caster.slots![i] = caster.ready![i]!.length;
  }
  // Makes up to `count` spent slots ready again, lowest level first; how many came back.
  static restore(caster: { maxSlots?: number[] } & Caster, count: number): number {
    let restored = 0;
    (caster.prepared ?? []).forEach((prepared, i) => {
      const spent = [...prepared];
      for (const id of caster.ready![i]!) { spent.splice(spent.indexOf(id), 1); }
      const back = spent.slice(0, Math.max(0, count - restored));
      restored += back.length;
      // Ready spells keep the order they were prepared in.
      const left = [...caster.ready![i]!, ...back];
      caster.ready![i] = prepared.filter(id => left.includes(id) && left.splice(left.indexOf(id), 1).length > 0);
      caster.slots![i] = caster.ready![i]!.length;
    });
    return restored;
  }
  // Prepares `incoming` in a slot of level `index + 1` that held `outgoing`; ready at once if that slot was.
  static prepare(caster: Caster, index: number, outgoing: string, incoming: string): boolean {
    const prepared = caster.prepared?.[index], ready = caster.ready?.[index];
    if (!prepared?.includes(outgoing) || this.levelOf(incoming) > index + 1 || this.levelOf(incoming) < 1) {
      throw new Error(`Cannot prepare ${incoming} in place of ${outgoing}`);
    }
    prepared[prepared.indexOf(outgoing)] = incoming;
    const now = !!ready?.includes(outgoing);
    if (now) { ready![ready!.indexOf(outgoing)] = incoming; }
    return now;
  }
  static ordinal(level: number): string {
    return ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'][level - 1] ?? `level ${level}`;
  }
}
