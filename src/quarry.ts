import { Canon } from './canon/canon';
import { Effects } from './effects';
import { Fighting } from './rules/fighting';
import { Targeting } from './targeting';
import type { BattleState, CombatEvent, Command, Fighter } from './model';

// Whom a foe goes for, as its kind would, and when one of the company steps in front of another. Every foe had struck
// whoever had the fewest hit points (the audit's SLIP-07), so the mage behind a warrior was cut down first whatever
// the warrior did. Now a beast goes for whoever struck it last, or else the nearest: whoever stands in front (one
// guarding another, then whoever fights hand to hand, the best armoured first). A band of people goes for whoever has
// done it the most harm, or else for the company's leader. A coward (a kind that slinks away: Canon.temperament's
// wary) goes for the weakest only once those stronger than itself are down, and until then as a beast does. Every
// choice is read from the fight as it stands, and ties go to the company's own order, so a seed fights as before.
export type Kind = 'band' | 'beast' | 'coward';
export class Quarry {
  // What a step's blows leave on the fighters: whom each was last hurt by, and the harm each has done the other side.
  static record(fighters: Fighter[], events: readonly CombatEvent[]) {
    for (const e of events) {
      if (e.type !== 'damage' || e.amount <= 0) { continue; }
      const by = fighters.find(f => f.id === e.actor), hurt = fighters.find(f => f.id === e.target);
      if (!by || !hurt || by.team === hurt.team) { continue; }
      hurt.struck = by.id;
      by.harm = (by.harm ?? 0) + e.amount;
    }
  }
  static kind(actor: Fighter): Kind {
    if (Canon.isAncestry(actor.raceId)) { return 'band'; }
    return Canon.temperament(actor.raceId) === 'wary' ? 'coward' : 'beast';
  }
  // The one the actor would rather strike, of those it could.
  static of(state: BattleState, actor: Fighter): string | undefined {
    const enemies = Targeting.candidates('enemy', actor, state.combatants);
    if (!enemies.length) { return undefined; }
    const kind = this.kind(actor);
    if (kind === 'band') { return this.dangerous(enemies)?.id ?? enemies[0]!.id; }
    const weak = kind === 'coward' && !enemies.some(f => f.maxHp > actor.maxHp);
    if (weak) { return [...enemies].sort((a, b) => a.hp - b.hp)[0]!.id; }
    return enemies.find(f => f.id === actor.struck)?.id ?? this.front(state, enemies).id;
  }
  // Whoever has done the most harm, if anyone has.
  private static dangerous(enemies: Fighter[]): Fighter | undefined {
    const hurt = enemies.filter(f => (f.harm ?? 0) > 0);
    return hurt.sort((a, b) => (b.harm ?? 0) - (a.harm ?? 0))[0];
  }
  // Whoever stands nearest: one guarding another is in front of them; then whoever fights hand to hand, not with a
  // missile, the best armoured first.
  private static front(state: BattleState, enemies: Fighter[]): Fighter {
    return [...enemies].sort((a, b) => this.near(state, b) - this.near(state, a))[0]!;
  }
  private static near(state: BattleState, f: Fighter): number {
    return (this.guarding(state, f) ? 100 : 0) + (f.equipment?.weapon?.missile ? 0 : 50) + (f.equipment?.armorAc ?? 0);
  }
  private static guarding(state: BattleState, f: Fighter): boolean {
    return state.combatants.some(o => o.hp > 0 && o.statuses.some(s => s.by === f.id && Effects.status(s.id).guard));
  }
  // How much one of the company would rather stand in front of another now than strike a blow: not at all unless some
  // foe means to strike them this round, they have fewer hit points than the guard, nobody else is guarding them, and
  // what is meant for them could put them down (the worst of each blow, together); then more for each blow meant, and
  // the nearer they are to falling. A mage behind a warrior is guarded; a cleric with a few cuts is not.
  static cover(state: BattleState, guard: Fighter, ally: Fighter): number {
    if (ally.id === guard.id || ally.hp === 0 || ally.hp >= guard.hp) { return 0; }
    if (ally.statuses.some(s => Effects.status(s.id).guard && s.by !== guard.id)) { return 0; }
    const meant = Object.values(state.intents ?? {}).filter(c => c.target === ally.id);
    const worst = meant.reduce((n, c) => n + this.worst(state, c), 0);
    return meant.length && worst >= ally.hp ? 20 + 5 * meant.length + Math.max(0, 8 - ally.hp) : 0;
  }
  // The worst a blow meant for someone could do: the striker's weapon at its highest, and its strength.
  private static worst(state: BattleState, command: Command): number {
    const by = state.combatants.find(f => f.id === command.actor);
    const [, n, d, plus] = /(\d+)d(\d+)(?:\s*\+\s*(\d+))?/.exec(by?.equipment?.weapon?.damage ?? '') ?? [];
    const die = n && d ? Number(n) * Number(d) + Number(plus ?? 0) : 1;
    return die + Math.max(0, by ? Fighting.statMod(Effects.scores(by).strength) : 0);
  }
}
