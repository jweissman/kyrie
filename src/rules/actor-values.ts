import { Canon } from '../canon/canon';
import { Callings } from '../ports/callings';
import { CanonRuntime } from '../canon/canon-runtime';
import { CastingLevel } from './casting-level';
import type { Attribute } from './catalog-schema';
import type { Fighter } from '../model';

// The values an actor's expressions read (Effects.context): Orsino's #str, #wis are the record's scores; #level is
// the level it stands at, #hitDice its source Hit Dice, #castingLevel the level it casts at (see CastingLevel),
// #castingScore the score it casts with (its calling's: a mage's Intelligence, a bard's Charisma; for a calling that
// casts nothing, or a kind of no calling, Charisma, as the SRD's spell-like abilities read it), and #bonusSpellDC what
// its gear and conditions add to its spells' difficulty.
export class ActorValues {
  static hitDice(actor: Fighter): number { return CanonRuntime.hitDice(actor); }
  static of(actor: Fighter, bonusSpellDC: number): Record<string, number> {
    const hitDice = this.hitDice(actor);
    return { strength: actor.strength, dexterity: actor.dexterity, intelligence: actor.intelligence,
      wisdom: actor.wisdom, constitution: actor.constitution, charisma: actor.charisma, hp: actor.hp,
      maxHp: actor.maxHp, mana: actor.mana, level: actor.level, hitDice, castingLevel: CastingLevel.of(actor, hitDice),
      castingScore: actor[this.castsWith(actor.classId)], bonusSpellDC };
  }
  static castsWith(classId: string | undefined): Attribute {
    return (classId ? Callings.of(Canon.resolve('classes', classId))?.spellcasting?.attribute : undefined) ?? 'charisma';
  }
}
