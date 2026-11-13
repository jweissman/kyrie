import { TerminalInput } from './terminal-input';
import { Typography } from '../presentation/typography';
import { writeFile } from 'node:fs/promises';
import { Content } from '../content';
import { Campaign } from '../campaign/campaign';
import { Battle } from '../battle';
import { ActionTime } from '../campaign/action-time';
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
import { Undertakings } from '../presentation/undertakings';
import { SceneModel } from '../ui/scene';
import { Attending } from '../ui/attention';
import type { Choice } from '../ui/choice-list';
import type { Aspect, Promoted } from '../presentation/glance-types';

const quitPlay = 'The player left the encounter.';
// A choice as the terminal lists it, and what the page draws on it in words.
interface Listed { id: string; name: string; time: number; targets?: string[]; said?: string }
// Whom the company is speaking with (and what the likeness turned to was drawn for), what was last told, the scene.
interface Talking { id: string; inside: Promoted['inside'] }
interface Turn { told?: Told; current?: { screen: Screen; leaf: ReturnType<typeof Narrator.leaf> }; talking?: Talking }
// The page's signals in words (its colours are web/reader/emphasis.ts): a headless player had seen no gold and no pip,
// and could neither follow an aim nor tell what a mark promised (M21's playability investigation).
const signal: Record<Aspect, string> = { undertaking: 'gold: your aim', exploration: 'silver', payoff: 'green: to gain',
  knowledge: 'blue: to learn', danger: 'red: danger', wonder: 'violet', companionship: 'rose: a companion' };

