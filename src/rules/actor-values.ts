import { CanonRuntime } from '../canon/canon-runtime';
import { CastingLevel } from './casting-level';
import type { Fighter } from '../model';

// The values an actor's expressions read (Effects.context): Orsino's #str, #wis are the record's scores; #level is
// the level it stands at, #hitDice its source Hit Dice, #castingLevel the level it casts at (see CastingLevel), and
// #bonusSpellDC what its gear and conditions add to its spells' difficulty.
export class ActorValues {
  static of(actor: Fighter, bonusSpellDC: number): Record<string, number> {
    const hitDice = CanonRuntime.hitDice(actor);
    return { strength: actor.strength, dexterity: actor.dexterity, intelligence: actor.intelligence,
      wisdom: actor.wisdom, constitution: actor.constitution, charisma: actor.charisma, hp: actor.hp,
      maxHp: actor.maxHp, mana: actor.mana, level: actor.level, hitDice, castingLevel: CastingLevel.of(actor, hitDice),
      bonusSpellDC };
  }
}
