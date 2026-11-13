import { createInterface } from 'node:readline';
import { appendFile } from 'node:fs/promises';
import type { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { Narrator, type Told } from '../presentation/narrator';
import type { Lens } from '../presentation/glance-types';
import { Offers, type ActType, type Offer, type Offered as Glanced } from '../presentation/offer';
import { ScreenModel } from '../ui/screen-model';
import type { Screen } from '../ui/screen-types';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { Undertakings } from '../presentation/undertakings';
import { TerminalScene, type Turned } from './terminal-scene';
import { PlayTool } from './play-tool';
import { TerminalWalk, type Presented } from './terminal-walk';

// One choice as the runner offers it: its id is the command that does it, the real choice id (PlayerView), so that an
// agent acts on what the page and the terminal would have it act on.
export interface Offered { id: string; label: string; aspects: string[]; type: ActType; minutes?: number;
  marks: string[] }
// What the runner says on each turn: how it was come to (arriving somewhere, what came of an act, or looked at on
// purpose), the scene's lines as the terminal tells them, the four led with and the rest, the aim and what is needed.
// scene.prose: of its lines, the narration alone (not the heading nor the aim and what is needed), as the scene
// budget counts it (TerminalWalk).
export interface Said { turn: number; moment: 'arrive' | 'outcome' | 'inspect';
  scene: { lines: string[]; prose: string[] };
  offer: { primary: Offered[]; rest: Offered[] }; aim?: string; aims?: Aim[]; need?: string[]; end?: true }
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
  private readonly scene = new TerminalScene();
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
      scene: { lines, prose: this.scene.told.at(-1)?.lines ?? [] }, offer: this.offer(screen, g?.offer),
      ...aim ? { aim: Typography.plain(aim.text) } : {}, ...screen.aims?.length ? { aims: screen.aims.map(a => ({
        id: a.id, text: Typography.plain(a.text), ...a.followed ? { followed: true as const } : {} })) } : {},
      ...g?.need?.length ? { need: g.need } : {},
      ...c.running ? {} : { end: true } };
  }
  // The glance's own offer (Offers.scene): its four and its rest, each by the command that does it.
  private offer(screen: Screen, offer: Offer | undefined): Said['offer'] {
    const names = this.names();
    const primary = (offer?.primary ?? []).map(o => Runner.choice(screen, names, o));
    const rest = (offer?.rest ?? []).map(o => Runner.choice(screen, names, o));
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
  private static choice(screen: Screen, names: Map<string, string>, o: Glanced): Offered {
    // A thing looked at is called by what is done to it ("Take a steel coin"), not by its name alone.
    const named = o.for && names.get(o.for), id = Runner.way(screen, (named && o.for) || (o.command ?? o.choice));
    const own = !named && /#look$/.test(o.choice) ? names.get(id) : undefined;
    return { id, label: Typography.plain(named || own || o.label), aspects: o.aspects, type: o.type,
      ...o.minutes ? { minutes: o.minutes } : {}, marks: o.marks.map(m => m.kind) };
  }
  // Every choice's words, by its id.
  private names(): Map<string, string> {
    return new Map(PlayerView.choices(this.campaign).map(r => [r.choice.id, r.choice.name]));
  }
  // A way led with is done by its exit's own command.
  private static way(screen: Screen, id: string): string {
    return screen.exits.find(e => e.id === id)?.acts.find(a => a.command)?.command ?? id;
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
    const screen = ScreenModel.build(this.campaign);
    const o = this.offer(screen, Narrator.leaf(this.campaign, screen, this.told).glance?.offer);
    const offered = [...o.primary, ...o.rest];
    if (!offered.some(o => o.id === asked.act)) { return { error: `not offered: ${asked.act}` }; }
    const before = PlayerView.observe(this.campaign), event = await this.session.leg(asked.act);
    const moved = before.location?.id !== this.campaign.world.one('at', this.campaign.playerActor ?? 'party');
    this.told = { event, feedback: ActionFeedbackView.read(this.campaign, event, before), said: asked.act, moved };
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
    if (!options.world && !options.campaign) { console.error(`${PlayTool.usage} [--transcript out.jsonl]`); return 1; }
    const runner = new Runner((await PlayTool.start(options)).journey.session);
    await Runner.say(runner.said(), kept);
    for await (const line of createInterface({ input: process.stdin })) {
      if (!line.trim()) { continue; }
      const out = await runner.ask(line.trim());
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
