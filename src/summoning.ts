import type { Effect } from './lang/parse';
import type { EffectContext } from './effects';
import type { Fighter } from './model';
import { Canon } from './canon/canon';
import type { CatalogContext } from './catalog-context';

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
      const pool = Summoning.pool(effect, owner, context.content.vocabulary);
      const drawn = pool[pool.length > 1 ? expressions.number(`1d${pool.length}`) - 1 : 0]!;
      // A companion (a call answered by the beasts of the summoner's people: Orsino's byAncestry) is the summoner's
      // own: the first to answer, from the animals of the country, comes every time after, by its name. Each call
      // had drawn a new one, so that a ranger's "Bram" with a gnawing bite was "Ada" with mandibles in the next fight
      // (cold play 2, CL-11). The die is thrown all the same, so the fight's dice fall as they did.
      // One of it at a time: called again while it stands, another answers, as any would.
      const companion = !!effect.byAncestry && count === 1;
      const standing = context.fighters.some(f => f.summoner === owner.id && f.hp > 0
        && f.name === owner.companion?.name);
      const kept = companion && !standing ? owner.companion : undefined;
      const species = kept?.raceId ?? drawn, id = Summoning.fresh(context);
      const made = context.content.creature(species, id, owner.team, effect.level);
      const creature = { ...made, ...kept ? { name: kept.name } : {}, summoner: owner.id };
      if (companion && !owner.companion) { owner.companion = { raceId: species, name: made.name }; }
      context.fighters.push(creature);
      context.events.push({ type: 'summon', turn: context.turn, actor: owner.id, target: id, detail: creature.name });
    }
    Summoning.trim(owner, context);
  }
  // What answers a call where the fight is (the owner, 6 November: a ranger calls the animals of the country): of those
  // it could call, the ones that live there; a call of animals any of the catalog's wild animals that live there (an
  // animal added by its record answers in its own country); where none does, any it could call.
  static pool(effect: Summon, owner: Fighter, vocabulary?: CatalogContext): string[] {
    const called = effect.byAncestry?.[owner.raceId] ?? effect.from ?? [effect.creature];
    const here = Summoning.habitat(owner.environment);
    if (!here) { return called; }
    const bodies = vocabulary ?? Canon;
    const animals = called.every(id => bodies.isSpecies(id) && bodies.creature(id).kind === 'animal');
    const wild = animals ? Canon.catalogued.filter(id => bodies.creature(id).kind === 'animal'
      && Summoning.lives(id, here, vocabulary) && bodies.temperament(id) !== 'tame' && !bodies.creature(id).variantOf) : [];
    const local = [...new Set([...called.filter(id => Summoning.lives(id, here, vocabulary)), ...wild])];
    return local.length ? local : called;
  }
  private static lives(id: string, here: string, vocabulary?: CatalogContext): boolean {
    const bodies = vocabulary ?? Canon;
    return bodies.isSpecies(id) && !!bodies.creature(id).habitats?.includes(here);
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
