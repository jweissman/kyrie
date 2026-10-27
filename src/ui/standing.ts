import type { MemberRow } from './screen-types';

// What is said of one of the company who is down: no cure reaches the senseless, who come round at the next rest or
// die where they fell (FieldUse.shock), and the dead come back only by a raising. A healer could not heal one who was
// down outside a fight, and the page did not say why (the play-structure investigation's PT-19).
export class Standing {
  static readonly senseless = 'Senseless: no cure reaches them. At the next rest they come round, or die where they fell.';
  static readonly dead = 'Dead: only a raising at a town\'s shrine brings them back.';
  static of(m: { hp: number; conditions: readonly string[] }): Pick<MemberRow, 'fallen'> {
    return m.hp > 0 ? {} : { fallen: m.conditions.includes('slain') ? this.dead : this.senseless };
  }
}
