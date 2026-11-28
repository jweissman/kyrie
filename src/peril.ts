import { Battle } from './battle';
import { Effects } from './effects';
import { Expressions } from './expressions';
import { AbilityUse } from './ability-use';
import { Tactics } from './tactics';
import type { Fighter } from './model';

type ArenaAbility = Battle['repertoire'][number];
// What one blow can come to, by chance: how likely each harm is (the index is the harm).
type Spread = number[];

// How likely the other side's declared blows are to bring one of the company down before the company's turn comes
// round again: each blow's chance to land (AbilityUse.odds, as the game's own tactics judge a blow), its weapon's dice
// spread evenly from their least to their most, and a critical at the most a critical can do. The worst its dice can
// do (PressOn.worst) is what pressing on halts for, as a safety rule; this is what a fight says in words. Five rats
// whose bites at their worst came to fifteen had been told "Together they could bring Odile down" beside an offer that
// read "Easily won: Odile reckons they are no match for you" (cold round A1, OR-1851): of rats that land one bite in
// three, for two or three, the chance was well under one in a hundred.
export class Peril {
  // What a fight calls a chance worth saying: one in ten (a blow a company should weigh, not every blow at its worst).
  static readonly worth = 0.1;
  private static readonly reckoner = new Expressions('peril');
  // The chance the blows declared still to land this round on the target, by those striking them, bring it down.
  static chance(battle: Battle, target: Readonly<Fighter>, foes: readonly Readonly<Fighter>[]): number {
    let spread: Spread = [1];
    for (const foe of foes) {
      const meant = Peril.meant(battle, foe);
      const ability = meant && battle.repertoire.find(a => a.id === meant.ability);
      if (!ability) { continue; }
      for (const blow of Peril.blows(foe, ability, target)) { spread = Peril.add(spread, blow); }
    }
    return spread.reduce((n, p, harm) => n + (harm >= target.hp ? p : 0), 0);
  }
  // Whether the chance is one to say: at least one in ten.
  static material(battle: Battle, target: Readonly<Fighter>, foes: readonly Readonly<Fighter>[]): boolean {
    return Peril.chance(battle, target, foes) >= Peril.worth;
  }
  // Those of the other side whose declared blow reaches the target: aimed at it, or falling on every one of the
  // company.
  static aimed(battle: Battle, target: Readonly<Fighter>): Readonly<Fighter>[] {
    return battle.view.combatants.filter(f => f.team !== target.team && f.hp > 0).filter(foe => {
      const meant = Peril.meant(battle, foe), ability = meant && battle.repertoire.find(a => a.id === meant.ability);
      return !!ability && (meant.target === target.id || ability.effects.some(e => ['enemies', 'all', 'random enemies',
        'random enemy'].includes(e.target)));
    });
  }
  // What a foe means to do before the company's turn comes round: a blow wound up, or one declared and still to come.
  private static meant(battle: Battle, foe: Readonly<Fighter>) {
    const state = battle.view;
    return foe.windup ?? (new Set(state.order ?? []).has(foe.id) ? state.intents?.[foe.id] : undefined);
  }
  // Each blow of an ability on the target: its weapon's, for each strike and each action, at their chances; and the
  // harm of its other effects (a spell's), at their worst, as sure (no roll is reckoned for them).
  private static blows(foe: Readonly<Fighter>, ability: ArenaAbility, target: Readonly<Fighter>): Spread[] {
    const f = foe as Fighter, strikes = ability.effects.filter(e => e.kind === 'attack').length;
    const actions = Math.max(1, Battle.actionsOf(f) + (Effects.modifiers(f).extraAttacksPerTurn ?? 0));
    const sure = Tactics.worst(ability, f), out: Spread[] = sure ? [Peril.at(sure)] : [];
    const routine = f.equipment?.routine?.length ? f.equipment.routine : [undefined];
    for (let n = 0; n < strikes * actions; n++) {
      for (const weapon of routine) {
        const armed = weapon ? { ...f, equipment: { ...f.equipment, weapon } } : f;
        out.push(Peril.blow(armed, target as Fighter));
      }
    }
    return out;
  }
  // One weapon's blow: a miss, or its dice's harm, each as likely, or a critical's.
  private static blow(armed: Fighter, target: Fighter): Spread {
    const dice = Effects.combatant(armed).weapon.damage, hits = AbilityUse.odds(armed, target, 0).lands;
    const least = Peril.roll(armed, dice, n => n), most = Peril.roll(armed, dice, (n, d) => n * d);
    const crits = Math.min(hits, (1 + (Effects.modifiers(armed).criticalRangeIncrease ?? 0)) / 20);
    const spread: Spread = [1 - hits], plain = (hits - crits) / Math.max(1, most - least + 1);
    for (let r = least; r <= most; r++) { Peril.put(spread, AbilityUse.odds(armed, target, r).harm, plain); }
    Peril.put(spread, AbilityUse.heaviest(armed, most), crits);
    return spread;
  }
  // A weapon's dice, each die at what each says (its least, its most), at the striker's values.
  private static roll(armed: Fighter, dice: string, each: (n: number, d: number) => number): number {
    return Peril.reckoner.harm({ kind: 'deem', expression: dice.replace(/(\d*)d(\d+)/g,
      (_, n: string, d: string) => `(${each(Number(n || 1), Number(d))})`) }, Effects.context(armed));
  }
  private static at(harm: number): Spread { const s: Spread = []; Peril.put(s, harm, 1); return s; }
  private static put(spread: Spread, harm: number, p: number): void {
    const h = Math.max(0, Math.round(harm));
    for (let i = spread.length; i <= h; i++) { spread.push(0); }
    spread[h] = spread[h]! + p;
  }
  // Two blows' harms together.
  private static add(a: Spread, b: Spread): Spread {
    const out: Spread = new Array<number>(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
      if (!a[i]) { continue; }
      for (let j = 0; j < b.length; j++) { out[i + j] = out[i + j]! + a[i]! * b[j]!; }
    }
    return out;
  }
}
