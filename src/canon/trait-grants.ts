import { Canon } from './canon';
import type { Trait } from './schema';
import type { Creature } from '../creature';
import { SpellSelection } from '../rules/spell-selection';
import { Creation } from '../rules/creation';

interface Chooser { pick<T>(options: T[]): T }
// What a creature's chosen traits are and give it. Requirements are checked at creation, so a character can never hold
// a trait its ancestry, class or level does not allow. A class with specializations (Orsino's traitChoices) takes
// exactly one; when none is given, one is drawn, as Orsino's autogen does. A feat is bounded by its own requirements.
export class TraitGrants {
  static maxSpellLevel(level: number): number { return Math.ceil(level / 2); }
  private static check(creature: Creature, id: string): Trait {
    const trait = Canon.traits[id];
    if (!trait) { throw new Error(`${creature.id}: unknown trait ${id}`); }
    const r = trait.requires ?? {};
    if (r.ancestry && r.ancestry !== creature.raceId) { throw new Error(`${creature.id}: ${id} requires ${Creation.a(r.ancestry)}`); }
    if (r.class && r.class !== creature.classId) { throw new Error(`${creature.id}: ${id} requires the ${r.class} class`); }
    if (r.classes && !r.classes.includes(creature.classId ?? '')) {
      throw new Error(`${creature.id}: ${id} requires a ${r.classes.join(' or ')}`);
    }
    if (r.level && creature.base.level < r.level) { throw new Error(`${creature.id}: ${id} requires level ${r.level}`); }
    if (trait.category === 'party') { throw new Error(`${creature.id}: ${id} is a party trait, held by a company`); }
    if (Canon.ancestries[creature.raceId]?.forbiddenTraits?.includes(id)) {
      throw new Error(`${creature.id}: ${Creation.a(creature.raceId)} may not take ${id}`);
    }
    return trait;
  }
  // The party traits a company forms, held by each member; anything else named here is refused.
  static formations(ids: string[] = []): string[] {
    for (const id of ids) {
      if (Canon.traits[id]?.category !== 'party') { throw new Error(`${id} is not a party formation`); }
    }
    return ids;
  }
  static choose(creature: Creature, chosen: string[] = [], chooser: Chooser): string[] {
    const ids = chosen.map(t => Canon.resolve('traits', t));
    const choices = Creation.classOf(creature.classId)?.specializations ?? [];
    for (const id of ids) {
      const trait = this.check(creature, id);
      if (trait.category === 'specialization' || choices.includes(id)) {
        if (!choices.includes(id)) { throw new Error(`${creature.id}: ${Creation.a(creature.classId ?? 'creature')} cannot specialize as ${id}`); }
      } else if (trait.category === 'feat') {
        // A feat's own requirements (checked above) bound it; Orsino offers feats as level-up choices.
      } else { throw new Error(`${creature.id}: ${id} is a ${trait.category} trait, which is not chosen`); }
    }
    const ruled = ids.find(id => Canon.traits[id]?.excludes?.some(x => ids.includes(x)));
    if (ruled) { throw new Error(`${creature.id}: ${ruled} rules out ${Canon.traits[ruled]!.excludes!.find(x => ids.includes(x))}`); }
    const specializations = ids.filter(id => choices.includes(id));
    if (specializations.length > 1) { throw new Error(`${creature.id}: choose one specialization`); }
    if (choices.length && !specializations.length) {
      const allowed = choices.filter(id => !Canon.ancestries[creature.raceId]?.forbiddenTraits?.includes(id));
      ids.push(chooser.pick(allowed));
    }
    return ids;
  }
  // Abilities granted by the creature's traits, and the spells its specialization opens (chosen or drawn).
  static abilities(creature: Creature, how: { spells?: string[]; prepared?: boolean }, chooser: Chooser): string[] {
    const traits = (creature.traits ?? []).map(id => Canon.traits[id]!);
    const specialist = traits.find(t => t.spellAccess);
    if (how.spells && !specialist) { throw new Error(`${creature.id}: only a specialist chooses spells`); }
    const pick = chooser.pick.bind(chooser) as (options: string[]) => string;
    const spells = !specialist ? [] : how.prepared && !how.spells
      ? SpellSelection.prepare(specialist, creature.base.level, pick)
      : SpellSelection.choose(specialist, how.spells, pick, creature.id);
    // A specialist made above first level has learnt a spell at each level since, as one trained to it would have
    // (unless its author chose its spells).
    if (specialist && !how.prepared && !how.spells && creature.base.level > 1) {
      const who = { level: creature.base.level, classId: creature.classId };
      spells.push(...SpellSelection.grown(specialist, who, spells, pick));
    }
    return [...traits.flatMap(t => t.grants?.abilities ?? []), ...spells];
  }
}
