import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';
import { Pressing } from '../pressing';
import { FoeIntents } from '../foe-intents';
import { ItemCatalog } from '../item-catalog';
import { ItemNames } from '../lang/item-names';
import { CombatChoices } from '../ui/combat-choices';
import { CombatTelling } from '../ui/combat-telling';
import { ChoiceList } from '../ui/choice-list';
import type { ActType } from '../presentation/offer';
import { ActionFeedbackView, type ActionFeedback } from '../presentation/action-feedback';

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
  // What the fight opened on, told then and not again as it closes (GR-05).
  private opening: string[] = [];
  private waking?: () => void;
  private from = 0;
  // Pressed on from where it was asked for, until the engine's one rule stops it (see PressOn), and why it stopped,
  // told with the turn it stopped at.
  private rest = false;
  private pressed = new Pressing();
  private halted?: string;
  private opened = false;
  // The controller the session's leg is given: each of the company's turns waits for the agent, unless it said through.
  readonly controller = (battle: Battle): Promise<Command> => {
    if (this.rest) {
      this.halted = this.pressed.halt(battle);
      if (!this.halted) { return Promise.resolve(Tactics.choose(battle.state, battle.legalCommands())); }
      this.rest = false;
    }
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
      this.closing = b && CombatTelling.since(b.events, this.from, b.state).map(t => t.text);
      this.pending = undefined; this.battle = undefined; this.rest = false; this.halted = undefined; this.from = 0;
      this.opened = false;
    }
    return out;
  }
  // A fight told turn by turn ends by its last blows, told once as its turns were (BP-02: the outcome had told the
  // whole fight again, "Rat 1" become "the first rat"), then what was witnessed meanwhile and how it ended, as the
  // page's host tells it (EngineHost.unfought); a fight that never waited on the agent keeps its one telling.
  closed(feedback: ActionFeedback): ActionFeedback {
    const closing = this.closing, opened = this.opening;
    this.closing = undefined; this.opening = [];
    return closing ? ActionFeedbackView.fought(feedback, closing, feedback.result ? [feedback.result] : [], opened)
      : feedback;
  }
  get fighting(): boolean { return !!this.pending; }
  // What has happened since the agent last chose, and who stands as they are.
  // begun: what the fight opens on (see FightBegun), said on its first turn.
  lines(begun?: () => string[]): string[] {
    const b = this.pending?.battle;
    if (!b) { return []; }
    const opening = this.opened ? [] : begun?.() ?? [];
    if (!this.opened) { this.opening = opening; }
    this.opened = true;
    const events = b.events, told = CombatTelling.since(events, this.from, b.state).map(t => t.text);
    this.from = events.length;
    // Each side named as a side (cold play 7, CL-60: "Bryn 10/10 · Nettle 6/6 · …" had read a hob as one of the
    // company).
    const who = `${RunnerFight.side(b, true)} | against you: ${RunnerFight.side(b, false)}`;
    // What is coming before the company's turn comes round again (see FoeIntents).
    const halted = this.halted ? [`${this.halted} Choose again.`] : [], coming = FoeIntents.lines(b);
    this.halted = undefined;
    return [...opening, ...told, ...coming, ...halted, who];
  }
  choices(): FightChoice[] {
    const b = this.pending?.battle;
    if (!b) { return []; }
    const state = b.state;
    // The fight's own repertoire, as the page's (CombatModel): what the company carries to use up among it (cold play
    // 3, CL-14: a warrior died with two healing draughts in her pack, never offered in the fight).
    const hand = CombatChoices.actions(b.legalCommands(), b.repertoire)
      .sort((x, y) => Number(!['melee', 'ranged'].includes(x.ability.id)) - Number(!['melee', 'ranged'].includes(y.ability.id)))
      .flatMap(c => c.commands.map(m => ({ id: `fight:${m.ability}:${m.target}`, type: 'fight' as const, marks: [],
        aspects: ['flee', 'demand'].includes(c.ability.id) ? [] : ['danger'],
        label: RunnerFight.called(b, c.ability, m.target, c.requiresTarget) })));
    const actor = RunnerFight.name(b, state.actor);
    // Pressed on to its end only where it is as good as won, as the page offers it (ChoiceList.decided; cold play 7,
    // CL-59: offered among the four from the first round, it took a cleric of ten hit points to death in two).
    const sides = { foes: state.combatants.filter(f => f.team !== 'fighters'),
      allies: state.combatants.filter(f => f.team === 'fighters') };
    return [...hand, { id: RunnerFight.auto, label: `Let ${actor} fight this turn`, type: 'fight', aspects: [], marks: [] },
      ...ChoiceList.decided(sides) ? [{ id: RunnerFight.through, label: 'Press on to the end', type: 'fight' as const,
        aspects: [], marks: [] }] : []];
  }
  // The four led with in a fight, as the page's hand leads: the weapon's blow, the way out, this turn, the rest of it.
  offer(): { primary: FightChoice[]; rest: FightChoice[] } { return RunnerFight.four(this.choices()); }
  // By what each is, never by where it falls: the third had been the second-last row, which, with no pressing on to
  // be had, was the last thing in the hand ("Use a minor potion of healing on Hugh Lamb", Hugh unhurt and the leader
  // at 4 of 11: OR-693). The call to yield (Parley) leads after the blow when it is offered.
  static four(all: FightChoice[]): { primary: FightChoice[]; rest: FightChoice[] } {
    const kinds = [/^fight:demand:/, /^fight:flee:/, /^fight:auto$/, /^fight:through$/];
    const primary = [all[0], ...kinds.map(re => all.find(c => re.test(c.id)))]
      .filter((c, i, list): c is FightChoice => !!c && list.indexOf(c) === i);
    return { primary, rest: all.filter(c => !primary.includes(c)) };
  }
  // A carried thing is used ("Use a minor potion of healing on Wenna"), as the page calls it; an ability is aimed.
  private static called(b: Battle, ability: { id: string; name: string }, target: string, aimed: boolean): string {
    if (ItemCatalog.carried(ability.id)) { return `Use ${ItemNames.called(ability.name)}${aimed ? ` on ${RunnerFight.name(b, target)}` : ''}`; }
    return aimed ? `${ability.name} at ${RunnerFight.name(b, target)}` : ability.name;
  }
  private static side(b: Battle, ours: boolean): string {
    return b.state.combatants.filter(f => (f.team === 'fighters') === ours).map(f => `${f.name} ${f.hp}/${f.maxHp}`)
      .join(' · ');
  }
  private static name(b: Battle, id: string): string { return b.state.combatants.find(f => f.id === id)?.name ?? id; }
  // Why a fight act asked for is not offered: it is another's turn (cold play 3, CL-21: Prepare Charge refused, it
  // being Carlin's turn, and nothing said so).
  whose(id: string): string {
    const b = this.pending?.battle, [, , actor] = /^fight:([^:]+):(.+)$/.exec(id) ?? [];
    if (!b) { return ''; }
    const now = RunnerFight.name(b, b.state.actor);
    return actor && actor !== b.state.actor && b.state.combatants.some(f => f.id === actor && f.team === 'fighters')
      ? ` (it is ${now}'s turn)` : ` (${now} acts now)`;
  }
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