// A text client over the same public projection and command path as the browser. It decides layout and input only:
// PlayerView decides what is legal, ScreenModel/Narrator what the player knows, and PlaySession performs every act.
export class Terminal {
  static async command(state: BattleState, legal: Command[], input: TerminalInput): Promise<Command | null> {
    // By name, never by id ("region__s2_u_rats_person_2" had stood in the table: the headless review, 12 November).
    console.table(state.combatants.map(f => ({ name: f.name, hp: `${f.hp}/${f.maxHp}`,
      mana: f.mana, statuses: f.statuses.map(s => s.id).join(', ') })));
    console.log(`Turn ${state.turn}: ${state.combatants.find(f => f.id === state.actor)!.name}`);
    // In one order from turn to turn, a strike first and the rest by name, and each to be had by its name too: as
    // drawn, the list had changed its order each turn, and the key that was Cleave became Flee (the same review).
    const choices = CombatChoices.actions(legal, Content.abilities).sort((x, y) =>
      Number(!/^(attack|strike)/i.test(x.ability.name)) - Number(!/^(attack|strike)/i.test(y.ability.name))
      || x.ability.name.localeCompare(y.ability.name));
    for (;;) {
      choices.forEach((choice, i) => console.log(`${i + 1}. ${choice.ability.name} — ${choice.scope} (mana ${choice.ability.cost ?? 0})`));
      const answer = await input.ask('Action number or name, auto, or q: ');
      if (answer === null || answer === 'q') { return null; }
      if (answer === 'auto') { return Tactics.choose(state, legal); }
      const choice = choices[Number(answer) - 1]
        ?? choices.find(c => c.ability.name.toLowerCase() === answer.toLowerCase());
      if (!choice) { console.log('Choose a listed action.'); continue; }
      if (!choice.requiresTarget) { return choice.commands[0]!; }
      const target = await Terminal.target(choice, state, input);
      if (target === 'back') { continue; }
      return target;
    }
  }
  static async target(choice: ActionChoice, state: BattleState, input: TerminalInput): Promise<Command | 'back' | null> {
    console.log(`${choice.ability.name} — choose a target:`);
    choice.commands.forEach((command, index) => {
      const target = state.combatants.find(f => f.id === command.target)!;
      console.log(`${index + 1}. ${target.name} (${target.hp}/${target.maxHp})`);
    });
    for (;;) {
      const answer = await input.ask('Target number, b to go back, or q: ');
      if (answer === null || answer === 'q') { return null; }
      if (answer === 'b') { return 'back'; }
      const command = choice.commands[Number(answer) - 1];
      if (command) { return CombatChoices.target(choice, command.target); }
      console.log('Choose an eligible target.');
    }
  }
  static async battle(battle: Battle, input: TerminalInput): Promise<Command[] | null> {
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
  // whole: looked at deliberately, with what the glance leaves out (Narrator's held: three sentences at a glance).
  private static scene(session: PlaySession, told?: Told, whole = false) {
    const screen = ScreenModel.build(session.campaign), leaf = Narrator.leaf(session.campaign, screen, told);
    console.log(`\n${screen.place.name} · ${screen.clock}${screen.weather ? ` · ${screen.weather}` : ''}`);
    // At a glance, as the page tells it (Narrator's glanced); looked at, the place whole.
    const seen = whole || !leaf.glanced ? leaf : leaf.glanced;
    const prose = [...seen.situation, ...seen.presence, ...leaf.changed];
    if (leaf.exchange) { prose.push(...leaf.exchange.lines.map(l => l.text)); }
    for (const line of prose) { console.log(Typography.plain(line)); }
    if (screen.objectives.length) { console.log(`Aim: ${screen.objectives[0]}`); }
    if (leaf.glance?.need?.length) { console.log(`Need: ${leaf.glance.need.join(' · ')}`); }
    return { screen, leaf };
  }
  private static foreground(session: PlaySession, glance: ReturnType<typeof Narrator.leaf>['glance'], screen: Screen,
    talking?: Talking) {
    // Each choice's minutes, as the page says them (ActionTime.minutes), not its ticks: "Bury him · 1 min" had taken
    // two hours, a way into the next stretch of country listed in minutes took ninety (cold review A, 12 November).
    const world = session.campaign.world;
    const minutes = new Map(PlayerView.choices(session.campaign)
      .map(r => [r.choice.id, ActionTime.minutes(r.action, world)]));
    const all = PlayerView.observe(session.campaign).choices
      .map(c => ({ ...c, time: minutes.get(c.id) ?? c.time * 10 }));
    for (const d of [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]) {
      const id = `travel:${d.id}`;
      if (!all.some(c => c.id === id)) {
        all.push({ id, name: `Set out for ${d.name}`, time: d.minutes, encounter: false,
          category: 'travel', targets: [d.id] });
      }
    }
    // A way into the next stretch of country led with is set out on as a journey there (travel:, see HexBoundary),
    // as the page's map does: the gold "To the road between Mistshaw and Millholm" had been dropped from the
    // terminal's foreground, which knew no such id (M21's playability investigation).
    for (const a of glance?.acts ?? []) {
      if (a.command?.startsWith('travel:') && !all.some(c => c.id === a.command)) {
        all.push({ id: a.command, name: a.label, time: 0, encounter: false, category: 'travel',
          targets: [a.command.slice('travel:'.length)] });
      }
    }
    const byId = new Map(all.map(c => [c.id, c]));
    // What the page leads with inside a talk (the question the aim waits on, Promoted.inside) is offered as itself:
    // "Talk to Odo" had led the terminal's foreground, and "Ask Odo about the road your father took" was only under
    // `all`, eight times in one cold review (12 November); the page shows it as the talk's own line.
    const ids = [...glance?.acts.flatMap(a => [...a.inside?.map(x => x.command) ?? [], a.command ?? a.choice]) ?? [],
      ...glance?.ways ?? []];
    // Inside a talk, each reply drawn as the likeness turned to was drawn for it (see Promoted.inside; E185).
    const acts = [...glance?.acts ?? [], ...talking ? [{ inside: talking.inside } as Promoted] : []];
    // While someone is spoken with, what can be put to them, as the page's conversation lists it (Attending.talk):
    // "Talk to the wagoner" had been drawn blue, and opened onto nothing to ask him (M21's playability investigation).
    const talk = talking && Attending.talk(SceneModel.build(screen), talking.id);
    if (talk) {
      const replies = [...talk.replies, talk.leave].flatMap(c => this.leaves(c))
        .flatMap(c => byId.get(c.command!) ?? []);
      if (replies.length) { return { all, first: replies.map(c => this.drawn(acts, c)), talk: true }; }
    }
    const first = [...new Set(ids)].flatMap(id => byId.get(id) ?? []).slice(0, 4);
    return { all, first: (first.length ? first : all.slice(0, 4)).map(c => this.drawn(acts, c)) };
  }
  private static drawn<T extends { id: string }>(acts: Promoted[], c: T): T & { said?: string } {
    const said = this.said(acts, c.id);
    return said ? { ...c, said } : c;
  }
  private static leaves(c: Choice): Choice[] {
    return c.children?.length ? c.children.flatMap(k => this.leaves(k)) : c.command ? [c] : [];
  }
  // What the page draws on a choice: gold only on the followed aim's next step (Promoted.continues), else its aspects.
  private static said(acts: Promoted[] | undefined, id: string): string | undefined {
    const inner = acts?.flatMap(a => a.inside ?? []).find(x => x.command === id)?.aspects ?? [];
    const act = acts?.find(a => (a.command ?? a.choice) === id);
    // Within a talk, the aim's own question is gold as its likeness was (Emphasis.within).
    const next = act?.continues || !!acts?.some(a => a.continues && a.for === id);
    const tones = [...next ? ['undertaking' as const] : [], ...act?.aspects ?? [], ...inner]
      .filter((a, i, xs) => (a !== 'undertaking' || next) && xs.indexOf(a) === i);
    return tones.length ? tones.map(a => signal[a]).join(', ') : undefined;
  }
  // A choice typed as it is printed, or without its notes: what comes before the first " · " (its minutes, its odds),
  // without its signal in brackets, stress or curled quotes, in any case. "Read the notice on the well-post · 1 min",
  // typed as shown, had been refused (round 12, B: T10, T24-19).
  static same(name: string, typed: string): boolean { return this.bare(name) === this.bare(typed); }
  private static bare(text: string): string {
    return Typography.plain(text).replace(/\s+\[[^\]]*\]\s*$/, '').split(' · ')[0]!.replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"').trim().toLowerCase();
  }
  // Each by its number alone: the numpad's 7/9/1/3 beside them had made "1" the third choice, not the first (the
  // headless review, 12 November).
  private static choices(rows: Listed[]) {
    rows.forEach((c, i) => console.log(`${i + 1}. ${Typography.plain(c.name)}${c.time ? ` · ${c.time} min` : ''}`
      + `${c.said ? `  [${c.said}]` : ''}`));
  }
  // A journey's legs, one line each, and why it stopped short, as the page's map tells them.
  private static journey(session: PlaySession) {
    const done = session.journeyed, here = session.campaign.module.entities;
    for (const leg of done?.legs ?? []) {
      const to = here.find(e => e.id === session.campaign.world.one('at', session.campaign.playerActor ?? 'party'));
      console.log(`  … ${leg.said}${leg === done!.legs.at(-1) && to ? ` (${to.name})` : ''}`);
    }
    if (done?.stopped) { console.log(`  ${done.stopped}.`); }
  }
  // The aims held, as the Notes list them, and the one followed; `follow <n>` chooses one, as Follow this does.
  private static aims(session: PlaySession, answer: string) {
    const aims = ScreenModel.build(session.campaign).aims ?? [];
    const n = Number(answer.slice(6).trim()) - 1;
    if (answer.startsWith('follow')) {
      if (!aims[n]) { console.log('Follow which? (see aims)'); return; }
      Undertakings.follow(session.campaign, aims[n].id);
      return;
    }
    if (answer === 'unfollow') { Undertakings.follow(session.campaign); return; }
    aims.forEach((a, i) => console.log(`${i + 1}. ${a.followed ? '(followed) ' : ''}${Typography.plain(a.text)}`));
    if (!aims.length) { console.log('No aim is held.'); }
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
    const input = TerminalInput.open();
    const turn: Turn = {};
    try {
      while (session.campaign.running) {
        turn.current ??= this.scene(session, turn.told);
        const { screen, leaf } = turn.current;
        const offered = this.foreground(session, leaf.glance, screen, turn.talking);
        if (turn.talking && !offered.talk) { turn.talking = undefined; }
        console.log(offered.talk ? '\nSaid to them' : '\nForeground'); this.choices(offered.first);
        console.log('Commands: 1-4 · all · map · character · aims · follow <n> · look · save <path> · q');
        const answer = await input.ask('> ');
        if (answer === null || answer === 'q' || answer === 'quit') { return; }
        if (await this.aside(session, answer, offered.all, turn)) { continue; }
        const numbered = Number(answer) - 1;
        const choice = numbered >= 0 && numbered < offered.first.length ? offered.first[numbered]
          : offered.all.find(c => c.id === answer || Terminal.same(c.name, answer));
        if (!choice) {
          console.log('Choose a foreground number/shortcut, or type an exact label or command id from all.');
          continue;
        }
        if (!await this.act(session, choice, turn, input)) { return; }
      }
      this.scene(session, turn.told);
      console.log('The story has ended.');
    } finally { input.close(); }
  }
  // What is not an act in the story: looking again, the map, the sheet, the aims, the whole list, a save.
  private static async aside(session: PlaySession, answer: string, all: Listed[], turn: Turn): Promise<boolean> {
    if (answer === 'look') { turn.told = undefined; turn.current = this.scene(session, undefined, true); return true; }
    if (answer === 'map') { this.map(session); return true; }
    if (answer === 'character' || answer === 'dossier') { this.dossier(session); return true; }
    if (answer === 'aims') { this.aims(session, answer); return true; }
    if (/^(follow \d+|unfollow)$/.test(answer)) {
      this.aims(session, answer); turn.current = undefined; turn.told = undefined; return true;
    }
    if (answer === 'all') { console.log('\nAll legal interactions'); this.choices(all); return true; }
    if (!answer.startsWith('save ')) { return false; }
    const path = answer.slice(5).trim();
    if (!path) { console.log('Name a save path.'); return true; }
    await writeFile(path, JSON.stringify(session.checkpoint(), null, 2));
    console.log(`Saved ${path}.`);
    return true;
  }
  // One act, its fight the player's; false if the player left the game in a fight.
  private static async act(session: PlaySession, choice: Listed, turn: Turn, input: TerminalInput): Promise<boolean> {
    const before = PlayerView.observe(session.campaign);
    const does = PlayerView.choices(session.campaign).find(r => r.choice.id === choice.id)?.action.schema;
    try {
      const event = await session.leg(choice.id, async battle => {
        const command = await Terminal.command(battle.state, battle.legalCommands(), input);
        if (!command) { throw new Error(quitPlay); }
        return command;
      });
      if (choice.id.startsWith('travel:')) { this.journey(session); }
      const after = PlayerView.observe(session.campaign);
      const feedback = ActionFeedbackView.read(session.campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      const turned = turn.current?.leaf.glance?.acts.find(a => (a.command ?? a.choice) === choice.id);
      turn.talking = moved || does === 'take_leave' ? undefined
        : does === 'talk_to' && choice.targets?.[0] ? { id: choice.targets[0], inside: turned?.inside } : turn.talking;
      turn.told = { event, feedback, said: choice.name, moved };
      turn.current = undefined;
    } catch (error) {
      if (error instanceof Error && error.message === quitPlay) { return false; }
      console.log(`! ${error instanceof Error ? error.message : String(error)}`);
    }
    return true;
  }
  // Compatibility for the legacy `campaign` command; new play uses a session checkpoint end to end.
  static playCampaign(campaign: Campaign) { return this.play(PlaySession.fromSave(campaign.save(), 'campaign')); }
}
