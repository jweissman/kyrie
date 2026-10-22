#!/usr/bin/env bun
import { createInterface, type Interface } from 'node:readline/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { Content } from '../src/content';
import { InformationView } from '../src/information/information-view';
import { Campaign } from '../src/campaign/campaign';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Battle } from '../src/battle';
import type { BattleState, Command } from '../src/model';
import { Tactics } from '../src/tactics';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { CombatChoices, type ActionChoice } from '../src/ui/combat-choices';
import { Canon } from '../src/canon/canon';
import { batch } from '../src/arena';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { KyrLint } from './kyr-lint';
import { Preview } from './preview';
import { WorldTool } from './world';

class Terminal {
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

const [mode = 'help', path = '', argument] = process.argv.slice(2);
switch (mode) {
  case 'lint': process.exitCode = await KyrLint.main(process.argv.slice(3)); break;
  case 'preview': await Preview.main(process.argv.slice(3)); break;
  case 'world': await WorldTool.main(process.argv.slice(3)); break;
  case 'campaign': await Terminal.play(await Campaign.load(path, argument ?? 'campaign', NodeBundleSource.shared)); break;
  case 'replay': {
    const transcript = JSON.parse(await readFile(path, 'utf8')) as Transcript;
    const session = await PlaySession.start(transcript.scenario, transcript.seed,
      NodeBundleSource.shared, transcript.party);
    await session.replay(transcript.steps);
    console.log(session.canonical());
    break;
  }
  case 'resume': await Terminal.play(Campaign.restore(JSON.parse(await readFile(path, 'utf8')))); break;
  case 'ancestries': console.table(Canon.ancestries, ['name', 'classes']); break;
  case 'species': console.table(Object.fromEntries(Object.keys(Canon.species).map(id => [id, Canon.creature(id)])),
    ['name', 'type', 'variantOf']); break;
  case 'classes': console.table(Canon.classes, ['name', 'hitDie', 'specializations']); break;
  case 'abilities':
    Object.entries(Canon.abilities).forEach(([id, a]) => console.log(`${id}: ${a.name} (${a.kind})\n  ${a.effect ?? a.description ?? ''}`));
    break;
  case 'validate': Content.validate(); console.log(`${Content.abilities.length} abilities; canonical catalogs valid.`); break;
  case 'batch': console.log(JSON.stringify(batch(Number(argument ?? path ?? 1000), 'arena'), null, 2)); break;
  default: console.log('kyrie campaign <campaign.json> [seed] | resume <save.json> | replay <transcript.json>\n'
    + 'kyrie world <seed> [--terrain forest|marsh|mountain|frost] [--json] | lint [campaign.json] [--inventory]\n'
    + 'kyrie preview <campaign.json> [--port 8080]\n'
    + 'kyrie ancestries | species | classes | abilities | validate | batch [count]');
}
