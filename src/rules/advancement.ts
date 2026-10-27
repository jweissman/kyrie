import { Canon } from '../canon/canon';
import { Expressions } from '../expressions';
import { Fighting } from './fighting';
import { Spellcasting } from './spellcasting';
import { RandomStreams } from '../random-streams';
import { CreatureSchema, type Attribute, type Creature } from '../creature';
import { Creation } from './creation';
import { Perks } from './perks';
import type { CombatEvent } from '../model';
import { PartyCapabilities } from '../campaign/party-capabilities';

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
    const own = Canon.isSpecies(creature.raceId) ? Canon.creature(creature.raceId).worth : undefined;
    if (own) { return own.base + own.perLevel * creature.base.level; }
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
      // Perks for levelling (a war band's battle hardening) add to what the die gives.
      const gained = Math.max(1, roll + Fighting.statMod(creature.base.constitution))
        + Perks.triggers(creature.traits, 'onLevelUp').reduce((sum, t) => sum + t.maxHp, 0);
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
      events.push(...this.features(creature, level));
      // A level's development, spent on a point of any quality or a skill the calling teaches; and for a specialist
      // caster a new spell.
      const advances = creature.state.advances ??= { qualities: 0, spells: 0 };
      advances.qualities++;
      if (this.specialist(creature)) { advances.spells++; }
      // Orsino's feat at every fifth level short of twentieth, when the class has one left to offer.
      if (level % 5 === 0 && level < 20 && this.offered(creature).length) {
        advances.feats = (advances.feats ?? 0) + 1;
      }
      events.push({ type: 'gain', turn: 0, actor: creature.id, target: creature.id, detail: `level ${level}`, amount: gained });
    }
    return events;
  }
  // What the next level brings in kind, besides the hit die and the quality point: the calling's techniques and
  // traits, and a new level of spells.
  static next(classId: string | undefined, level: number): string[] {
    if (level >= this.table.thresholds.length + 1) { return []; }
    const features = Creation.features(classId, level, level + 1);
    const [now, then] = [level, level + 1].map(l => Spellcasting.table(classId, l, {}).length);
    return [...features.abilities.map(a => Canon.abilities[a]?.name ?? a),
      ...features.traits.map(t => Canon.traits[t]?.name ?? t), ...then! > now! ? [`spells of level ${then}`] : []];
  }
  // The calling's features for a level just reached: techniques learned, calling traits taken.
  static features(creature: Creature, level: number): CombatEvent[] {
    const due = Creation.features(creature.classId, level - 1, level);
    const learned = due.abilities.filter(a => Creation.executable(a) && !creature.base.abilities.includes(a));
    creature.base.abilities = [...creature.base.abilities, ...learned];
    const taken = due.traits.filter(t => !(creature.traits ?? []).includes(t));
    creature.traits = [...creature.traits ?? [], ...taken];
    return [...learned.map(a => Canon.abilities[a]!.name), ...taken.map(t => Canon.traits[t]!.name)].map(detail =>
      ({ type: 'learn' as const, turn: 0, actor: creature.id, target: creature.id, detail }));
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
    // A spell of a level the caster has no slot for is no choice at all: Orsino's reach, within the slot table's.
    const reach = Math.min(Fighting.maxSpellLevel(creature.base.level),
      Spellcasting.table(creature.classId, creature.base.level, creature.base).length);
    return Array.from({ length: reach }, (_, i) =>
      Creation.spellbook(spec.spellAccess!.tradition, i + 1)).flat().filter(id => !known.has(id));
  }
  // The feats a companion with one to take may choose: its class's, of its level or below, not held, and not one
  // that a held feat rules out (a knight is no barbarian), as Orsino's featsForCombatant.
  static feats(creature: Creature): string[] {
    return creature.state.advances?.feats && creature.state.hp > 0 ? this.offered(creature) : [];
  }
  static offered(creature: Creature): string[] {
    const held = creature.traits ?? [];
    return Object.entries(Canon.traits).filter(([id, t]) => t.category === 'feat' && !t.unsupported
      && t.requires?.class === creature.classId && (t.requires?.level ?? 1) <= creature.base.level && !held.includes(id)
      && !(t.excludes ?? []).some(x => held.includes(x)) && !held.some(h => Canon.traits[h]?.excludes?.includes(id)))
      .map(([id]) => id);
  }
  // Takes a feat: the trait, and the abilities it grants.
  static feat(creature: Creature, id: string) {
    if (!this.feats(creature).includes(id)) { throw new Error(`${creature.id} cannot take ${id}`); }
    creature.traits = [...creature.traits ?? [], id];
    creature.base.abilities = [...new Set([...creature.base.abilities, ...(Canon.traits[id]!.grants?.abilities ?? [])
      .filter(a => Creation.executable(a))])];
    creature.state.advances!.feats!--;
  }
  // The skills a member could take up with a development: those their calling teaches (Canon.classes' `learns`)
  // that they do not already bring, by background, calling, gear or study.
  static teachable(creature: Creature): string[] {
    if (!creature.state.advances?.qualities || creature.state.hp === 0) { return []; }
    return (Canon.classes[creature.classId ?? '']?.learns ?? []).filter(id => !PartyCapabilities.brings(id, creature));
  }
  // Takes up a skill with a development: from then on the member brings it, as one trained in it.
  static school(creature: Creature, skill: string) {
    if (!this.teachable(creature).includes(skill)) { throw new Error(`${creature.id} cannot take up ${skill}`); }
    creature.state.skills = [...creature.state.skills ?? [], skill];
    creature.state.advances!.qualities--;
  }
  static improve(creature: Creature, quality: Attribute) {
    const advances = creature.state.advances;
    if (!advances?.qualities || !CreatureSchema.attributes.includes(quality) || creature.state.hp === 0) {
      throw new Error(`${creature.id} has no quality to raise`);
    }
    creature.base[quality]++; advances.qualities--;
  }
  // A Manual's gift: a quality raised by one, two or three (by_one…by_three), never past twenty-five (a first-level
  // companion may already have twenty-one); how much it rose.
  static readonly ceiling = 25;
  static degree(id: string): number {
    const n = ({ by_one: 1, by_two: 2, by_three: 3 } as Record<string, number>)[id.replace(/^.*__/, '')];
    if (!n) { throw new Error(`Unknown degree ${id}`); }
    return n;
  }
  static endow(creature: Creature, quality: Attribute, by: number): number {
    if (!CreatureSchema.attributes.includes(quality) || creature.state.hp === 0) {
      throw new Error(`${creature.id} cannot be endowed with ${quality}`);
    }
    const before = creature.base[quality];
    creature.base[quality] = Math.max(before, Math.min(this.ceiling, before + by));
    return creature.base[quality] - before;
  }
  static learn(creature: Creature, spell: string) {
    if (!this.learnable(creature).includes(spell)) { throw new Error(`${creature.id} cannot learn ${spell}`); }
    creature.state.learnedAbilities.push(spell); creature.state.advances!.spells--;
  }
}
