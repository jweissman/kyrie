import { Effects, type EffectContext } from '../effects';
import { KindDefenses } from '../kind-defenses';
import type { Fighter } from '../model';

// Spell resistance (the SRD's; engine-pressure.md §4's resist stage; the manifest's resist.spell): a spell that allows
// it (its `resistance`, as the SRD's "Spell Resistance: Yes") is checked once against each creature it would fall on
// that has some, after its attack lands (a touch's, a ray's) and before any save: the caster's d20 and casting level
// against the creature's spell resistance, its kind's (a typed defense, as a reduction is). A check that fails leaves
// that one wholly untouched by the spell, every effect of it; one that succeeds lets it fall as written. A creature
// with none is never checked. It is told as the caster's own try ("Eda's spell fails against the balor").
export class SpellResistance {
  // What a creature resists spells by: the best of its kind's (and what varies it) spell resistance, or none.
  static of(fighter: Fighter): number {
    return Math.max(0, ...KindDefenses.of(fighter).map(d => (d.kind === 'spellResistance' ? d.amount : 0)));
  }
  // Whether a spell that allows spell resistance gets past this one's: rolled once a casting for each creature.
  static overcomes(target: Fighter, context: EffectContext): boolean {
    const resisting = context.resisting, actor = context.actor;
    if (!resisting || !actor || !context.expressions) { return true; }
    const known = resisting.get(target.id);
    if (known !== undefined) { return known; }
    const difficulty = SpellResistance.of(target);
    if (difficulty <= 0) { resisting.set(target.id, true); return true; }
    const die = context.expressions.number('1d20'),
      level = Effects.context(actor, context.castingLevel).castingLevel ?? actor.level;
    const success = die + level >= difficulty;
    context.events.push({ type: 'resist', turn: context.turn, actor: actor.id, target: target.id, die, level,
      rolled: die + level, difficulty, success });
    resisting.set(target.id, success);
    return success;
  }
}
