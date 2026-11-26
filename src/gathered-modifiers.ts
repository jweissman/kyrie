import type { Fighter } from './model';
import { ModifierSet, type Modifiers } from './rules/modifiers';
import { CanonRuntime } from './canon/canon-runtime';
import { KindDefenses } from './kind-defenses';
import { Content } from './content';
import { ConditionAmount } from './rules/condition-amount';
import { FighterBody } from './fighter-body';

// What a fighter's modifiers were gathered from, and what they came to.
interface Gathered {
  statuses: string; environment: Fighter['environment']; equipment: Fighter['equipment'];
  weapon: Fighter['equipment']['weapon'] | undefined; worn: Fighter['equipment']['modifiers'] | undefined;
  body: Fighter['equipment']['body'];
  traits: Fighter['traits']; raceId: string; variations: Fighter['variations']; modifiers: Modifiers;
}
// Orsino's gatherEffects: conditions held, the traits the creature has, its equipment and its kind's resistances,
// and those of what varies it (the frost's proof against cold, what the dead are hurt by).
// Gathered once for a fighter as it stands, and again whenever anything it is gathered from is not what it was: the
// conditions it holds (by name, as they are now), where it is, what it has in hand and wears, its traits, its kind and
// what varies it. The canon's conditions and traits never change. A forecast's trials had gathered them again for
// every fighter weighed as every target, a fifth of their time (OR-114). What is gathered is frozen, so that nothing
// changes what another reads.
export class GatheredModifiers {
  private static readonly kept = new WeakMap<Fighter, Gathered>();
  static of(fighter: Fighter): Modifiers {
    const body = FighterBody.of(fighter);
    const statuses = fighter.statuses.map(s => s.amount ? `${s.id}:${s.amount}` : s.id).join(' ');
    const kept = GatheredModifiers.kept.get(fighter);
    const equipment = fighter.equipment as Fighter['equipment'] | undefined;
    if (kept && kept.statuses === statuses && kept.environment === fighter.environment
      && kept.equipment === fighter.equipment && kept.weapon === equipment?.weapon && kept.worn === equipment?.modifiers
      && kept.body === body && kept.traits === fighter.traits && kept.raceId === fighter.raceId
      && kept.variations === fighter.variations) {
      return kept.modifiers;
    }
    const modifiers = GatheredModifiers.frozen(GatheredModifiers.gather(fighter));
    GatheredModifiers.kept.set(fighter, { statuses, environment: fighter.environment, equipment: fighter.equipment,
      weapon: equipment?.weapon, worn: equipment?.modifiers, body, traits: fighter.traits, raceId: fighter.raceId,
      variations: fighter.variations, modifiers });
    return modifiers;
  }
  private static gather(fighter: Fighter): Modifiers {
    const conditions = [...new Set(fighter.statuses.map(s => s.id))].map(id => {
      const condition = Content.statuses[id];
      if (!condition || !Object.hasOwn(Content.statuses, id)) { throw new Error(`Unknown status ${id}`); }
      return condition.modifiers;
    });
    // What a condition laid with an amount adds for it (see ConditionAmount).
    const counted = fighter.statuses.filter(s => s.amount)
      .map(s => ConditionAmount.added(Content.statuses[s.id]?.perAmount, s));
    const at = { ...fighter.environment ? { environment: fighter.environment } : {},
      ...fighter.equipment?.weapon ? { weapon: fighter.equipment.weapon } : {} };
    return ModifierSet.sum([...conditions, ...counted, ...CanonRuntime.passives(fighter.traits, at).modifiers,
      fighter.equipment?.modifiers ?? {}, ...KindDefenses.fractions(fighter)]);
  }
  // Frozen through, as far as what it holds is its own (the turn-end harms it lists are the canon's own, and left be).
  private static frozen(m: Modifiers): Modifiers {
    for (const key of ['saves', 'attributes', 'resistances', 'immune', 'onTurnEnd', 'resist'] as const) {
      if (m[key]) { Object.freeze(m[key]); }
    }
    return Object.freeze(m);
  }
}
