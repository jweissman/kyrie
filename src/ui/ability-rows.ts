import { Content } from '../content';
import { MechanicsText } from '../presentation/mechanics-text';
import type { ArenaAbility } from '../lang/parse';
import type { MemberRow } from './screen-types';

// A member's techniques and spells as the company's book shows them: what each does at their level, what it costs,
// and what it needs in hand ("Set Spear" was listed for a ranger with a bow, and said nothing of a spear: the cold
// evaluation, M17-73). A fight offers it only with such a weapon (see Battle).
export class AbilityRows {
  static of(m: { abilities?: string[]; attributes?: Record<string, number>; level: number }): MemberRow['abilities'] {
    return (m.abilities ?? []).map(id => Content.abilities.find(a => a.id === id)).filter(a => !!a)
      .map(a => ({ id: a.id, name: a.name, cost: a.cost ?? 0, price: MechanicsText.price(a),
        text: [MechanicsText.full(a, { ...m.attributes, level: m.level, bonusSpellDC: 0 }), this.needs(a)]
          .filter(Boolean).join(' ') }));
  }
  private static needs(a: ArenaAbility): string {
    return a.requires?.interceptWeapon ? 'Only with a spear, or another weapon that sets against a charge, in hand.' : '';
  }
}
