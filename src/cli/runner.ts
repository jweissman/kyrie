import { appendFile } from 'node:fs/promises';
import type { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { Narrator, type Told } from '../presentation/narrator';
import type { Lens, Promoted, Successor } from '../presentation/glance-types';
import { Offers, type ActType, type Bearing, type Offer, type Offered as Glanced } from '../presentation/offer';
import { ScreenModel } from '../ui/screen-model';
import type { Act, Screen } from '../ui/screen-types';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { Undertakings } from '../presentation/undertakings';
import { Promises } from '../presentation/promises';
import { TerminalScene, type Turned } from './terminal-scene';
import { PlayTool } from './play-tool';
import { TerminalWalk, type Presented } from './terminal-walk';
import { RunnerFight } from './runner-fight';
import { RunnerCreation } from './runner-creation';
import { RunnerLines } from './runner-lines';
import { RunnerAmid } from './runner-amid';
import { RunnerPayoff } from './runner-payoff';
import type { CampaignEvent } from '../campaign/campaign-types';

// One choice as the runner offers it: its id is the command that does it, the real choice id (PlayerView), so that an
// agent acts on what the page and the terminal would have it act on.
export interface Offered { id: string; label: string; aspects: string[]; type: ActType; minutes?: number;
  marks: string[]; bearing?: Bearing }
// What the runner says on each turn: how it was come to (arriving somewhere, what came of an act, or looked at on
// purpose), the scene's lines as the terminal tells them, the four led with and the rest, the aim and what is needed.
// scene.prose: of its lines, the narration alone (not the heading nor the aim and what is needed), as the scene
// budget counts it (TerminalWalk).
export interface Said { turn: number; moment: 'arrive' | 'outcome' | 'inspect' | 'fight';
  scene: { lines: string[]; prose: string[] };
  offer: { primary: Offered[]; rest: Offered[] }; aim?: string; aims?: Aim[]; need?: string[]; next?: Next;
  amid?: true; broken?: string[]; end?: true;
  // Instruments (the experience measures): where the company stands, what the act just done changed beyond time and
  // position, and, come back where a bond was made or a fact learned, how much of it still holds.
  at?: string; changed?: string[]; kept?: { held: number; of: number } }
// What pulls once an aim is seen through (Succession): its words, and the act that takes it up, or the aim to follow.
export interface Next { text: string; act?: string; label?: string; follow?: string }
// An aim held, as the Notes list it: following one (as Follow this does) takes no time.
export interface Aim { id: string; text: string; followed?: true }
// What an agent may send: an act by its id, a lens to look through, the place looked at whole, every choice, or an aim
// to follow (none, to follow none).
export type Asked = { act: string } | { lens: Lens } | { look: true } | { more: true } | { follow: string | null };

// A runner for agents playing blind (the owner, 14 November: TB-05): the terminal's own projection (the leaf, the
// glance, the terminal's scene) as JSON lines, one per turn, and acts taken by their real ids. Nothing of the world is
// given that the page and the terminal do not give; nothing is simulated apart. Errors are said, not thrown: an act
// that is not offered, a line that is not JSON.
//   bin/kyrie run --world a1 --origin debt --as human/warrior/Brann [--transcript out.jsonl]
export class Runner {
  private n = 0;
  private told?: Told;
  private readonly payoff = new RunnerPayoff();
  private readonly scene = new TerminalScene();
  private readonly fight = new RunnerFight();
  private doing?: { act: string; before: ReturnType<typeof PlayerView.observe>; leg: Promise<CampaignEvent> };
  constructor(readonly session: PlaySession) {}
  // Every presentation said so far, as a terminal walk keeps them, for the scene budget (TerminalWalk.budget).
  get scenes(): Presented[] { return this.scene.told.map(t => ({ ...t, sentences: TerminalWalk.count(t.lines) })); }
  private get campaign() { return this.session.campaign; }
  // The turn as it stands: arriving (the first, and after a move), or what came of the last act.
  said(turned: Turned = !this.told || this.told.moved ? 'arrive' : 'act'): Said {
    const c = this.campaign, screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen, this.told);
    const lines = this.scene.lines(screen, leaf, turned).filter(l => l.trim());
    const g = leaf.glance, aim = AimSaid.of(screen, g?.aim);
    return { turn: this.n, moment: turned === 'arrive' ? 'arrive' : turned === 'act' ? 'outcome' : 'inspect',
      scene: { lines, prose: this.scene.told.at(-1)?.lines ?? [] }, offer: this.offer(screen, g?.offer, g?.acts),
      ...aim ? { aim: Typography.plain(aim.text) } : {}, ...screen.aims?.length ? { aims: screen.aims.map(a => ({
        id: a.id, text: Typography.plain(a.text), ...a.followed ? { followed: true as const } : {} })) } : {},
      ...g?.need?.length ? { need: g.need } : {}, ...g?.next ? { next: Runner.next(g.next) } : {},
      ...RunnerAmid.of(c, screen) ? { amid: true as const } : {}, ...this.instruments(screen, turned),
      ...Runner.promised(screen), ...c.running ? {} : { end: true } };
  }
  private instruments(screen: Screen, turned: Turned): Pick<Said, 'at' | 'changed' | 'kept'> {
    const changed = this.told && turned !== 'look' ? RunnerPayoff.changed(this.told.event, this.told.said) : [];
    const kept = this.told?.moved && turned === 'arrive' ? this.payoff.back(this.campaign, screen.place.id) : undefined;
    return { at: screen.place.id, ...changed.length ? { changed } : {}, ...kept ? { kept } : {} };
  }
  // The glance's own offer (Offers.scene): its four and its rest, each by the command that does it.
  // An opener the glance leads for an act within it (asking Wenna to come along) is that act, as the page and the
  // terminal lead with it (TB-01, test/small/one-projection): the walkers had spent a turn opening the talk.
  private offer(screen: Screen, offer: Offer | undefined, acts: Promoted[] = []): Said['offer'] {
    // Only what can be done by its id: a choice the page draws by a key of its own that names no command is left out.
    const names = this.names();
    const primary = Runner.doable(screen, names, Runner.within(offer?.primary ?? [], acts));
    const rest = Runner.doable(screen, names, offer?.rest ?? []);
    const had = new Set([...primary, ...rest].map(o => o.id));
    // A journey the map offers and the scene does not (the terminal sets out by them too).
    const journeys = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]
      .filter(d => !had.has(`travel:${d.id}`)).map(d => ({ id: `travel:${d.id}`, label: `Set out for ${d.name}`,
        aspects: [], type: 'journey' as const, minutes: d.minutes, marks: [] }));
    return { primary, rest: [...rest, ...journeys] };
  }
  // Each by what it does: an opener led for something within it (a question the aim waits on, a bed for the night) by
  // that, and called as that is (the terminal's "Ask Wat about Father"). Done by its own command, "Talk to Eamon", led
  // for what he knew of the country round, had taken a bed at his inn, nine nights running (TB-04).
  private static within(list: Glanced[], acts: Promoted[]): Glanced[] {
    const inside = new Map(acts.flatMap(a => a.inside?.[0] ? [[a.choice, a.inside[0].command]] : []));
    return list.map(o => o.for || !inside.has(o.choice) ? o : { ...o, for: inside.get(o.choice) });
  }
  private static choice(screen: Screen, names: Map<string, string>, o: Glanced): Offered {
    // A thing looked at is called by what is done to it ("Take a steel coin"), not by its name alone.
    const named = o.for && names.get(o.for), id = Runner.way(screen, (named && o.for) || (o.command ?? o.choice));
    const own = !named && (/#look$/.test(o.choice) || Runner.opener(screen, o.choice)) ? names.get(id) : undefined;
    return { id, label: Typography.plain(named || own || o.label), aspects: o.aspects, type: o.type,
      ...o.minutes ? { minutes: o.minutes } : {}, marks: o.marks.map(m => m.kind),
      ...o.bearing ? { bearing: o.bearing } : {} };
  }
  private static doable(screen: Screen, names: Map<string, string>, list: Glanced[]): Offered[] {
    return list.map(o => Runner.choice(screen, names, o)).filter(o => names.has(o.id) || o.id.startsWith('travel:'));
  }
  private static next(n: Successor): Next {
    return { text: Typography.plain(n.text), ...n.command ? { act: n.command } : {},
      ...n.label ? { label: Typography.plain(n.label) } : {}, ...n.aim ? { follow: n.aim } : {} };
  }
  // What the screen shows and the game does not keep (Promises.broken, CO-15): a Gate 1 blocker, said with the turn.
  private static promised(screen: Screen): { broken?: string[] } {
    const broken = Promises.broken(screen);
    return broken.length ? { broken } : {};
  }
  // Every choice's words, by its id.
  private names(): Map<string, string> {
    return new Map(PlayerView.choices(this.campaign).map(r => [r.choice.id, r.choice.name]));
  }
  // A way led with is done by its exit's own command.
  // So with an act the page draws by its own key (a word at a way: "Look at the speaking door"), by the command it
  // does, or the look within it, else the first: offered by its key, it had been taken as a command and failed (the
  // matrix, a1's order).
  private static way(screen: Screen, id: string): string {
    const exit = screen.exits.find(e => e.id === id)?.acts.find(a => a.command)?.command;
    if (exit) { return exit; }
    const keyed = Runner.keyed([...screen.exits, ...screen.people, ...screen.things].flatMap(r => r.acts), id);
    const look = keyed?.children?.find(a => a.does === 'look_closely' && a.command)?.command;
    return keyed ? keyed.command ?? look ?? Runner.first(keyed.children ?? []) ?? id : id;
  }
  private static keyed(acts: Act[], key: string): Act | undefined {
    for (const a of acts) {
      const found = a.key === key ? a : Runner.keyed(a.children ?? [], key);
      if (found) { return found; }
    }
    return undefined;
  }
  // A choice the page opens (a look at a thing on a way, with its tries under it) and the runner does by the first act
  // within: called by that act, not the opener ("Push and pull at the corn-store padlock", which it does, where it had
  // said "look at the corn-store padlock": the promise-fidelity walk, 14 November).
  private static opener(screen: Screen, choice: string): boolean {
    const key = choice.slice(choice.indexOf('/') + 1);
    const act = Runner.keyed([...screen.exits, ...screen.people, ...screen.things].flatMap(r => r.acts), key);
    return !!act && !act.command && !!act.children?.length && !act.children.some(a => a.does === 'look_closely');
  }
  private static first(acts: Act[]): string | undefined {
    for (const a of acts) {
      const command = a.command ?? Runner.first(a.children ?? []);
      if (command) { return command; }
    }
    return undefined;
  }
  // A line from an agent, answered by what the turn then says, or an error.
  async ask(line: string): Promise<Said | { error: string }> {
    let asked: Asked;
    try { asked = JSON.parse(line) as Asked; } catch { return { error: `not JSON: ${line}` }; }
    if ('look' in asked) { return this.said('look'); }
    if ('lens' in asked) { return this.lensed(asked.lens); }
    if ('more' in asked) { return this.said(); }
    if ('follow' in asked) { return this.follow(asked.follow); }
    if (!('act' in asked) || typeof asked.act !== 'string') { return { error: `nothing asked: ${line}` }; }
    if (this.fight.fighting) {
      return this.fight.choose(asked.act) ? this.went() : { error: `not offered in the fight: ${asked.act}` };
    }
    const screen = ScreenModel.build(this.campaign);
    const g = Narrator.leaf(this.campaign, screen, this.told).glance, o = this.offer(screen, g?.offer, g?.acts);
    // What pulls next is offered too, by its own act.
    const offered = [...o.primary, ...o.rest].map(x => x.id).concat(g?.next?.command ?? []);
    if (!offered.includes(asked.act)) { return { error: `not offered: ${asked.act}` }; }
    this.doing = { act: asked.act, before: PlayerView.observe(this.campaign),
      leg: this.session.leg(asked.act, this.fight.controller) };
    return this.went();
  }
  // The act going on: its next turn of a fight, if one began, else what came of it.
  private async went(): Promise<Said | { error: string }> {
    const doing = this.doing!;
    let out: Awaited<ReturnType<RunnerFight['next']>>;
    try { out = await this.fight.next(doing.leg); }
    catch (e) {
      this.doing = undefined;
      return { error: `could not be done: ${doing.act}: ${e instanceof Error ? e.message : String(e)}` };
    }
    if ('turn' in out) {
      return { turn: this.n, moment: 'fight', scene: { lines: this.fight.lines(), prose: [] }, offer: this.fight.offer() };
    }
    const event = out.done as CampaignEvent, before = doing.before;
    this.doing = undefined;
    const moved = before.location?.id !== this.campaign.world.one('at', this.campaign.playerActor ?? 'party');
    const feedback = this.fight.closed(ActionFeedbackView.read(this.campaign, event, before));
    this.told = { event, feedback, said: doing.act, moved };
    if (before.location?.id) { this.payoff.note(before.location.id, RunnerPayoff.changed(event, doing.act)); }
    this.n++;
    return this.said();
  }
  // An aim followed, or none: no world act, no time.
  private follow(id: string | null): Said | { error: string } {
    const aims = ScreenModel.build(this.campaign).aims ?? [];
    if (id !== null && !aims.some(a => a.id === id)) { return { error: `no aim: ${id}` }; }
    Undertakings.follow(this.campaign, id ?? undefined);
    return this.said('look');
  }
  // A lens looked through: no world act, no time; its acts as the offer, each as the scene offers it (Offers ranks a
  // lens as it ranks any surface of its own).
  private lensed(lens: Lens): Said | { error: string } {
    const c = this.campaign, screen = ScreenModel.build(c), g = Narrator.leaf(c, screen, this.told).glance;
    const l = g?.lenses[lens];
    if (!l) { return { error: `no lens: ${String(lens)}` }; }
    const all = [...g?.offer?.primary ?? [], ...g?.offer?.rest ?? []], names = this.names();
    const ranked = Offers.ranked([...l.promoted, ...l.rest], a => all.find(o => o.choice === a.choice)
      ?? { choice: a.choice, ...a.command ? { command: a.command } : {}, label: a.label, type: 'other', aspects: [],
        marks: [] });
    return { turn: this.n, moment: 'inspect', scene: { lines: [], prose: [] },
      offer: { primary: ranked.primary.map(o => Runner.choice(screen, names, o)),
        rest: ranked.rest.map(o => Runner.choice(screen, names, o)) } };
  }
  // The runner on stdio: a turn said on starting and after every line read; the transcript kept, if asked for.
  static async main(args: string[]): Promise<number> {
    const options = PlayTool.parse(args.filter((a, i) => a !== '--transcript' && args[i - 1] !== '--transcript'));
    const kept = args.includes('--transcript') ? args[args.indexOf('--transcript') + 1] : undefined;
    if (!options.world && !options.campaign) { console.error(`${PlayTool.usage} [--create] [--transcript out.jsonl]`); return 1; }
    // --create on a world: the life made from the real entry point, through the engine's own requests (Gate 1).
    const lines = new RunnerLines(), creating = !!options.world && !options.as && args.includes('--create');
    const session = creating ? await new RunnerCreation(lines, out => Runner.say(out, kept)).begin(options.world!)
      : (await PlayTool.start(options)).journey.session;
    const runner = new Runner(session);
    await Runner.say(runner.said(), kept);
    for (let line = await lines.next(); line !== null; line = await lines.next()) {
      const out = await runner.ask(line);
      await Runner.say(out, kept);
      if ('end' in out) { return 0; }
    }
    return 0;
  }
  // A turn said on stdout, and kept in the transcript, if one is asked for.
  private static async say(out: unknown, kept?: string) {
    const text = JSON.stringify(out);
    console.log(text);
    if (kept) { await appendFile(kept, `${text}\n`); }
  }
}
