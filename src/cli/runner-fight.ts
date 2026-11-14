import type { Battle } from '../battle';
import type { Command } from '../model';
import { Content } from '../content';
import { Tactics } from '../tactics';
import { CombatChoices } from '../ui/combat-choices';
import { CombatTelling } from '../ui/combat-telling';
import type { ActType } from '../presentation/offer';
import type { ActionFeedback } from '../presentation/action-feedback';

// A fight as the runner gives it to an agent, turn by turn, as the terminal and the page do: the hand (each move at
// each target, the weapon's blow first), "auto" for this turn as the rules would play it, and "through" to the end.
// A fight had been played whole inside the act that began it, so that a blind walk never had a turn to flee (the
// laboratory's matrix, 15 November).
export interface FightChoice { id: string; label: string; aspects: string[]; type: ActType; marks: string[] }
export class RunnerFight {
  static readonly auto = 'fight:auto';
  static readonly through = 'fight:through';
  private pending?: { battle: Battle; resolve: (c: Command) => void };
  // The battle last waited in, and what of it was left untold when it ended (see closed).
  private battle?: Battle;
  private closing?: string[];
  private waking?: () => void;
  private from = 0;
  private rest = false;
  // The controller the session's leg is given: each of the company's turns waits for the agent, unless it said through.
  readonly controller = (battle: Battle): Promise<Command> => {
    if (this.rest) { return Promise.resolve(Tactics.choose(battle.state, battle.legalCommands())); }
    this.battle = battle;
    return new Promise(resolve => { this.pending = { battle, resolve }; this.waking?.(); });
  };
  // The leg's end, or the next turn the agent must choose in, whichever comes first.
  async next<T>(leg: Promise<T>): Promise<{ done: T } | { turn: true }> {
    // A turn already waiting (asked for before this was listened for) is the next.
    if (this.pending) { return { turn: true }; }
    const turn = new Promise<{ turn: true }>(resolve => { this.waking = resolve.bind(undefined, { turn: true }); });
    const out = await Promise.race([leg.then(done => ({ done })), turn]);
    if ('done' in out) {
      const b = this.battle;
      this.closing = b && CombatTelling.exchanges(b.events.slice(this.from), b.state).map(t => t.text);
      this.pending = undefined; this.battle = undefined; this.rest = false; this.from = 0;
    }
    return out;
  }
  // A fight told turn by turn ends by its last blows, told once as its turns were (BP-02: the outcome had told the
  // whole fight again, "Rat 1" become "the first rat"), then what was witnessed meanwhile and how it ended, as the
  // page's host tells it (EngineHost.unfought); a fight that never waited on the agent keeps its one telling.
  closed(feedback: ActionFeedback): ActionFeedback {
    const closing = this.closing;
    this.closing = undefined;
    return closing ? { ...feedback, immediate: [...closing, ...feedback.immediate
      .filter(t => t.startsWith('You witness: ') || t === feedback.result)] } : feedback;
  }
  get fighting(): boolean { return !!this.pending; }
  // What has happened since the agent last chose, and who stands as they are.
  lines(): string[] {
    const b = this.pending?.battle;
    if (!b) { return []; }
    const events = b.events, told = CombatTelling.exchanges(events.slice(this.from), b.state).map(t => t.text);
    this.from = events.length;
    const who = b.state.combatants.map(f => `${f.name} ${f.hp}/${f.maxHp}`).join(' · ');
    return [...told, who];
  }
  choices(): FightChoice[] {
    const b = this.pending?.battle;
    if (!b) { return []; }
    const state = b.state;
    const hand = CombatChoices.actions(b.legalCommands(), Content.abilities)
      .sort((x, y) => Number(!['melee', 'ranged'].includes(x.ability.id)) - Number(!['melee', 'ranged'].includes(y.ability.id)))
      .flatMap(c => c.commands.map(m => ({ id: `fight:${m.ability}:${m.target}`, type: 'fight' as const, marks: [],
        aspects: c.ability.id === 'flee' ? [] : ['danger'],
        label: c.requiresTarget ? `${c.ability.name} at ${RunnerFight.name(b, m.target)}` : c.ability.name })));
    const actor = RunnerFight.name(b, state.actor);
    return [...hand, { id: RunnerFight.auto, label: `Let ${actor} fight this turn`, type: 'fight', aspects: [], marks: [] },
      { id: RunnerFight.through, label: 'Press on to the end', type: 'fight', aspects: [], marks: [] }];
  }
  // The four led with in a fight, as the page's hand leads: the weapon's blow, the way out, this turn, the rest of it.
  offer(): { primary: FightChoice[]; rest: FightChoice[] } {
    const all = this.choices(), flee = all.find(c => /^fight:flee:/.test(c.id));
    const primary = [all[0], flee, all.at(-2), all.at(-1)].filter((c, i, list): c is FightChoice => !!c
      && list.indexOf(c) === i);
    return { primary, rest: all.filter(c => !primary.includes(c)) };
  }
  private static name(b: Battle, id: string): string { return b.state.combatants.find(f => f.id === id)?.name ?? id; }
  // The agent's choice for the turn, by its id.
  choose(id: string): boolean {
    const p = this.pending;
    if (!p) { return false; }
    const legal = p.battle.legalCommands();
    const [, ability, target] = /^fight:([^:]+):(.+)$/.exec(id) ?? [];
    const command = id === RunnerFight.auto || id === RunnerFight.through ? Tactics.choose(p.battle.state, legal)
      : legal.find(c => c.ability === ability && c.target === target);
    if (!command) { return false; }
    if (id === RunnerFight.through) { this.rest = true; }
    this.pending = undefined;
    p.resolve(command);
    return true;
  }
}
