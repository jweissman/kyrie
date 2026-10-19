import { Canon } from './canon';
import type { Creature } from '../creature';

// What a creature's chosen traits give it. Requirements are checked here, at creation, so a character can never
// hold a trait its ancestry, class or level does not allow. A specialization opens its school or domain: every
// executable spell of that tradition within it, up to the highest spell level the character can cast (Orsino's
// ⌈level / 2⌉).
export class TraitGrants {
  static maxSpellLevel(level: number): number { return Math.ceil(level / 2); }
  static abilities(creature: Creature): string[] {
    return (creature.traits ?? []).flatMap(id => {
      const trait = Canon.traits[id];
      if (!trait) { throw new Error(`${creature.id}: unknown trait ${id}`); }
      const r = trait.requires ?? {};
      if (r.ancestry && r.ancestry !== creature.raceId) { throw new Error(`${creature.id}: ${id} requires a ${r.ancestry}`); }
      if (r.class && r.class !== creature.classId) { throw new Error(`${creature.id}: ${id} requires the ${r.class} class`); }
      if (r.level && creature.base.level < r.level) { throw new Error(`${creature.id}: ${id} requires level ${r.level}`); }
      if (r.ancestries) { throw new Error(`${creature.id}: ${id} is a party trait, held by a company`); }
      return [...trait.grants?.abilities ?? [], ...this.spells(trait.spellAccess, creature.base.level)];
    });
  }
  static spells(access: { tradition: string; school?: string; domain?: string } | undefined, level: number): string[] {
    if (!access) { return []; }
    return Object.entries(Canon.abilities).filter(([, a]) => a.kind === 'spell' && a.spell
      && a.spell.tradition === access.tradition && a.spell.level <= this.maxSpellLevel(level)
      && (access.school ? a.spell.school === access.school : a.spell.domain === access.domain)).map(([id]) => id);
  }
}
