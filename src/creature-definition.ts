import type { DeemValue } from 'deem';
import { Canon } from './canon/canon';
import { CreatureSchema, type Creature, type Attribute } from './creature';
import { Creation } from './rules/creation';
import { Overlays } from './overlays';

// Deem's additive overlays are flat. The store groups immutable base statistics and mutable state separately.
// This boundary only reshapes a finished definition; it never selects or composes a dimension.
export class CreatureDefinition {
  static accept(id: string, definition: Record<string, DeemValue>): Creature {
    const d = definition;
    for (const key of ['name', 'raceId']) {
      if (typeof d[key] !== 'string' || !d[key]) { throw new Error(`Invalid generated ${key}`); }
    }
    const abilities = this.strings(d, 'abilities'), traits = this.strings(d, 'traits');
    if (abilities.some(a => !Creation.executable(a)) || traits.some(t => !Canon.traits[t])) {
      throw new Error('Generated creature contains unsupported abilities or unknown traits');
    }
    const scores = Object.fromEntries(CreatureSchema.attributes
      .map(a => [a, this.number(d, a)])) as Record<Attribute, number>;
    const creature: Creature = { id, name: String(d.name), raceId: String(d.raceId),
      ...d.classId ? { classId: String(d.classId) } : {}, traits,
      base: { ...scores,
        level: this.number(d, 'level'), maxHp: this.number(d, 'maxHp'), maxMana: this.number(d, 'maxMana'), speed: this.number(d, 'speed'), abilities },
      state: { hp: this.number(d, 'maxHp'), mana: this.number(d, 'maxMana'), gold: 0, experience: 0, learnedAbilities: [], conditions: [] },
      generation: { trace: this.strings(d, 'trace') } };
    if (Canon.isSpecies(creature.raceId)) {
      if (creature.classId !== undefined) {
        throw new Error(`${id}: ${Creation.a(creature.raceId)} is a species and takes no class`);
      }
      const natural = Canon.creature(creature.raceId).statistics!;
      if (d.weapon !== natural.weapon || d.armor !== (natural.armor ?? '')) {
        throw new Error('Generated natural equipment must match its canonical family');
      }
    } else {
      if (!Canon.ancestries[creature.raceId]?.classes.includes(creature.classId!)) { throw new Error('Invalid ancestry/class combination'); }
      for (const item of [d.weapon, d.armor]) {
        if (typeof item !== 'string' || !Creation.canEquip(creature.classId, item)) { throw new Error('Invalid generated equipment'); }
      }
      Overlays.carry(creature, [String(d.weapon), String(d.armor)]);
    }
    CreatureSchema.validate(creature);
    return creature;
  }
  private static number(d: Record<string, DeemValue>, key: string): number {
    const v = d[key];
    if (typeof v !== 'number' || !Number.isSafeInteger(v)) { throw new Error(`Invalid generated ${key}`); }
    return v;
  }
  private static strings(d: Record<string, DeemValue>, key: string): string[] {
    const v = d[key];
    if (!Array.isArray(v) || v.some(x => typeof x !== 'string')) { throw new Error(`Invalid generated ${key}`); }
    return v as string[];
  }
}
