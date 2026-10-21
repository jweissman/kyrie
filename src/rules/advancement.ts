import { Canon } from '../canon/canon';
import { Expressions } from '../expressions';
import { Fighting } from './fighting';
import { Spellcasting } from './spellcasting';
import { RandomStreams } from '../random-streams';
import { CreatureSchema, type Attribute, type Creature } from '../creature';
import { Creation } from './creation';
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
      // Orsino's level-up choices: a point of any quality, and for a specialist caster a new spell.
      const advances = creature.state.advances ??= { qualities: 0, spells: 0 };
      advances.qualities++;
      if (this.specialist(creature)) { advances.spells++; }
      events.push({ type: 'gain', turn: 0, actor: creature.id, target: creature.id, detail: `level ${level}`, amount: gained });
    }
    return events;
  }
  static specialist(creature: Creature) {
    return (creature.traits ?? []).map(id => Canon.traits[id]).find(t => t?.spellAccess);
  }
  // The spells a caster with a spell to learn may choose: those of its tradition it can cast at its level and does
  // not know. (Orsino offers its school or domain; Kyr opens the tradition, as the first picks do when a school has
  // nothing Kyr can run.)
  static learnable(creature: Creature): string[] {
    const spec = this.specialist(creature);
    if (!spec || !creature.state.advances?.spells || creature.state.hp === 0) { return []; }
    const known = new Set([...creature.base.abilities, ...creature.state.learnedAbilities]);
    return Array.from({ length: Fighting.maxSpellLevel(creature.base.level) }, (_, i) =>
      Creation.spellbook(spec.spellAccess!.tradition, i + 1)).flat().filter(id => !known.has(id));
  }
  static improve(creature: Creature, quality: Attribute) {
    const advances = creature.state.advances;
    if (!advances?.qualities || !CreatureSchema.attributes.includes(quality) || creature.state.hp === 0) {
      throw new Error(`${creature.id} has no quality to raise`);
    }
    creature.base[quality]++; advances.qualities--;
  }
  static learn(creature: Creature, spell: string) {
    if (!this.learnable(creature).includes(spell)) { throw new Error(`${creature.id} cannot learn ${spell}`); }
    creature.state.learnedAbilities.push(spell); creature.state.advances!.spells--;
  }
}
