import type { Effect } from './lang/parse';
import type { EffectContext } from './effects';
import type { Fighter } from './model';
import { Canon } from './canon/canon';

type Summon = Extract<Effect, { kind: 'summon' }>;

// Orsino's summoning (Ability summon and Commands.handleSummon): the creatures come at the summoner's call, fight on
// its side and belong to it; a summoner holds at most 3 + level / 3 of them, and calling more sends the oldest away.
// They are the fight's alone: none outlasts it.
export class Summoning {
  static limit(owner: Fighter): number {
    const { base, perLevels } = Canon.rules.combat.summons;
    return base + Math.floor(owner.level / perLevels);
  }
  static call(effect: Summon, owner: Fighter, context: EffectContext) {
    const expressions = context.expressions!;
    const count = effect.amount ? Math.max(0, expressions.amount(effect.amount, Summoning.values(owner))) : 1;
    for (let i = 0; i < count; i++) {
      const pool = Summoning.pool(effect, owner);
      const species = pool[pool.length > 1 ? expressions.number(`1d${pool.length}`) - 1 : 0]!;
      const id = Summoning.fresh(context);
      const creature = { ...context.content.creature(species, id, owner.team, effect.level), summoner: owner.id };
      context.fighters.push(creature);
      context.events.push({ type: 'summon', turn: context.turn, actor: owner.id, target: id, detail: creature.name });
    }
    Summoning.trim(owner, context);
  }
  // What answers a call where the fight is (the owner, 6 November: a ranger calls the animals of the country): of those
  // it could call, the ones that live there; a call of animals any of the catalog's wild animals that live there (an
  // animal added by its record answers in its own country); where none does, any it could call.
  static pool(effect: Summon, owner: Fighter): string[] {
    const called = effect.byAncestry?.[owner.raceId] ?? effect.from ?? [effect.creature];
    const here = Summoning.habitat(owner.environment);
    if (!here) { return called; }
    const animals = called.every(id => Canon.isSpecies(id) && Canon.creature(id).kind === 'animal');
    const wild = animals ? Canon.catalogued.filter(id => Canon.creature(id).kind === 'animal' && Summoning.lives(id, here)
      && Canon.temperament(id) !== 'tame' && !Canon.creature(id).variantOf) : [];
    const local = [...new Set([...called.filter(id => Summoning.lives(id, here)), ...wild])];
    return local.length ? local : called;
  }
  private static lives(id: string, here: string): boolean {
    return Canon.isSpecies(id) && !!Canon.creature(id).habitats?.includes(here);
  }
  // The kind of country a fight's ground is (Orsino's environment: a town, a cave, the region's terrain).
  static habitat(environment?: string): string | undefined {
    if (!environment) { return undefined; }
    if (environment === 'urban') { return 'settlement'; }
    return Object.entries(Canon.habitats).find(([id, h]) => id === environment || h.terrains?.includes(environment)
      || h.sites?.includes(environment))?.[0];
  }
  // Past the limit the oldest go back whence they came, and leave the fight.
  static trim(owner: Fighter, context: EffectContext) {
    const owned = context.fighters.filter(f => f.summoner === owner.id && f.hp > 0);
    for (const gone of owned.slice(0, Math.max(0, owned.length - Summoning.limit(owner)))) {
      context.fighters.splice(context.fighters.indexOf(gone), 1);
      context.events.push({ type: 'dismiss', turn: context.turn, actor: owner.id, target: gone.id, detail: gone.name });
    }
  }
  // An id no creature in this fight has had (one called after the oldest was sent away took the id of one still
  // fighting: the architecture review's A22).
  private static fresh(context: EffectContext): string {
    const had = new Set([...context.fighters.map(f => f.id),
      ...context.events.flatMap(e => e.type === 'summon' ? [e.target] : [])]);
    let n = context.fighters.length;
    while (had.has(`summon-${n}-${context.turn}`)) { n++; }
    return `summon-${n}-${context.turn}`;
  }
  private static values(owner: Fighter): Record<string, number> {
    return { level: owner.level, strength: owner.strength, dexterity: owner.dexterity, constitution: owner.constitution,
      intelligence: owner.intelligence, wisdom: owner.wisdom, charisma: owner.charisma };
  }
}
