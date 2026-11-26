import type { Battle } from './battle';
import { Content } from './content';
import { Effects } from './effects';
import type { CombatEvent, Fighter } from './model';
import type { ItemCatalog } from './item-catalog';

type ArenaAbility = Battle['repertoire'][number];

// Words in a fight: the company calls on the other side to throw down its arms, once the fight has turned against
// it (the owner, 25 November: combat "doesn't feel dynamic or engaging or fun"; the cold play's fights were mostly
// trivial, fought round by round to the last rat). Only a side that can understand it and has a reason to: every one
// of it standing a thinking creature (not a beast, nor the dead, nor a made thing), and some of it already down or
// fled, or every one of it at half its strength or less. A bout (yields) is over at its first fall already, and is
// not asked. The one whose turn it is makes it, an intimidation check (the stronger of their strength and their
// presence, and their training by their level) against how much fight is left in them: ten, two more for each of
// them standing beyond the company's number, three more while they stand at more than half their strength between
// them, and two more for each time already called and refused. Made, they yield: the fight is over, won, and the band
// is routed (Aftermath), as a band beaten in a bout is, so that its temper begs, gives ground and comes back another
// day (inhabitants.kyr); refused, the turn is spent.
export class Parley {
  static readonly id = 'demand';
  // The act, a fight's own as waiting is: it uses nothing, and is resolved by Battle, not by AbilityUse.
  static readonly ability: ArenaAbility = { id: Parley.id, name: 'Call on them to yield', effects: [],
    description: 'Call on them to throw down their arms: an intimidation check against how much fight is left in them.' };
  // Whether the other side would hear it: each of them standing a thinking creature, and the fight gone against them.
  static heard(catalog: ItemCatalog, fighters: readonly Fighter[], departed: number, bout: boolean): boolean {
    const foes = fighters.filter(f => f.team !== 'fighters' && !f.summoner), standing = foes.filter(f => f.hp > 0);
    if (bout || !standing.length || !standing.every(f => this.thinking(catalog, f))) { return false; }
    return departed > 0 || standing.length < foes.length || standing.every(f => f.hp <= f.maxHp / 2);
  }
  static thinking(catalog: ItemCatalog, f: Fighter): boolean {
    const kind = Content.race(catalog, f.raceId) as { kind?: string; type?: string } | undefined;
    return Effects.scores(f).intelligence >= 6 && !['animal', 'device'].includes(kind?.kind ?? '')
      && !['undead', 'construct', 'ooze', 'elemental', 'plant'].includes(kind?.type ?? '');
  }
  // What it is made against, and with.
  static difficulty(fighters: readonly Fighter[], refused: number): number {
    const foes = fighters.filter(f => f.team !== 'fighters' && f.hp > 0 && !f.summoner);
    const ours = fighters.filter(f => f.team === 'fighters' && f.hp > 0);
    const left = foes.reduce((n, f) => n + f.hp, 0) / Math.max(1, foes.reduce((n, f) => n + f.maxHp, 0));
    return 10 + 2 * Math.max(0, foes.length - ours.length) + (left > 0.5 ? 3 : 0) + 2 * refused;
  }
  static bonus(actor: Fighter): { stat: 'strength' | 'charisma'; modifier: number; trained: number } {
    const scores = Effects.scores(actor), strength = Math.floor((scores.strength - 10) / 2);
    const charisma = Math.floor((scores.charisma - 10) / 2);
    const trained = 2 + Math.floor((Math.max(1, actor.level) - 1) / 4);
    return strength > charisma ? { stat: 'strength', modifier: strength, trained }
      : { stat: 'charisma', modifier: charisma, trained };
  }
  // The chance it is made, as the hand says it.
  static odds(actor: Fighter, fighters: readonly Fighter[], refused: number): number {
    const b = this.bonus(actor), need = this.difficulty(fighters, refused) - b.modifier - b.trained;
    return Math.min(0.95, Math.max(0.05, (21 - need) / 20));
  }
  // The call made, as the fight's record keeps it: the die given, against how much fight is left in them.
  static made(actor: Fighter, fighters: readonly Fighter[], at: { refused: number; turn: number; die: number }):
    Extract<CombatEvent, { type: 'check' }> {
    const b = this.bonus(actor), difficulty = this.difficulty(fighters, at.refused);
    const rolled = at.die + b.modifier + b.trained;
    return { type: 'check', turn: at.turn, actor: actor.id, skill: 'intimidation', rolled, difficulty,
      success: rolled >= difficulty, die: at.die, stat: b.stat, modifier: b.modifier, trained: b.trained };
  }
  // A fight's abilities with words added, once for each list (so that the catalog's is found sound once).
  private static readonly words = new WeakMap<ArenaAbility[], ArenaAbility[]>();
  static worded(base: ArenaAbility[]): ArenaAbility[] {
    if (base.some(a => a.id === Parley.id)) { return base; }
    const kept = Parley.words.get(base) ?? [...base, Parley.ability];
    Parley.words.set(base, kept);
    return kept;
  }
}
