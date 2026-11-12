import { createInterface, type Interface } from 'node:readline/promises';
import { writeFile } from 'node:fs/promises';
import { Content } from '../content';
import { Campaign } from '../campaign/campaign';
import { Battle } from '../battle';
import type { BattleState, Command } from '../model';
import { Tactics } from '../tactics';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatChoices, type ActionChoice } from '../ui/combat-choices';
import { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ScreenModel } from '../ui/screen-model';
import { Narrator, type Told } from '../presentation/narrator';
import { ActionFeedbackView } from '../presentation/action-feedback';
import type { Screen } from '../ui/screen-types';

const quitPlay = 'The player left the encounter.';

// A text client over the same public projection and command path as the browser. It decides layout and input only:
// PlayerView decides what is legal, ScreenModel/Narrator what the player knows, and PlaySession performs every act.
export class Terminal {
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
  private static scene(session: PlaySession, told?: Told) {
    const screen = ScreenModel.build(session.campaign), leaf = Narrator.leaf(session.campaign, screen, told);
    console.log(`\n${screen.place.name} · ${screen.clock}${screen.weather ? ` · ${screen.weather}` : ''}`);
    const prose = [...leaf.situation, ...leaf.presence, ...leaf.changed];
    if (leaf.exchange) { prose.push(...leaf.exchange.lines.map(l => l.text)); }
    for (const line of prose) { console.log(line); }
    if (screen.objectives.length) { console.log(`Aim: ${screen.objectives[0]}`); }
    if (leaf.glance?.need?.length) { console.log(`Need: ${leaf.glance.need.join(' · ')}`); }
    return { screen, leaf };
  }
  private static foreground(session: PlaySession, glance: ReturnType<typeof Narrator.leaf>['glance'], screen: Screen) {
    const all = [...PlayerView.observe(session.campaign).choices];
    for (const d of [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]) {
      const id = `travel:${d.id}`;
      if (!all.some(c => c.id === id)) {
        all.push({ id, name: `Set out for ${d.name}`, time: d.minutes, encounter: false,
          category: 'travel', targets: [d.id] });
      }
    }
    const byId = new Map(all.map(c => [c.id, c]));
    const ids = [...glance?.acts.map(a => a.command ?? a.choice) ?? [], ...glance?.ways ?? []];
    const first = [...new Set(ids)].flatMap(id => byId.get(id) ?? []).slice(0, 4);
    return { all, first: first.length ? first : all.slice(0, 4) };
  }
  // Each by its number alone: the numpad's 7/9/1/3 beside them had made "1" the third choice, not the first (the
  // headless review, 12 November).
  private static choices(rows: { id: string; name: string; time: number }[]) {
    rows.forEach((c, i) => console.log(`${i + 1}. ${c.name}${c.time ? ` · ${c.time} min` : ''}`));
  }
  private static map(session: PlaySession) {
    const screen = ScreenModel.build(session.campaign);
    console.log(`\nMap — ${screen.place.name}`);
    for (const p of screen.map) { console.log(`${p.here ? '*' : p.visited ? '·' : '?'} ${p.name}${p.zone ? ` — ${p.zone}` : ''}`); }
    const destinations = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []];
    if (destinations.length) { console.log(`Journeys: ${destinations.map(d => d.name).join(' · ')}`); }
  }
  private static dossier(session: PlaySession) {
    const screen = ScreenModel.build(session.campaign);
    for (const m of screen.party) {
      console.log(`\n${m.name} — level ${m.level}${m.background ? `, ${m.background}` : ''}`);
      console.log(`HP ${m.hp}/${m.maxHp} · mana ${m.mana}/${m.maxMana} · XP ${m.experience}`);
      console.log(Object.entries(m.attributes).map(([k, v]) => `${k} ${v}`).join(' · '));
      if (m.conditions.length || m.boons?.length) { console.log(`Conditions: ${[...m.conditions, ...m.boons ?? []].join(', ')}`); }
      if (m.spells?.length) { console.log(`Spells: ${m.spells.map(s => `${s.name}${s.ready ? '' : ' (spent)'}`).join(', ')}`); }
    }
    console.log(`Coin ${screen.purse.coin} · rations ${screen.purse.rations}`);
  }
  static async play(session: PlaySession) {
    const input = createInterface({ input: process.stdin, output: process.stdout });
    let told: Told | undefined;
    let current: ReturnType<typeof Terminal.scene> | undefined;
    try {
      while (session.campaign.running) {
        current ??= this.scene(session, told);
        const { screen, leaf } = current;
        const offered = this.foreground(session, leaf.glance, screen);
        console.log('\nForeground'); this.choices(offered.first);
        console.log('Commands: 1-4 · all · map · character · look · save <path> · q');
        const answer = (await input.question('> ')).trim();
        if (answer === 'q' || answer === 'quit') { return; }
        if (answer === 'look') { told = undefined; current = undefined; continue; }
        if (answer === 'map') { this.map(session); continue; }
        if (answer === 'character' || answer === 'dossier') { this.dossier(session); continue; }
        if (answer === 'all') {
          console.log('\nAll legal interactions'); this.choices(offered.all); continue;
        }
        if (answer.startsWith('save ')) {
          const path = answer.slice(5).trim();
          if (!path) { console.log('Name a save path.'); continue; }
          await writeFile(path, JSON.stringify(session.checkpoint(), null, 2));
          console.log(`Saved ${path}.`); continue;
        }
        const numbered = Number(answer) - 1;
        const foreground = numbered >= 0 && numbered < 4 ? numbered : -1;
        const choice = foreground >= 0 ? offered.first[foreground] : offered.all.find(c =>
          c.id === answer || c.name.toLowerCase() === answer.toLowerCase());
        if (!choice) {
          console.log('Choose a foreground number/shortcut, or type an exact label or command id from all.');
          continue;
        }
        const before = PlayerView.observe(session.campaign);
        try {
          const event = await session.leg(choice.id, async battle => {
            const command = await Terminal.command(battle.state, battle.legalCommands(), input);
            if (!command) { throw new Error(quitPlay); }
            return command;
          });
          const after = PlayerView.observe(session.campaign);
          const feedback = ActionFeedbackView.read(session.campaign, event, before);
          told = { event, feedback, said: choice.name, moved: before.location?.id !== after.location?.id };
          current = undefined;
        } catch (error) {
          if (error instanceof Error && error.message === quitPlay) { return; }
          console.log(`! ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      this.scene(session, told);
      console.log('The story has ended.');
    } finally { input.close(); }
  }
  // Compatibility for the legacy `campaign` command; new play uses a session checkpoint end to end.
  static playCampaign(campaign: Campaign) { return this.play(PlaySession.fromSave(campaign.save(), 'campaign')); }
}
