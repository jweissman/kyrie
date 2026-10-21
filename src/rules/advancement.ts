import { Canon } from '../canon/canon';
import { Expressions } from '../expressions';
import { Fighting } from './fighting';
import { Spellcasting } from './spellcasting';
import { RandomStreams } from '../random-streams';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';

interface Table {
  thresholds: number[]; species: Record<string, number>; ancestry: Record<string, number>; person: number;
}

// Old-school advancement: experience from defeated creatures and resolved situations; a level is gained at the
// next sheltered rest once its threshold is reached. Each level rolls the class hit die (plus Constitution, at
// least 1), and a caster's slot table moves on; saves and attacks already scale with level.
export class Advancement {
  static get table(): Table { return (Canon.rules as unknown as { advancement: Table }).advancement; }
  // Experience needed to reach a level; level 1 needs none.
  static threshold(level: number): number {
    const t = this.table.thresholds;
    return level <= 1 ? 0 : t[level - 2] ?? Infinity;
  }
  // What defeating a creature is worth: its kind's value for each of its levels.
  static worth(creature: Creature): number {
    const each = Canon.isSpecies(creature.raceId)
      ? this.table.species[Canon.creature(creature.raceId).type ?? ''] ?? this.table.species.monster!
      : this.table.ancestry[creature.raceId] ?? this.table.person;
    return each * creature.base.level;
  }
  // Raises a creature as many levels as its experience allows; the events say what changed.
  static train(creature: Creature, seed: string): CombatEvent[] {
    const events: CombatEvent[] = [];
    while (creature.state.experience >= this.threshold(creature.base.level + 1)) {
      const level = ++creature.base.level;
      const die = Canon.classes[creature.classId ?? '']?.hitDie ?? 6;
      const roll = new Expressions(RandomStreams.key(seed, 'advance', creature.id, level)).number(`1d${die}`);
      const gained = Math.max(1, roll + Fighting.statMod(creature.base.constitution));
      creature.base.maxHp += gained; creature.state.hp += gained;
      const slots = Spellcasting.table(creature.classId, level, creature.base);
      if (slots.length) {
        // A level is taken at rest, with every slot ready; new slots are prepared with what the caster knows.
        creature.state.slots = [...slots];
        creature.base.maxSlots = slots;
        Spellcasting.equip(creature);
        creature.state.ready = creature.state.prepared!.map(p => [...p]);
        creature.state.slots = creature.state.ready.map(r => r.length);
      }
      events.push({ type: 'gain', turn: 0, actor: creature.id, target: creature.id, detail: `level ${level}`, amount: gained });
    }
    return events;
  }
}
