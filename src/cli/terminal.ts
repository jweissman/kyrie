import { createInterface, type Interface } from 'node:readline/promises';
import { writeFile } from 'node:fs/promises';
import { Content } from '../content';
import { InformationView } from '../information/information-view';
import { Campaign } from '../campaign/campaign';
import { Battle } from '../battle';
import type { BattleState, Command } from '../model';
import { Tactics } from '../tactics';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatChoices, type ActionChoice } from '../ui/combat-choices';

// The campaign played in a terminal: the state, the choices numbered, a choice read from the keyboard.
export class Terminal {
  static show(campaign: Campaign) {
    if (InformationView.supported(campaign)) {
      console.log(JSON.stringify(InformationView.observe(campaign), null, 2)); return;
    }
    const state = campaign.state;
    console.log(`\n${campaign.module.name}`);
    console.log(`${campaign.module.description} Time ${state.elapsed}/${state.deadline}`);
    const resources = state.world.measures.map(entry => {
      const names = entry.call.args.map(id => campaign.module.entities.find(e => e.id === id)?.name ?? id);
      return `${entry.call.name}(${names.join(', ')}): ${entry.value}`;
    });
    if (resources.length) { console.log(resources.join('; ')); }
    if (state.outcomes) {
      console.log('Outcomes:', state.outcomes);
      console.log(campaign.world.describe().filter(f => f.startsWith('at(')).join('; '));
    }
    if (state.modules) {
      console.table(state.modules.map(m => ({ module: m.id, outcome: m.outcome, deadline: m.deadline })));
    }
    console.table(state.party.map(f => ({ name: f.name, race: f.raceId, class: f.classId,
      hp: `${f.hp}/${f.maxHp}`, mana: `${f.mana}/${f.maxMana}`, xp: f.experience })));
  }
  static async command(state: BattleState, legal: Command[], input: Interface): Promise<Command | null> {
    console.table(state.combatants.map(f => ({ id: f.id, name: f.name, hp: `${f.hp}/${f.maxHp}`,
      mana: f.mana, statuses: f.statuses.map(s => s.id).join(', ') })));
    console.log(`Turn ${state.turn}: ${state.combatants.find(f => f.id === state.actor)!.name}`);
    const choices = CombatChoices.actions(legal, Content.abilities);
    for (;;) {
      choices.forEach((choice, i) => console.log(`${i + 1}. ${choice.ability.name} — ${choice.scope} (mana ${choice.ability.cost ?? 0})`));
      const answer = (await input.question('Action number, auto, or q: ')).trim();
      if (answer === 'q') { return null; }
      if (answer === 'auto') { return Tactics.choose(state, legal); }
      const choice = choices[Number(answer) - 1];
      if (!choice) { console.log('Choose a listed action.'); continue; }
      if (!choice.requiresTarget) { return choice.commands[0]!; }
      const target = await Terminal.target(choice, state, input);
      if (target === 'back') { continue; }
      return target;
    }
  }
  static async target(choice: ActionChoice, state: BattleState, input: Interface): Promise<Command | 'back' | null> {
    console.log(`${choice.ability.name} — choose a target:`);
    choice.commands.forEach((command, index) => {
      const target = state.combatants.find(f => f.id === command.target)!;
      console.log(`${index + 1}. ${target.name} (${target.hp}/${target.maxHp})`);
    });
    for (;;) {
      const answer = (await input.question('Target number, b to go back, or q: ')).trim();
      if (answer === 'q') { return null; }
      if (answer === 'b') { return 'back'; }
      const command = choice.commands[Number(answer) - 1];
      if (command) { return CombatChoices.target(choice, command.target); }
      console.log('Choose an eligible target.');
    }
  }
  static async battle(battle: Battle, input: Interface): Promise<Command[] | null> {
    const commands: Command[] = [];
    while (!battle.state.outcome) {
      const state = battle.state;
      const actor = state.combatants.find(f => f.id === state.actor)!;
      const legal = battle.legalCommands();
      const command = actor.team === 'fighters' ? await Terminal.command(state, legal, input) :
        Tactics.choose(state, legal);
      if (!command) { return null; }
      const events = battle.step(command);
      commands.push(command);
      events.forEach(e => console.log(CombatPresenter.format(e, battle.state)));
    }
    console.log(`Encounter: ${battle.state.outcome ?? 'active'}`);
    return commands;
  }
  static async play(campaign: Campaign) {
    const input = createInterface({ input: process.stdin, output: process.stdout });
    try {
      while (campaign.running) {
        Terminal.show(campaign);
        const information = InformationView.supported(campaign);
        const available = information ? InformationView.observe(campaign).choices.map(choice =>
          ({ ...choice, description: '', resolve: undefined })) : campaign.available();
        available.forEach((action, i) => console.log(`${i + 1}. ${action.name} — ${action.description}
   Time ${action.time}${action.resolve ? '; encounter' : ''}`));
        const answer = (await input.question('Action number, hint, inspect, auto, save <path>, or q: ')).trim();
        if (answer === 'q') { return; }
        if (answer.startsWith('save ')) {
          await writeFile(answer.slice(5).trim(), JSON.stringify(campaign.save(), null, 2));
          console.log('Campaign saved.'); continue;
        }
        if (answer === 'inspect') { console.log(information ? InformationView.observe(campaign) : campaign.world.describe().join('\n')); continue; }
        if (answer === 'hint') {
          console.log(information ? 'Information-aware hints are outside this experiment.' :
            campaign.plan() ?? 'No plan before the deadline.'); continue;
        }
        const action = answer === 'auto' ? (information ? undefined : available.find(a => a.id === campaign.plan()?.actions[0])) :
          available[Number(answer) - 1];
        if (!action) { console.log('Choose a listed action.'); continue; }
        let quit = false;
        const internalId = information ? InformationView.resolve(campaign, action.id) : action.id;
        const event = await campaign.executeAsync(internalId, async battle => {
          if (await Terminal.battle(battle, input) === null) { quit = true; battle.close(); }
        });
        if (quit) { return; }
        console.log(`${action.name}: ${event.result}.`);
        if (!information) { event.npc?.forEach(npc => console.log(`${npc.actor} pursues ${npc.goal}: ${npc.action}`)); }
      }
      Terminal.show(campaign);
      console.log(`Campaign: ${campaign.state.outcome}`);
    } finally { input.close(); }
  }
}
