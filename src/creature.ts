import { ItemCatalog } from './item-catalog';
import { Canon } from './canon/canon';
export type Attribute = 'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'constitution' | 'charisma';
export type Attributes = Record<Attribute, number>;
// by: the creature that applied it (Orsino's `by`, read by forceTarget). tempHp: what remains of its temporary hit
// points.
export interface ConditionInstance {
  id: string; remaining: number; source?: string; clock?: 'owner-turn' | 'world-time' | 'until-removed';
  by?: string; tempHp?: number;
}
export interface ItemInstance { id: string; definition: string; equipped?: boolean }
// raceId is what the creature is: an ancestry (a person, who has a class) or a species (which has none).
export interface Creature {
  id: string; name: string; raceId: string; classId?: string; backgroundId?: string; professionId?: string;
  traits?: string[]; generation?: { trace: string[] };
  base: Attributes & {
    maxHp: number; maxMana: number; speed: number; level: number; abilities: string[];
    // A caster's spell slots by spell level (index 0 is first level); state.slots are those not yet spent.
    maxSlots?: number[];
  };
  state: {
    hp: number; mana: number; gold: number; experience: number; slots?: number[];
    // The spell prepared in each slot, by spell level, and those of them not yet cast (see Spellcasting).
    prepared?: string[][]; ready?: string[][];
    // What levels gained have still to be spent: developments (a point of a quality, or a skill), spells to learn,
    // feats to take. A development is counted as `qualities`, the name it had when a point was all it could be.
    advances?: { qualities: number; spells: number; feats?: number };
    // The skills taken up with developments, beyond what background, calling and gear bring (see Advancement).
    skills?: string[];
    learnedAbilities: string[]; conditions: ConditionInstance[]; inventory?: ItemInstance[];
  };
}

export class CreatureSchema {
  // What levels have still to give, and the skills taken up with them.
  static validateProgress(creature: Creature) {
    const advances = creature.state.advances;
    const counts = advances ? [advances.qualities, advances.spells, advances.feats ?? 0] : [];
    if (!counts.every(n => Number.isSafeInteger(n) && n >= 0)) {
      throw new Error(`Invalid advances: ${creature.id}`);
    }
    const skills = creature.state.skills ?? [];
    if (!Array.isArray(skills) || skills.some(id => typeof id !== 'string' || !id) || new Set(skills).size !== skills.length) {
      throw new Error(`Invalid skills: ${creature.id}`);
    }
  }
  static readonly attributes: Attribute[] = [
    'strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma',
  ];
  static validate(creature: Creature) {
    if (Object.hasOwn(creature.base, 'scores')) {
      throw new Error('Legacy score/modifier creature data requires migration');
    }
    if (![creature.id, creature.name, creature.raceId].every(v => typeof v === 'string' && v.length)) {
      throw new Error('Creature needs identity, name and kind');
    }
    if (Canon.isSpecies(creature.raceId) ? creature.classId !== undefined
      : !Canon.isAncestry(creature.raceId) || typeof creature.classId !== 'string' || !Canon.classes[creature.classId]) {
      throw new Error(`${creature.id}: a person has an ancestry and a class; a species creature has no class`);
    }
    const values = [creature.base.level, creature.base.maxHp, creature.base.maxMana, creature.base.speed,
      creature.state.hp, creature.state.mana, creature.state.gold, creature.state.experience,
      ...this.attributes.map(key => creature.base[key])];
    if (!values.every(v => Number.isSafeInteger(v) && v >= 0) || creature.base.maxHp < 1 || creature.base.level < 1
      || creature.state.hp > creature.base.maxHp || creature.state.mana > creature.base.maxMana) {
      throw new Error(`Invalid creature statistics: ${creature.id}`);
    }
    if (this.attributes.some(key => creature.base[key] < 1)) { throw new Error('Invalid ability score'); }
    const most = creature.base.maxSlots ?? [], left = creature.state.slots ?? [];
    if (most.length !== left.length || [...most, ...left].some(n => !Number.isSafeInteger(n) || n < 0)
      || left.some((n, i) => n > most[i]!)) { throw new Error(`Invalid spell slots: ${creature.id}`); }
    // Each level's ready spells are some of the spells prepared in it, one per unspent slot.
    const prepared = creature.state.prepared, ready = creature.state.ready;
    if (prepared && (!ready || prepared.length !== most.length || ready.length !== most.length
      || prepared.some((p, i) => p.length > most[i]! || ready[i]!.length !== left[i]
        || ready[i]!.some(id => ready[i]!.filter(x => x === id).length > p.filter(x => x === id).length)))) {
      throw new Error(`Invalid prepared spells: ${creature.id}`);
    }
    this.validateProgress(creature);
    const inventory = creature.state.inventory ?? [];
    if (!Array.isArray(inventory) || inventory.some(i => !i.id || !i.definition
      || (i.equipped !== undefined && typeof i.equipped !== 'boolean'))
      || new Set(inventory.map(i => i.id)).size !== inventory.length) { throw new Error('Invalid item inventory'); }
    const slots = inventory.filter(i => i.equipped).map(i => ItemCatalog.get(i.definition).slot);
    inventory.forEach(i => ItemCatalog.get(i.definition));
    if (slots.some(s => !s) || new Set(slots).size !== slots.length) { throw new Error('Invalid equipment slots'); }
    const grants = creature.base.abilities;
    const learned = creature.state.learnedAbilities;
    if (!Array.isArray(grants) || !Array.isArray(learned)
      || [...grants, ...learned].some(id => typeof id !== 'string' || !id)
      || new Set([...grants, ...learned]).size !== grants.length + learned.length) {
      throw new Error('Invalid creature abilities');
    }
    if (!Array.isArray(creature.state.conditions) || creature.state.conditions.some(c =>
      (c.clock !== undefined && !['owner-turn', 'world-time', 'until-removed'].includes(c.clock))
      || typeof c.id !== 'string' || !c.id || !Number.isSafeInteger(c.remaining) || c.remaining < 1)
      || new Set(creature.state.conditions.map(c => `${c.id}:${c.source ?? ""}`)).size !== creature.state.conditions.length) {
      throw new Error('Invalid creature conditions');
    }
  }
}
