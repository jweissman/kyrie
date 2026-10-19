#!/usr/bin/env bun
import { createInterface, type Interface } from 'node:readline/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { Content, type ClassId } from '../src/content';
import { InformationView } from '../src/information/information-view';
import { Campaign } from '../src/campaign/campaign';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Modules } from '../src/campaign/modules';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { Battle } from '../src/battle';
import type { BattleState, Command } from '../src/model';
import { Tactics } from '../src/tactics';
import type { Instance } from '../src/lang/module';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { CombatChoices, type ActionChoice } from '../src/ui/combat-choices';
import { Canon } from '../src/canon/canon';
import { batch } from '../src/arena';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { KyrLint } from './kyr-lint';

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
  static async play(seed: string, classNames?: string, instance?: Instance | Campaign) {
    const classes = classNames?.split(',') as ClassId[] | undefined;
    if (classes?.some(id => !Object.hasOwn(Content.classes, id))) { throw new Error('Unknown class; run kyrie classes'); }
    const campaign = instance instanceof Campaign ? instance : new Campaign(seed, classes, instance);
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
  static auto(seed: string, instance?: Instance) {
    const campaign = new Campaign(seed, undefined, instance);
    Terminal.show(campaign);
    while (campaign.state.outcome === 'active') {
      const plan = campaign.plan();
      console.log('Plan:', plan);
      if (!plan?.actions[0]) { console.log('No achievable plan.'); return; }
      console.log(campaign.execute(plan.actions[0]));
    }
    Terminal.show(campaign);
    console.log(`Campaign: ${campaign.state.outcome}`);
  }
}

const [mode = 'play', seed = 'crossing', argument] = process.argv.slice(2);
switch (mode) {
  case 'lint': process.exitCode = await KyrLint.main(process.argv.slice(3)); break;
  case 'play': await Terminal.play(seed, argument); break;
  case 'adventure': await Terminal.play(seed, undefined, Modules.adventure(seed)); break;
  case 'campaign': await Terminal.play(argument ?? 'campaign', undefined,
    await Campaign.load(seed, argument ?? 'campaign', NodeBundleSource.shared)); break;
  case 'replay': {
    const transcript = JSON.parse(await readFile(seed, 'utf8')) as Transcript;
    const session = await PlaySession.start(transcript.scenario, transcript.seed,
      NodeBundleSource.shared, transcript.party);
    await session.replay(transcript.steps);
    console.log(session.canonical());
    break;
  }
  case 'resume': await Terminal.play('', undefined, Campaign.restore(JSON.parse(await readFile(seed, 'utf8')))); break;
  case 'auto': Terminal.auto(seed); break;
  case 'classes': console.table(Content.classes); break;
  case 'races': console.table(Content.races); break;
  case 'abilities':
    Object.entries(Canon.abilities).forEach(([id, a]) => console.log(`${id}: ${a.name} (${a.kind})\n  ${a.effect ?? a.description ?? ''}`));
    break;
  case 'module-batch': console.log(JSON.stringify(Modules.batch(Number(argument ?? 30), seed), null, 2)); break;
  case 'module': console.log(seed === 'authored' ? Modules.source : Modules.generate(seed).source); break;
  case 'play-module': case 'auto-module': {
    const module = ModuleParser.parse(await Bun.file(seed).text());
    const instance = new ModuleCompiler(Modules.capabilities).instantiate(module, argument ?? 'module');
    if (mode === 'play-module') { await Terminal.play(argument ?? 'module', undefined, instance); }
    else { Terminal.auto(argument ?? 'module', instance); }
    break;
  }
  case 'validate-module': {
    const module = ModuleParser.parse(await Bun.file(seed).text());
    new ModuleCompiler(Modules.capabilities).instantiate(module, argument ?? 'validation');
    console.log(`Valid module: ${module.name}`);
    break;
  }
  case 'generate': console.log(JSON.stringify(new Content(seed).generate('character', { kind: 'hero', hitDie: 8 }), null, 2));
    break;
  case 'validate': Content.validate(); Modules.authored(); console.log(`${Content.abilities.length} abilities and authored module validated.`); break;
  case 'batch': console.log(JSON.stringify(batch(Number(argument ?? 1000), seed), null, 2)); break;
  default: console.log('kyrie campaign <manifest.json> [seed] | adventure [seed] | resume <save.json> | replay <transcript.json>\nkyrie play [seed] [fighter,cleric,magic_user,thief]\nkyrie auto [seed]\nkyrie module [seed|authored] | module-batch [seed] [count] | validate-module <path> | play-module <path> [seed] | auto-module <path> [seed]\nkyrie classes | abilities | generate [seed] | validate | batch [seed] [count]');
}
