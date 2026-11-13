import type { ArenaAbility } from '../lang/parse';
import type { Creature } from '../creature';

// A healing cantrip mends each member once between rests, out of a fight (R10-12, R11-05, the lead's ruling of 13
// November: a first-level cleric with Kindle had healed thirty times in the hour between two fights, two or three
// times the company's whole; doc/architecture/mission-21/rules/recovery.md). Who has been mended so is tended until the
// company rests (a rest's recovery, a night in the open, a healer: they lift it). In a fight cantrips are at will.
export class Tended {
  static readonly id = 'tended';
  // A spell of no slot (a cantrip) that heals.
  static cantripHeal(a: Pick<ArenaAbility, 'spell' | 'effects'>): boolean {
    return !!a.spell && (a.spell.level ?? 0) === 0 && a.effects.some(e => e.kind === 'heal');
  }
  // Whether it would mend them in the field now: not a healing cantrip on one already tended.
  static blocks(a: Pick<ArenaAbility, 'spell' | 'effects'>, c: Creature): boolean {
    return Tended.cantripHeal(a) && c.state.conditions.some(s => s.id === Tended.id);
  }
  // Mended by one, they are tended until the company rests.
  static mark(c: Creature) {
    if (!c.state.conditions.some(s => s.id === Tended.id)) {
      c.state.conditions.push({ id: Tended.id, remaining: 1, clock: 'until-removed' });
    }
  }
}
