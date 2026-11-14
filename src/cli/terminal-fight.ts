import { Content } from '../content';
import { Tactics } from '../tactics';
import { CombatChoices, type ActionChoice } from '../ui/combat-choices';
import { TerminalInput, type Asking, type Picking } from './terminal-input';
import { TerminalMenus } from './terminal-menus';
import { TerminalColour } from './terminal-colour';
import type { BattleState, Command } from '../model';

// A fight in the terminal, on the company's turn: its moves in one order from turn to turn, a strike first and the
// rest by name, four in the hand and every one a step further, as the page's fight leads with. Typed (headless) by
// number or name; picked (the human mode) from the same list, by the same keys as a scene (TP-01).
export class TerminalFight {
  static async command(state: BattleState, legal: Command[], input: Asking): Promise<Command | null> {
    // In one order from turn to turn, a strike first and the rest by name, and each to be had by its name too: as
    // drawn, the list had changed its order each turn, and the key that was Cleave became Flee (the same review).
    const choices = CombatChoices.actions(legal, Content.abilities).sort((x, y) => this.blow(x) - this.blow(y)
      || x.ability.name.localeCompare(y.ability.name));
    if (TerminalInput.picks(input)) { return this.picked(state, legal, choices, input); }
    // By name, never by id ("region__s2_u_rats_person_2" had stood in the table: the headless review, 12 November).
    console.table(state.combatants.map(f => ({ name: f.name, hp: `${f.hp}/${f.maxHp}`,
      mana: f.mana, statuses: f.statuses.map(s => s.id).join(', ') })));
    console.log(`Turn ${state.turn}: ${state.combatants.find(f => f.id === state.actor)!.name}`);
    let every = false;
    for (;;) {
      const shown = every ? choices : choices.slice(0, 4);
      shown.forEach((choice, i) => console.log(`${i + 1}. ${choice.ability.name} — ${choice.scope} (mana ${choice.ability.cost ?? 0})`));
      if (shown.length < choices.length) { console.log(`(${choices.length - shown.length} more: all)`); }
      const answer = await input.ask('Action number or name, auto, or q: ');
      if (answer === null || answer === 'q') { return null; }
      if (answer === 'all' || answer === 'more') { every = true; continue; }
      if (answer === 'auto') { return Tactics.choose(state, legal); }
      const choice = choices[Number(answer) - 1]
        ?? choices.find(c => c.ability.name.toLowerCase() === answer.toLowerCase());
      if (!choice) { console.log('Choose a listed action.'); continue; }
      if (!choice.requiresTarget) { return choice.commands[0]!; }
      const target = await this.target(choice, state, input);
      if (target === 'back') { continue; }
      return target;
    }
  }
  // A strike is the weapon's own blow, melee or ranged, by its id: by its name, "Melee Attack" had come fifth.
  private static blow(c: ActionChoice): number { return Number(!['melee', 'ranged'].includes(c.ability.id)); }
  // The same moves as a menu: who stands and how hurt, quietly, then the four and the rest; a target after a move that
  // wants one, back to the moves.
  private static async picked(state: BattleState, legal: Command[], choices: ActionChoice[], input: Picking)
    : Promise<Command | null> {
    const depth = TerminalColour.depth();
    console.log(`\n${TerminalMenus.fighters(state, depth).join('\n')}`);
    const rows = choices.map((c, i) => ({ id: String(i), label: c.ability.name,
      note: `${c.scope}${c.ability.cost ? ` · mana ${c.ability.cost}` : ''}`,
      about: [c.ability.description ?? ''].filter(Boolean) }));
    const actor = state.combatants.find(f => f.id === state.actor)!.name;
    for (;;) {
      const picked = await input.pick({ title: `${actor}'s turn`, rows: rows.slice(0, 4), rest: rows.slice(4),
        keys: { f: { command: 'auto', said: 'fight on' } } });
      if (!picked) { return null; }
      if ('command' in picked) { return Tactics.choose(state, legal); }
      const choice = choices[Number(picked.choice)]!;
      if (!choice.requiresTarget) { return choice.commands[0]!; }
      const target = await this.target(choice, state, input);
      if (target !== 'back') { return target; }
    }
  }
  static async target(choice: ActionChoice, state: BattleState, input: Asking): Promise<Command | 'back' | null> {
    const named = choice.commands.map(command => state.combatants.find(f => f.id === command.target)!);
    if (TerminalInput.picks(input)) {
      const picked = await input.pick({ title: `${choice.ability.name}: at whom?`, back: 'back',
        rows: named.map((t, i) => ({ id: String(i), label: t.name, note: `${t.hp}/${t.maxHp}` })) });
      if (!picked) { return null; }
      return 'command' in picked ? 'back' : CombatChoices.target(choice, choice.commands[Number(picked.choice)]!.target);
    }
    console.log(`${choice.ability.name} — choose a target:`);
    named.forEach((target, index) => console.log(`${index + 1}. ${target.name} (${target.hp}/${target.maxHp})`));
    for (;;) {
      const answer = await input.ask('Target number, b to go back, or q: ');
      if (answer === null || answer === 'q') { return null; }
      if (answer === 'b') { return 'back'; }
      const command = choice.commands[Number(answer) - 1];
      if (command) { return CombatChoices.target(choice, command.target); }
      console.log('Choose an eligible target.');
    }
  }
}
