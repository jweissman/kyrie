import { TerminalInput, type Asking, type Picking } from './terminal-input';
import { TerminalFight } from './terminal-fight';
import { TerminalMenus } from './terminal-menus';
import { TerminalScene } from './terminal-scene';
import { TerminalColour } from './terminal-colour';
import { TerminalSigns, type Signed } from './terminal-signs';
import { Stopwatch } from '../stopwatch';
import { Emphasis } from '../presentation/emphasis';
import { Typography } from '../presentation/typography';
import { writeFile } from 'node:fs/promises';
import { Campaign } from '../campaign/campaign';
import { Battle } from '../battle';
import { ActionTime } from '../campaign/action-time';
import type { BattleState, Command } from '../model';
import { Tactics } from '../tactics'; import { Foregone } from '../ui/foregone';
import { CombatTelling } from '../ui/combat-telling';
import { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ScreenModel } from '../ui/screen-model';
import { Narrator, type Told } from '../presentation/narrator';
import { ActionFeedbackView } from '../presentation/action-feedback';
import type { Screen } from '../ui/screen-types';
import { Undertakings } from '../presentation/undertakings';
import { SceneModel } from '../ui/scene';
import { Attending } from '../ui/attention';
import { LandCrossing } from '../ui/land-crossing';
import type { Choice } from '../ui/choice-list';
import type { Aspect, Glance, Lens, Promoted, Successor } from '../presentation/glance-types';

const quitPlay = 'The player left the encounter.';
// A choice as the terminal lists it, and what the page draws on it in words.
// journey: set out on over the map (a journey to a place known, a crossing of the country), not a way from here.
interface Listed { id: string; name: string; time: number; targets?: string[]; aspects?: Aspect[]; signed?: Signed;
  journey?: true }
// What a turn offers: every act, the few led with (or said to whoever is spoken with), and the lens they come through.
// rest: where the few are a surface's own (a lens, a talk), the rest of its own, as the page's All or Something
// else… has them.
interface Offered { all: Listed[]; first: Listed[]; talk?: boolean; more?: number; rest?: Listed[];
  lens?: { name: Lens; more: number } }
// Whom the company is speaking with (and what the likeness turned to was drawn for), what was last told, the scene.
interface Talking { id: string; inside: Promoted['inside'] }
interface Turn {
  told?: Told; current?: { screen: Screen; leaf: ReturnType<typeof Narrator.leaf> }; talking?: Talking;
  scene?: TerminalScene; helped?: boolean; attended?: boolean; profile?: { world?: number }; lens?: Lens;
  // The row the human mode's focus was on, kept while nothing is done (a lens, the map), let go once something is.
  focus?: string;
  // Whether the line between what was told and the picker has been given since the scene was told.
  spaced?: boolean;
}

