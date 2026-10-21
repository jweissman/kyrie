import { Canon } from '../canon/canon';
import type { Trait } from '../canon/schema';
import { Creation } from './creation';
import { Spellcasting } from './spellcasting';

export interface SpellPlan {
  cantrips: string[]; levels: { level: number; count: number; restricted: string[]; open: string[] }[];
}

// Orsino's pickInitialSpells (CharacterRecord): a specialist knows every cantrip of its school or domain, then picks
// three first-level, two second-level and one third-level spell of its tradition; the first pick at each level must
// lie within the school or domain. Only spells Kyr executes are offered. Where a school or domain has no executable
// spell at a level, the restricted pick opens to the whole tradition (a Kyr fallback, reported in the coverage notes).
export class SpellSelection {
  static plan(spec: Trait): SpellPlan {
    const access = spec.spellAccess!;
    // Orsino's generalist has the school "all": every spell of the tradition is within it.
    const restriction = access.school === 'all' ? undefined : access.school ?? access.domain;
    return { cantrips: Creation.spellbook(access.tradition, 0, restriction),
      levels: Object.entries(Creation.picks).map(([level, count]) => {
        const l = Number(level), open = Creation.spellbook(access.tradition, l);
        const restricted = Creation.spellbook(access.tradition, l, restriction);
        return { level: l, count: Math.min(count, open.length), open,
          restricted: restricted.length ? restricted : open };
      }) };
  }
  // The picks a character makes: given explicitly (validated), or drawn by `pick` from the legal options in order.
  static choose(spec: Trait, chosen: string[] | undefined, pick: (options: string[]) => string, who: string): string[] {
    const plan = this.plan(spec);
    if (chosen) { this.validate(plan, chosen, who); return [...plan.cantrips, ...chosen]; }
    const out: string[] = [];
    for (const l of plan.levels) {
      for (let i = 0; i < l.count; i++) {
        const options = (i === 0 ? l.restricted : l.open).filter(id => !out.includes(id));
        if (!options.length) { break; }
        out.push(pick(options));
      }
    }
    return [...plan.cantrips, ...out];
  }
  // The spells a specialist learns at each level from second to its own (Orsino's levelUp): one a level, of its
  // tradition, of a spell level it has a slot for then.
  static grown(spec: Trait, who: { level: number; classId?: string }, known: string[],
    pick: (options: string[]) => string): string[] {
    const out: string[] = [];
    for (let level = 2; level <= who.level; level++) {
      const reach = Math.min(Math.ceil(level / 2), Spellcasting.table(who.classId, level, {}).length);
      const tradition = spec.spellAccess!.tradition;
      const options = Array.from({ length: reach }, (_, i) => Creation.spellbook(tradition, i + 1)).flat()
        .filter(id => !known.includes(id) && !out.includes(id));
      if (options.length) { out.push(pick(options)); }
    }
    return out;
  }
  // Orsino's enemy casters (Combat.setUp): every cantrip of the tradition, then min(6, 2 + ⌈level / 2⌉) spells drawn
  // from those of the school or domain up to the highest castable level.
  static prepare(spec: Trait, level: number, pick: (options: string[]) => string): string[] {
    const access = spec.spellAccess!;
    const restriction = access.school === 'all' ? undefined : access.school ?? access.domain;
    const top = Math.ceil(level / 2);
    const pool = Array.from({ length: top }, (_, i) => Creation.spellbook(access.tradition, i + 1, restriction)).flat();
    const out = Creation.spellbook(access.tradition, 0);
    for (let n = Math.min(6, 2 + top); n > 0; n--) {
      const options = pool.filter(id => !out.includes(id));
      if (!options.length) { break; }
      out.push(pick(options));
    }
    return out;
  }
  static validate(plan: SpellPlan, chosen: string[], who: string) {
    if (new Set(chosen).size !== chosen.length) { throw new Error(`${who}: a spell is chosen twice`); }
    for (const id of chosen) {
      if (!plan.levels.some(l => l.open.includes(id))) {
        const a = Canon.abilities[id];
        throw new Error(`${who}: ${id} is not a spell this specialist can choose`
          + `${a?.unsupported ? ' (Kyr cannot execute it)' : ''}`);
      }
    }
    for (const l of plan.levels) {
      const at = chosen.filter(id => l.open.includes(id));
      if (at.length !== l.count) { throw new Error(`${who}: choose ${l.count} level-${l.level} spells, not ${at.length}`); }
      if (l.count && !at.some(id => l.restricted.includes(id))) {
        throw new Error(`${who}: one level-${l.level} spell must come from ${l.restricted.join(', ')}`);
      }
    }
  }
}
