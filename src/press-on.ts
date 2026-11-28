import { Battle } from './battle';
import { Effects } from './effects';
import { Peril } from './peril';
import type { BattleState, Fighter } from './model';
import { Tactics } from './tactics';

type ArenaAbility = Battle['repertoire'][number];

// A fight pressed on (fought by the company's own tactics turn after turn: "Press on to the end", and a fight
// foregone) stops, and hands the fight back, before a turn of the company's where the player must choose again. One
// rule, which the page's host, the terminal and the runner all read: each had kept its own (the runner none at all),
// and none looked at what was coming, so that a blow taking one of the company from above a third of their strength to
// nothing never paused (the cold play of 25 November, its design D2: a party lost under Press on to the end, and
// Brokk; OR-830). It stops when:
// - one of the company goes down, or to a third of their strength or less;
// - the blows the other side has declared for the rest of the round could bring one of the company down, each at the
//   worst its dice can do, a critical and all: a killing blow is possible;
// - someone new joins the other side (one called up, or come late);
// - some of the other side break and run, so that the company may let them go or go after them.
// Each is said once in a fight: pressed on again after it, the fight goes on until something new is the matter. What
// stood so when pressing on was first asked for was there to be seen, and is not said.
export class PressOn {
  private readonly said = new Set<string>();
  private constructor(state: Readonly<BattleState>) {
    for (const f of state.combatants) {
      if (f.team !== 'fighters') { this.said.add(`come:${f.id}`); }
      else if (f.hp <= f.maxHp / 3) { this.said.add(`${f.hp ? 'low' : 'down'}:${f.id}`); }
      if (f.hp === 0) { this.said.add(`low:${f.id}`); }
    }
    for (const f of state.departed ?? []) { this.said.add(`fled:${f.id}`); }
  }
  // Pressing on from the fight as it stands now.
  static from(state: Readonly<BattleState>): PressOn { return new PressOn(state); }
  // Why pressing on stops before this turn of the company's, in words, or nothing if it goes on. called: what the
  // company calls each in the fight (BandNames), where a client knows it.
  halt(battle: Battle, called?: ReadonlyMap<string, string>): string | undefined {
    const reason = this.reasons(battle, called).find(([key]) => !this.said.has(key));
    if (!reason) { return undefined; }
    this.said.add(reason[0]);
    return reason[1];
  }
  private reasons(battle: Battle, called?: ReadonlyMap<string, string>): [string, string][] {
    const state = battle.view, name = PressOn.name.bind(undefined, called);
    const ours = state.combatants.filter(f => f.team === 'fighters'), threat = PressOn.threat(battle);
    return [
      ...ours.filter(f => f.hp === 0).map(f => [`down:${f.id}`, `${name(f)} is down.`] as [string, string]),
      ...ours.filter(f => f.hp > 0 && f.hp <= f.maxHp / 3)
        .map(f => [`low:${f.id}`, `${name(f)} is badly hurt.`] as [string, string]),
      ...(state.departed ?? []).map(f => [`fled:${f.id}`, `${name(f)} breaks and runs.`] as [string, string]),
      ...state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0)
        .map(f => [`come:${f.id}`, `${name(f)} joins the fight.`] as [string, string]),
      ...ours.filter(f => f.hp > 0 && (threat.get(f.id)?.harm ?? 0) >= f.hp)
        .map(f => [`threat:${f.id}`, PressOn.peril(battle, f, { threat: threat.get(f.id)!, name })] as [string, string]),
    ];
  }
  // How a killing blow possible is said: by its striker where one blow could do it and the chance is worth weighing
  // (Peril); by the blows coming where it would take them together; and, where it would take every blow landing hard,
  // as the long chance it is (five rats at their worst had read "Odile could fall to the first rat's next blow" of a
  // bite that does two or three: cold round A1, OR-1851). The halt is the same in each: what is possible is asked.
  private static peril(battle: Battle, f: Readonly<Fighter>,
    at: { threat: { heaviest: number; by: string }; name: (f: { id: string; name: string }) => string }): string {
    const by = battle.view.combatants.find(x => x.id === at.threat.by)!, who = at.name(f);
    if (!Peril.material(battle, f, Peril.aimed(battle, f))) {
      return `${who} would fall only if every blow coming landed hard.`;
    }
    return at.threat.heaviest >= f.hp ? `${who} could fall to ${at.name(by)}'s next blow.`
      : `${who} could fall to the blows coming.`;
  }
  private static name(called: ReadonlyMap<string, string> | undefined, f: { id: string; name: string }): string {
    return called?.get(f.id) ?? f.name;
  }
  // The most the other side's declared blows still to land this round (and a blow wound up, which lands at its
  // striker's next turn) could take from each of the company, by their ids, and whose is the heaviest of them.
  static threat(battle: Battle): Map<string, { harm: number; by: string; heaviest: number }> {
    const state = battle.view, pending = new Set(state.order ?? []);
    const out = new Map<string, { harm: number; by: string; heaviest: number }>();
    const ours = state.combatants.filter(f => f.team === 'fighters' && f.hp > 0);
    for (const foe of state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0)) {
      const meant = foe.windup ?? (pending.has(foe.id) ? state.intents?.[foe.id] : undefined);
      const ability = meant && battle.repertoire.find(a => a.id === meant.ability);
      if (!meant || !ability) { continue; }
      const harm = PressOn.worst(foe, ability);
      for (const f of PressOn.reached(ability, meant.target, ours)) {
        const was = out.get(f.id), heavier = !was || harm > was.heaviest;
        out.set(f.id, { harm: (was?.harm ?? 0) + harm, heaviest: heavier ? harm : was!.heaviest,
          by: heavier ? foe.id : was!.by });
      }
    }
    return out;
  }
  // The most an ability comes to on one it falls on: its weapon's blow where it strikes with one (for each action the
  // kind has in a turn), and its harm's dice at their highest.
  static worst(foe: Readonly<Fighter>, ability: ArenaAbility): number {
    const f = foe as Fighter, strikes = ability.effects.filter(e => e.kind === 'attack').length;
    const actions = Math.max(1, Battle.actionsOf(f) + (Effects.modifiers(f).extraAttacksPerTurn ?? 0));
    return (strikes ? strikes * actions * Tactics.heaviest(f) : 0) + Tactics.worst(ability, f);
  }
  // Whom of the company an ability reaches: all of them for one that falls on every enemy, else whom it is aimed at.
  private static reached(ability: ArenaAbility, target: string, ours: Readonly<Fighter>[]): Readonly<Fighter>[] {
    const all = ability.effects.some(e => ['enemies', 'all', 'random enemies', 'random enemy'].includes(e.target));
    return all ? ours : ours.filter(f => f.id === target);
  }
}

