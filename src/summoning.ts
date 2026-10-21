import type { Effect } from './lang/parse';
import type { EffectContext } from './effects';
import type { Fighter } from './model';

type Summon = Extract<Effect, { kind: 'summon' }>;

// Orsino's summoning (Ability summon and Commands.handleSummon): the creatures come at the summoner's call, fight on
// its side and belong to it; a summoner holds at most 3 + level / 3 of them, and calling more sends the oldest away.
// They are the fight's alone: none outlasts it.
export class Summoning {
  static limit(owner: Fighter): number { return 3 + Math.floor(owner.level / 3); }
  static call(effect: Summon, owner: Fighter, context: EffectContext) {
    const expressions = context.expressions!;
    const count = effect.amount ? Math.max(0, expressions.amount(effect.amount, Summoning.values(owner))) : 1;
    for (let i = 0; i < count; i++) {
      const pool = effect.byAncestry?.[owner.raceId] ?? effect.from ?? [effect.creature];
      const species = pool[pool.length > 1 ? expressions.number(`1d${pool.length}`) - 1 : 0]!;
      const id = `summon-${context.fighters.length}-${context.turn}`;
      const creature = { ...context.content.creature(species, id, owner.team, effect.level), summoner: owner.id };
      context.fighters.push(creature);
      context.events.push({ type: 'summon', turn: context.turn, actor: owner.id, target: id, detail: creature.name });
    }
    Summoning.trim(owner, context);
  }
  // Past the limit the oldest go back whence they came, and leave the fight.
  static trim(owner: Fighter, context: EffectContext) {
    const owned = context.fighters.filter(f => f.summoner === owner.id && f.hp > 0);
    for (const gone of owned.slice(0, Math.max(0, owned.length - Summoning.limit(owner)))) {
      context.fighters.splice(context.fighters.indexOf(gone), 1);
      context.events.push({ type: 'dismiss', turn: context.turn, actor: owner.id, target: gone.id, detail: gone.name });
    }
  }
  private static values(owner: Fighter): Record<string, number> {
    return { level: owner.level, strength: owner.strength, dexterity: owner.dexterity, constitution: owner.constitution,
      intelligence: owner.intelligence, wisdom: owner.wisdom, charisma: owner.charisma };
  }
}
