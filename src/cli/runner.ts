import { createInterface } from 'node:readline';
import { appendFile } from 'node:fs/promises';
import type { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { Narrator, type Told } from '../presentation/narrator';
import type { Lens, Promoted } from '../presentation/glance-types';
import { ScreenModel } from '../ui/screen-model';
import type { Screen } from '../ui/screen-types';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { TerminalScene, type Turned } from './terminal-scene';
import { PlayTool } from './play-tool';

// One choice as the runner offers it: its id is the command that does it, the real choice id (PlayerView), so that an
// agent acts on what the page and the terminal would have it act on.
export interface Offered { id: string; label: string; aspects: string[]; minutes?: number; marks: string[] }
// What the runner says on each turn: how it was come to (arriving somewhere, what came of an act, or looked at on
// purpose), the scene's lines as the terminal tells them, the four led with and the rest, the aim and what is needed.
export interface Said { turn: number; moment: 'arrive' | 'outcome' | 'inspect'; scene: { lines: string[] };
  offer: { primary: Offered[]; rest: Offered[] }; aim?: string; need?: string[]; end?: true }
// What an agent may send: an act by its id, a lens to look through, the place looked at whole, or every choice.
export type Asked = { act: string } | { lens: Lens } | { look: true } | { more: true };

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
  private get campaign() { return this.session.campaign; }
  // The turn as it stands: arriving (the first, and after a move), or what came of the last act.
  said(turned: Turned = !this.told || this.told.moved ? 'arrive' : 'act'): Said {
    const c = this.campaign, screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen, this.told);
    const lines = this.scene.lines(screen, leaf, turned).filter(l => l.trim());
    const g = leaf.glance, aim = AimSaid.of(screen, g?.aim);
    return { turn: this.n, moment: turned === 'arrive' ? 'arrive' : turned === 'act' ? 'outcome' : 'inspect',
      scene: { lines }, offer: this.offer(screen, g?.acts ?? []),
      ...aim ? { aim: Typography.plain(aim.text) } : {}, ...g?.need?.length ? { need: g.need } : {},
      ...c.running ? {} : { end: true } };
  }
  // The four led with, by their commands; and every other legal choice, by its own.
  private offer(screen: Screen, acts: Promoted[]): Said['offer'] {
    const primary = acts.map(a => ({ id: Runner.way(screen, a.command ?? a.for ?? a.choice),
      label: Typography.plain(a.label), aspects: a.aspects, marks: a.marks.map(m => m.kind) }));
    return { primary, rest: this.legal(screen).filter(o => !primary.some(p => p.id === o.id)) };
  }
  // A way led with is done by its exit's own command.
  private static way(screen: Screen, id: string): string {
    return screen.exits.find(e => e.id === id)?.acts.find(a => a.command)?.command ?? id;
  }
  private legal(screen: Screen): Offered[] {
    const choices = PlayerView.observe(this.campaign).choices.map(c => ({ id: c.id, label: Typography.plain(c.name),
      aspects: [], minutes: c.time * 10, marks: [] }));
    const journeys = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]
      .filter(d => !choices.some(c => c.id === `travel:${d.id}`))
      .map(d => ({ id: `travel:${d.id}`, label: `Set out for ${d.name}`, aspects: [], minutes: d.minutes, marks: [] }));
    return [...choices, ...journeys];
  }
  // A line from an agent, answered by what the turn then says, or an error.
  async ask(line: string): Promise<Said | { error: string }> {
    let asked: Asked;
    try { asked = JSON.parse(line) as Asked; } catch { return { error: `not JSON: ${line}` }; }
    if ('look' in asked) { return this.said('look'); }
    if ('lens' in asked) { return this.lensed(asked.lens); }
    if ('more' in asked) { return this.said(); }
    if (!('act' in asked) || typeof asked.act !== 'string') { return { error: `nothing asked: ${line}` }; }
    const screen = ScreenModel.build(this.campaign);
    const led = Narrator.leaf(this.campaign, screen, this.told).glance?.acts ?? [];
    const offered = [...this.offer(screen, led).primary, ...this.legal(screen)];
    if (!offered.some(o => o.id === asked.act)) { return { error: `not offered: ${asked.act}` }; }
    const before = PlayerView.observe(this.campaign), event = await this.session.leg(asked.act);
    const moved = before.location?.id !== this.campaign.world.one('at', this.campaign.playerActor ?? 'party');
    this.told = { event, feedback: ActionFeedbackView.read(this.campaign, event, before), said: asked.act, moved };
    this.n++;
    return this.said();
  }
  // A lens looked through: no world act, no time; its acts as the offer.
  private lensed(lens: Lens): Said | { error: string } {
    const c = this.campaign, screen = ScreenModel.build(c);
    const l = Narrator.leaf(c, screen, this.told).glance?.lenses[lens];
    if (!l) { return { error: `no lens: ${String(lens)}` }; }
    const rest = l.rest.map(a => ({ id: a.command ?? a.choice, label: Typography.plain(a.label), aspects: [],
      marks: [] }));
    return { turn: this.n, moment: 'inspect', scene: { lines: [] },
      offer: { primary: this.offer(screen, l.promoted).primary, rest } };
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