// A text client over the same public projection and command path as the browser. It decides layout and input only:
// PlayerView decides what is legal, ScreenModel/Narrator what the player knows, and PlaySession performs every act.
export class Terminal {
  static readonly commands = 'Commands: a number · things · people · places · time · here · all · look · map · character'
    + ' · aims · follow <n> · save <path> · q';
  static readonly lenses = new Set(['things', 'people', 'places', 'time', 'here']);
  // A fight's turn, as TerminalFight takes it (typed, or picked in the human mode).
  static command(state: BattleState, legal: Command[], input: Asking): Promise<Command | null> {
    return TerminalFight.command(state, legal, input);
  }
  static async battle(battle: Battle, input: Asking): Promise<Command[] | null> {
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
      CombatTelling.exchanges(events, battle.state).forEach(t => console.log(t.text));
    }
    console.log(`Encounter: ${battle.state.outcome ?? 'active'}`);
    return commands;
  }
  // whole: looked at deliberately, with what the glance leaves out (Narrator's held: three sentences at a glance).
  // Coming somewhere (or first), the place briefly; after an act, what came of it; looked at, the place whole (see
  // TerminalScene: what has not changed is not said again).
  private static scene(session: PlaySession, turn: Turn, whole = false) {
    const began = performance.now();
    const screen = ScreenModel.build(session.campaign), leaf = Narrator.leaf(session.campaign, screen, turn.told);
    // Following an aim or letting it go changes what is led with, not where the company is (attended).
    const turned = whole ? 'look' : turn.attended ? 'act' : !turn.told || turn.told.moved ? 'arrive' : 'act';
    turn.attended = false;
    for (const line of (turn.scene ??= new TerminalScene()).lines(screen, leaf, turned)) { console.log(line); }
    if (turn.profile) {
      const world = turn.profile.world === undefined ? '' : `the world ${Stopwatch.seconds(turn.profile.world)} · `;
      console.log(`  (${world}the telling ${Stopwatch.seconds(performance.now() - began)})`);
      turn.profile.world = undefined;
    }
    return { screen, leaf };
  }
  private static foreground(session: PlaySession, glance: ReturnType<typeof Narrator.leaf>['glance'], screen: Screen,
    at: { talking?: Talking; lens?: Lens } = {}): Offered {
    const { talking, lens } = at;
    // Each choice's minutes, as the page says them (ActionTime.minutes), not its ticks: "Bury him · 1 min" had taken
    // two hours, a way into the next stretch of country listed in minutes took ninety (cold review A, 12 November).
    const world = session.campaign.world;
    const minutes = new Map(PlayerView.choices(session.campaign)
      .map(r => [r.choice.id, ActionTime.minutes(r.action, world)]));
    const all: (ReturnType<typeof PlayerView.observe>['choices'][number] & { journey?: true })[] = PlayerView
      .observe(session.campaign).choices.map(c => ({ ...c, time: minutes.get(c.id) ?? c.time * 10 }));
    for (const d of [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]) {
      const id = `travel:${d.id}`;
      if (!all.some(c => c.id === id)) {
        all.push({ id, name: `Set out for ${d.name}`, time: d.minutes, encounter: false,
          category: 'travel', targets: [d.id], journey: true });
      }
    }
    // And across the country to a place the map shows, as the engine allows it (LandCrossing), as the page's map does.
    for (const x of LandCrossing.offers(screen).filter(o => !all.some(c => c.id === o.command))) {
      all.push({ id: x.command, name: `Go across country to ${x.name}`, time: 0, encounter: false, category: 'travel',
        targets: [x.id], journey: true });
    }
    // A way into the next stretch of country led with is set out on as a journey there (travel:, see HexBoundary),
    // as the page's map does: the gold "To the road between Mistshaw and Millholm" had been dropped from the
    // terminal's foreground, which knew no such id (M21's playability investigation).
    const next = glance?.next?.command ? [{ command: glance.next.command, label: glance.next.label ?? '' }] : [];
    for (const a of [...glance?.acts ?? [], ...next]) {
      if (a.command?.startsWith('travel:') && !all.some(c => c.id === a.command)) {
        all.push({ id: a.command, name: a.label, time: 0, encounter: false, category: 'travel',
          targets: [a.command.slice('travel:'.length)], journey: true });
      }
    }
    const signs = new TerminalSigns(screen, glance);
    // What each of the rest is to the company, as the glance's offer says it (Offers.scene): the rest unfolded carries
    // the same indicator as the four (TP-02).
    const rest = new Map((glance?.offer?.rest ?? []).map(o => [o.command ?? o.choice, o.aspects]));
    for (const c of all) {
      const aspects = rest.get(c.id);
      Object.assign(c, { signed: signs.on(c.id), ...aspects?.length ? { aspects } : {} });
    }
    const byId = new Map(all.map(c => [c.id, c]));
    // What the page leads with inside a talk (the question the aim waits on, Promoted.inside) is offered as itself:
    // "Talk to Odo" had led the terminal's foreground, and "Ask Odo about the road your father took" was only under
    // `all`, eight times in one cold review (12 November); the page shows it as the talk's own line.
    const ids = Terminal.led(glance, screen);
    // Inside a talk, each reply drawn as the likeness turned to was drawn for it (see Promoted.inside; E185).
    const acts = [...glance?.acts ?? [], ...talking ? [{ inside: talking.inside } as Promoted] : []];
    // While someone is spoken with, what can be put to them, as the page's conversation lists it (Attending.talk):
    // "Talk to the wagoner" had been drawn blue, and opened onto nothing to ask him (M21's playability investigation).
    const talk = talking && Attending.talk(SceneModel.build(screen), talking.id);
    // Four at most, as everywhere: the replies the talk leads with, and leaving it always among them.
    if (talk) {
      const asked = talk.replies.flatMap(c => this.leaves(c)).flatMap(c => byId.get(c.command!) ?? []);
      const leave = this.leaves(talk.leave).flatMap(c => byId.get(c.command!) ?? []);
      const shown = asked.slice(0, 4 - leave.length), more = asked.length - shown.length;
      if (shown.length || leave.length) {
        return { all, first: [...shown, ...leave].map(c => this.drawn(acts, c)), talk: true, ...more ? { more } : {},
          rest: asked.slice(shown.length).map(c => this.drawn(acts, c)) };
      }
    }
    // Through a lens, its own few, ranked as the scene's are, from the same acts (Glance.lenses): attention, not time.
    const lensed = lens && glance?.lenses[lens];
    const chosen = lensed ? lensed.promoted.map(a => a.command ?? a.choice) : [...new Set(ids)];
    const first = chosen.flatMap(id => byId.get(id) ?? []).slice(0, 4);
    const more = lensed ? lensed.promoted.length + lensed.rest.length - first.length : 0;
    const shown = (first.length || lensed ? first : all.slice(0, 4)).map(c => this.drawn(acts, c));
    const after = lensed ? lensed.rest.flatMap(a => byId.get(a.command ?? a.choice) ?? []) : [];
    return { all, first: shown,
      ...lensed ? { lens: { name: lens, more }, rest: after } : { more: all.length - shown.length } };
  }
  // As an aim is seen through, what pulls next (see Succession, PL-06): offered, as the choice to type or the aim to
  // follow, never followed for the player.
  private static next(next: Successor | undefined, screen: Screen, { all, human }: { all: Listed[]; human: boolean }) {
    if (!next) { return; }
    const n = (screen.aims ?? []).findIndex(a => a.id === next.aim) + 1;
    const typed = all.find(c => c.id === next.command)?.name ?? next.label;
    console.log(`\nNext: ${Typography.plain(next.text)}${next.at ? ` (${next.at})` : ''}`
      + `${next.aim ? human ? ' · a to follow' : ` · follow ${n}` : typed ? ` · ${Typography.plain(typed)}` : ''}`);
  }
  // Where the rest lies: each lens by how many it holds, as the page's rail opens them; the journeys the page puts on
  // its map (49 in a1's first scene, 42 of them set-outs to places known, had been one list under `all`); and `all`.
  private static more(glance: Glance | undefined, all: Listed[], n: number): string {
    const lenses = Object.entries(glance?.lenses ?? {}).map(([name, l]) => `${name} ${l.promoted.length + l.rest.length}`)
      .filter(said => !said.endsWith(' 0'));
    const journeys = all.filter(c => c.id.startsWith('travel:')).length;
    return `(more: ${[...lenses, ...journeys ? [`map ${journeys}`] : [], `all ${n}`].join(' · ')})`;
  }
  // What the page leads with, by the command each is done by: the scene's four (Glance.offer, the same four the page
  // draws: TB-01, TB-02), an opener by the act within it that it is led for (the question the aim waits on), a way by
  // its exit's command. A way in once gone through (Ísencepan's gate) had dropped from the foreground (PL-26).
  static led(glance: Glance | undefined, screen: Screen): string[] {
    const acts = new Map((glance?.acts ?? []).map(a => [a.choice, a]));
    return (glance?.offer?.primary ?? []).map(o => {
      const a = acts.get(o.choice);
      return a?.inside?.[0]?.command ?? a?.command ?? o.command ?? this.way(screen, o.choice);
    });
  }
  private static way(screen: Screen, id: string): string {
    return screen.exits.find(e => e.id === id)?.acts.find(a => a.command)?.command ?? id;
  }
  // What the page draws on a choice, by the page's own reading (Emphasis): what it is within what the glance leads
  // with, and gold only on the followed aim's next step (Promoted.continues). A headless player had seen no gold and no
  // pip, and could neither follow an aim nor tell what a mark promised (M21's playability investigation).
  private static drawn<T extends { id: string }>(acts: Promoted[], c: T): T & { aspects?: Aspect[] } {
    const act = acts.find(a => (a.command ?? a.choice) === c.id);
    const next = !!act?.continues || acts.some(a => a.continues && a.for === c.id);
    const aspects = Emphasis.drawn(Emphasis.within(acts, { command: c.id } as Choice, act?.aspects ?? []), next);
    return aspects.length ? { ...c, aspects } : c;
  }
  private static leaves(c: Choice): Choice[] {
    return c.children?.length ? c.children.flatMap(k => this.leaves(k)) : c.command ? [c] : [];
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
  // Each choice, numbered, its tones at its left edge (or said, without colour: TerminalColour).
  private static choices(rows: Listed[]) {
    const depth = TerminalColour.depth();
    rows.forEach((c, i) => console.log(TerminalColour.choice(i + 1,
      `${Typography.plain(c.name)}${c.time ? ` · ${c.time} min` : ''}`, { ...c.signed, aspects: c.aspects ?? [] }, depth)));
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
  // The places known; and, typed, the journeys and crossings in a line each (the human mode picks among them).
  private static map(session: PlaySession, journeys = true) {
    const screen = ScreenModel.build(session.campaign);
    console.log(`\nMap — ${screen.place.name}`);
    for (const p of screen.map) { console.log(`${p.here ? '*' : p.visited ? '·' : '?'} ${p.name}${p.zone ? ` — ${p.zone}` : ''}`); }
    if (!journeys) { return; }
    const destinations = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []];
    if (destinations.length) { console.log(`Journeys: ${destinations.map(d => d.name).join(' · ')}`); }
    const across = LandCrossing.offers(screen);
    if (across.length) { console.log(`Across country: ${across.map(x => x.name).join(' · ')}`); }
  }
  private static dossier(session: PlaySession) {
    const screen = ScreenModel.build(session.campaign);
    for (const m of screen.party) {
      // Who they are first, as the page draws it (people and calling), then the level and what they were before: an
      // elf thief had been "level 1, Drifter", a mage "Trader" (round 12, B; M21's cold mage).
      console.log(`\n${m.name} — ${m.line}, level ${m.level}${m.background ? ` · ${m.background}` : ''}`);
      console.log(`HP ${m.hp}/${m.maxHp} · mana ${m.mana}/${m.maxMana} · XP ${m.experience}`);
      console.log(Object.entries(m.attributes).map(([k, v]) => `${k} ${v}`).join(' · '));
      if (m.conditions.length || m.boons?.length) { console.log(`Conditions: ${[...m.conditions, ...m.boons ?? []].join(', ')}`); }
      if (m.spells?.length) { console.log(`Spells: ${m.spells.map(s => `${s.name}${s.ready ? '' : ' (spent)'}`).join(', ')}`); }
    }
    console.log(`Coin ${screen.purse.coin} · rations ${screen.purse.rations}`);
  }
  // A walk passes its own input and scene, to answer as a player would and read what was told (TerminalWalk); with
  // profile, each act says what it took: the world's turn and the telling of it.
  static async play(session: PlaySession, o: { input?: Asking; scene?: TerminalScene; profile?: boolean } = {}) {
    const input = o.input ?? TerminalInput.open(), human = TerminalInput.picks(input);
    // The human mode shows the instruments that bear on the moment in its picker, each to be read on asking.
    const scene = o.scene ?? new TerminalScene(TerminalColour.depth(), { instruments: !human, picked: human });
    const turn: Turn = { scene, ...o.profile ? { profile: {} } : {} };
    try {
      while (session.campaign.running) {
        if (!turn.current) { turn.current = this.scene(session, turn); turn.spaced = false; }
        const { screen, leaf } = turn.current;
        const offered = this.foreground(session, leaf.glance, screen, { talking: turn.talking, lens: turn.lens });
        if (turn.talking && !offered.talk) { turn.talking = undefined; }
        this.next(leaf.glance?.next, screen, { all: offered.all, human });
        const answer = human ? await this.picked(input, offered, { turn, session })
          : await this.typed(input, offered, turn);
        if (answer === null) { return; }
        if (typeof answer === 'string' && await this.aside(session, answer, offered.all, { turn, input })) { continue; }
        const choice = typeof answer === 'string' ? this.chosen(offered, answer) : answer;
        if (!choice) {
          console.log('Choose a number, or type a choice as it is written (all lists every one; ? the commands).');
          continue;
        }
        turn.focus = undefined;
        if (!await this.act(session, choice, turn, input)) { return; }
      }
      this.scene(session, turn);
      console.log('The story has ended.');
    } finally { input.close(); }
  }
  // Headless: the choices as numbered lines, where the rest lies, and the answer typed; null to leave.
  private static async typed(input: Asking, offered: Offered, turn: Turn): Promise<string | null> {
    const glance = turn.current?.leaf.glance;
    console.log('');
    if (offered.lens) { console.log(`(${offered.lens.name}${offered.lens.more ? ` · ${offered.lens.more} more: all` : ''})`); }
    this.choices(offered.first);
    if (offered.more) { console.log(this.more(glance, offered.all, offered.more)); }
    // The commands when asked, and a word of where they are once: a line said the same after every act, and a
    // heading over the choices, are static context (the owner, 14 November: TM-02).
    if (!turn.helped) { console.log('(? for commands)'); turn.helped = true; }
    let answer = await input.ask('> ');
    while (answer === '') { answer = await input.ask('> '); }
    return answer === null || answer === 'q' || answer === 'quit' ? null : answer;
  }
  // The human mode: the same four and every legal act behind More, picked (TerminalMenus); a choice by its id, or a
  // command (a lens, the map) as it would have been typed.
  private static async picked(input: Picking, offered: Offered, { turn, session }: { turn: Turn; session: PlaySession })
    : Promise<Listed | string | null> {
    if (!turn.spaced) { console.log(''); turn.spaced = true; }
    const picked = await input.pick(TerminalMenus.scene({ first: offered.first,
      all: offered.rest ? [...offered.first, ...offered.rest] : offered.all,
      ...offered.lens ? { lens: offered.lens.name } : {}, instruments: turn.current?.leaf.instruments,
      ...turn.talking ? { with: this.whom(turn.current?.screen, turn.talking.id) } : {},
      ...turn.focus ? { focus: turn.focus } : {} }));
    if (!picked) { return null; }
    if ('command' in picked) {
      turn.focus = picked.focus;
      return picked.command === 'map' ? this.journeys(input, offered, session) : picked.command;
    }
    return offered.all.find(c => c.id === picked.choice) ?? picked.choice;
  }
  // The map in the human mode: the places known, and the journeys and crossings it offers picked among, as the page's
  // map sets out on them (the owner: the map is the basic navigation). Back, and nothing is done.
  private static async journeys(input: Picking, offered: Offered, session: PlaySession)
    : Promise<Listed | string | null> {
    this.map(session, false);
    const ways = offered.all.filter(c => c.journey);
    if (!ways.length) { console.log('No journey is known from here.'); return 'here'; }
    const picked = await input.pick({ title: 'Where to?', rows: ways.map(c => TerminalMenus.row(c)), back: 'here' });
    if (!picked) { return null; }
    return 'command' in picked ? 'here' : ways.find(c => c.id === picked.choice) ?? 'here';
  }
  // Whom the company is speaking with, by the name the screen gives them.
  private static whom(screen: Screen | undefined, id: string): string | undefined {
    return screen && SceneModel.build(screen).subjects.find(x => x.id === id)?.name;
  }
  // A choice typed: by its number among those led with, by its id, or by its words as printed.
  private static chosen(offered: Offered, answer: string): Listed | undefined {
    const numbered = Number(answer) - 1;
    return numbered >= 0 && numbered < offered.first.length ? offered.first[numbered]
      : offered.all.find(c => c.id === answer || Terminal.same(c.name, answer));
  }
  // What is not an act in the story: looking again, the map, the sheet, the aims, the whole list, a save.
  private static async aside(session: PlaySession, answer: string, all: Listed[],
    { turn, input }: { turn: Turn; input: Asking }): Promise<boolean> {
    if (answer === 'look') { turn.told = undefined; turn.current = this.scene(session, turn, true); return true; }
    if (answer === 'help' || answer === '?') { console.log(Terminal.commands); return true; }
    // A lens: what is led with, by kind (things, people, places, time); here, the scene's own. It takes no time.
    if (Terminal.lenses.has(answer)) { turn.lens = answer === 'here' ? undefined : answer as Lens; return true; }
    if (answer === 'map') { this.map(session); return true; }
    if (answer === 'character' || answer === 'dossier') { this.dossier(session); turn.spaced = false; return true; }
    if (answer === 'aims' && TerminalInput.picks(input)) {
      return this.aside(session, await this.aim(session, input), all, { turn, input });
    }
    if (answer === 'aims') { this.aims(session, answer); return true; }
    if (/^(follow \d+|unfollow)$/.test(answer)) {
      this.aims(session, answer); turn.current = undefined; turn.told = undefined; turn.attended = true; return true;
    }
    if (answer === 'all' || answer === 'more') { console.log('\nAll legal interactions'); this.choices(all); return true; }
    if (answer === 'save' && TerminalInput.picks(input)) {
      return this.aside(session, `save ${await input.ask('Save to (a path): ') ?? ''}`, all, { turn, input });
    }
    if (!answer.startsWith('save ')) { return false; }
    const path = answer.slice(5).trim();
    if (!path) { console.log('Name a save path.'); return true; }
    await writeFile(path, JSON.stringify(session.checkpoint(), null, 2));
    console.log(`Saved ${path}.`);
    return true;
  }
  // An aim picked to follow, or the one followed let go, as the Notes do (the human mode's aims).
  private static async aim(session: PlaySession, input: Picking): Promise<string> {
    const aims = ScreenModel.build(session.campaign).aims ?? [];
    if (!aims.length) { console.log('No aim is held.'); return 'here'; }
    const picked = await input.pick(TerminalMenus.aims(aims));
    return picked && 'choice' in picked ? picked.choice : 'here';
  }
  // One act, its fight the player's; false if the player left the game in a fight.
  private static async act(session: PlaySession, choice: Listed, turn: Turn, input: Asking): Promise<boolean> {
    const before = PlayerView.observe(session.campaign);
    const does = PlayerView.choices(session.campaign).find(r => r.choice.id === choice.id)?.action.schema;
    try {
      const began = performance.now();
      // A foregone fight is one act, fought through by the company's tactics unless it turns, as the page's host
      // fights it (see Foregone; BP-01).
      let pressing = Foregone.is(turn.current?.screen, choice.id);
      // What came of each exchange since the company's last turn, told before it chooses again, as the page's fight
      // tells it (CombatTelling): only the hurts had shown between turns, the blows told after the fight.
      const told = new Map<Battle, number>();
      const event = await session.leg(choice.id, async battle => {
        const ours = battle.state.combatants.filter(f => f.team === 'fighters');
        pressing &&= ours.every(f => f.hp > f.maxHp / 3);
        if (pressing) { return Tactics.choose(battle.state, battle.plain(battle.legalCommands())); }
        const events = battle.events;
        CombatTelling.exchanges(events.slice(told.get(battle) ?? events.length), battle.state)
          .forEach(t => console.log(t.text));
        told.set(battle, events.length);
        const command = await Terminal.command(battle.state, battle.legalCommands(), input);
        if (!command) { throw new Error(quitPlay); }
        return command;
      });
      if (turn.profile) { turn.profile.world = performance.now() - began; }
      if (choice.id.startsWith('travel:')) { this.journey(session); }
      const after = PlayerView.observe(session.campaign);
      const feedback = ActionFeedbackView.read(session.campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      const turned = turn.current?.leaf.glance?.acts.find(a => (a.command ?? a.choice) === choice.id);
      turn.talking = moved || does === 'take_leave' ? undefined
        : does === 'talk_to' && choice.targets?.[0] ? { id: choice.targets[0], inside: turned?.inside } : turn.talking;
      turn.told = { event, feedback, said: choice.name, moved };
      if (moved) { turn.lens = undefined; }
      turn.current = undefined;
    } catch (error) {
      if (error instanceof Error && error.message === quitPlay) { return false; }
      console.log(`! ${error instanceof Error ? error.message : String(error)}`);
    }
    return true;
  }
  // Compatibility for the legacy `campaign` command; new play uses a session checkpoint end to end.
  static playCampaign(campaign: Campaign, input?: Asking) {
    return this.play(PlaySession.fromSave(campaign.save(), 'campaign'), input ? { input } : {});
  }
}
