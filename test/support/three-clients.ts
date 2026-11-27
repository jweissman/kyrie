import { EngineHost } from '../../web/engine/engine-host';
import { Creation } from '../../web/engine/creation';
import { PageFocus, type Talked } from '../../web/reader/page-focus';
import { Conversation } from '../../web/reader/conversation';
import { MenuModel, type Menu } from '../../src/frame/menu-model';
import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { Runner, type Said } from '../../src/cli/runner';
import { Terminal, type Talking } from '../../src/cli/terminal';
import { PlayerView } from '../../src/presentation/player-view';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Digest } from '../../src/session/digest';
import type { Choice } from '../../src/ui/choice-list';
import type { Frame } from '../../src/creation/protocol';

// What one client shows at a step (OR-1450, engine-focus.md §6): the world (its digest) and where the company is;
// whom it attends to (the focus: "place", "person:<id>", "thing:<id>"); and the question's rows, each by the command
// it does (a turning to someone, which does none, by its own id), with the Atlas kinds it is marked by.
export interface Seen { digest: string; place: string; focus: string; rows: Record<string, string[]> }
export type Client = 'page' | 'terminal' | 'runner';

// The three clients over one game (the page's engine and the page's own step machine, the terminal's session and
// its turn, and the runner over a session of its own), from one checkpoint, given the same commands. Each keeps whom it
// attends to as it does today: the page by PageFocus (ReaderApp's state), the terminal by Terminal.talked, the runner
// by its own `with`; engine-owned focus (OR-1451 onward) makes these one, and this harness holds that they agree.
export class ThreeClients {
  private page: Talked & { frame: Frame } = { attention: Conversation.place, talk: [], asked: [], frame: undefined! };
  private talking?: Talking;
  private said?: Said;
  private constructor(readonly host: EngineHost, readonly terminal: PlaySession, readonly runner: Runner) {}
  static async start(seed = 'wren'): Promise<ThreeClients> {
    const host = new EngineHost(() => undefined);
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
    const frame = await host.handle({ kind: 'begin', campaign: Creation.generated, seed, party, origin: 'wanderer' }) as Frame;
    const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
    const three = new ThreeClients(host, PlaySession.resume(kept.checkpoint),
      new Runner(PlaySession.resume(kept.checkpoint)));
    three.page.frame = frame;
    three.said = three.runner.said();
    return three;
  }
  // What the page has asked in the conversation under way.
  asked(): readonly string[] { return this.page.asked; }
  // The page's menu as it draws it now (MenuModel, from its own state).
  menu(): Menu {
    const { frame, attention, asked, heard, trading } = this.page;
    return MenuModel.build(frame, 'here', [], { attention, asked, ...heard ? { heard } : {}, ...trading ? { trading } : {} });
  }
  // The page's choice that does a command (or is a turning by its id), among what it draws now.
  choice(command: string): Choice | undefined {
    const m = this.menu(), all = [...m.choices, ...m.talk ? [...m.talk.replies, m.talk.leave] : []];
    return ThreeClients.flat(all).find(c => c.command === command || c.id === command);
  }
  // A command done by every client, as each does it: the page by its choice (turning first, where it is one), the
  // terminal by its session, the runner by the act asked.
  async act(command: string): Promise<void> {
    const choice = this.choice(command) ?? { id: command, label: command, command } as unknown as Choice;
    const turning = Conversation.turn(choice), says = turning?.kind === 'person'
      ? this.menu().scene?.subjects.find(s => s.id === turning.id)?.says?.[0] : undefined;
    const replies = this.menu().talk?.replies.map(c => c.id), was = this.page;
    if (turning) { this.page = { ...this.page, ...PageFocus.turned(this.page, turning, says) }; }
    if (choice.command) {
      const next = await this.host.handle({ kind: 'perform', command: choice.command }) as Frame;
      this.page = { ...PageFocus.after(was, { choice, said: choice.label, ...turning ? { turning } : {}, aside: false,
        frame: was.frame, next, ...replies ? { replies } : {} }), frame: next };
      // As the terminal does it (Terminal.act): its own row for the command, and the act's kind from the frame's rows.
      const c = this.terminal.campaign, screen = ScreenModel.build(c), listed = Terminal.foreground(this.terminal,
        Narrator.leaf(c, screen).glance, screen, this.talking ? { talking: this.talking } : {}).all
        .find(l => l.id === choice.command);
      const does = PlayerFrame.of(c).rows.find(r => r.choice.id === choice.command)?.action.schema;
      const before = PlayerView.observe(c).location?.id;
      await this.terminal.leg(choice.command);
      const moved = before !== PlayerView.observe(c).location?.id;
      this.talking = Terminal.talked(this.talking, { moved, ...does ? { does } : {},
        ...listed?.targets?.[0] ? { target: listed.targets[0] } : {} });
    }
    const asked = await this.runner.ask(JSON.stringify({ act: command }));
    if (!('error' in asked)) { this.said = asked; }
  }
  // What each shows now.
  seen(): Record<Client, Seen> {
    const runner = this.runner as unknown as { with?: string; session: PlaySession };
    return {
      page: this.of(Digest.of(this.terminalOf(this.host)), this.page.frame.screen.place.id,
        ThreeClients.focus(this.page.attention), this.pageRows()),
      terminal: this.of(Digest.of(this.terminal.campaign), ScreenModel.build(this.terminal.campaign).place.id,
        this.talking ? `person:${this.talking.id}` : 'place', this.terminalRows()),
      runner: this.of(Digest.of(runner.session.campaign), ScreenModel.build(runner.session.campaign).place.id,
        runner.with ? `person:${runner.with}` : 'place', this.runnerRows()),
    };
  }
  private of(digest: string, place: string, focus: string, rows: Record<string, string[]>): Seen {
    return { digest, place, focus, rows };
  }
  private terminalOf(host: EngineHost) { return (host as unknown as { session: PlaySession }).session.campaign; }
  private static focus(a: { kind: string; id?: string }): string { return a.kind === 'place' ? 'place' : `${a.kind}:${a.id}`; }
  private pageRows(): Record<string, string[]> {
    const m = this.menu(), marks = this.page.frame.menu.marks;
    const rows = m.talk ? [...m.talk.replies, m.talk.leave] : m.choices;
    return Object.fromEntries(ThreeClients.flat(rows).map(c => [c.command ?? c.id,
      [...new Set((marks.replies[c.id] ?? marks.rows[c.id] ?? []).flatMap(l => l.witnesses.flatMap(w => w.aspects)))]
        .map(String).sort()]));
  }
  private terminalRows(): Record<string, string[]> {
    const c = this.terminal.campaign, screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen);
    const offered = Terminal.foreground(this.terminal, leaf.glance, screen,
      this.talking ? { talking: this.talking } : {});
    return Object.fromEntries([...offered.first, ...offered.rest ?? []].map(l => [l.id,
      [...new Set((l.aspects ?? []).map(a => String(a)))].sort()]));
  }
  private runnerRows(): Record<string, string[]> {
    const o = this.said?.offer;
    return Object.fromEntries([...o?.primary ?? [], ...o?.rest ?? []].map(x => [x.does ?? x.id,
      [...new Set(x.aspects.map(String))].sort()]));
  }
  static flat(choices: readonly Choice[]): Choice[] {
    return choices.flatMap(c => [c, ...ThreeClients.flat(c.children ?? [])]);
  }
  // Where the three differ now, each as "what: how" (no step's number, so that one divergence is one entry however
  // many steps it stands at): the world, the place and the focus are held equal outright by the spec; the rows are
  // read here, the page's against the runner's and the terminal's, by the command each row does.
  static apart(seen: Record<Client, Seen>): string[] {
    const out: string[] = [], page = seen.page, focus = page.focus.replace(/:.*/, '');
    for (const other of ['terminal', 'runner'] as const) {
      const theirs = seen[other];
      if (theirs.focus !== page.focus) { out.push(`focus ${other}: ${theirs.focus.replace(/:.*/, '')} where page ${focus}`); }
      for (const k of Object.keys(page.rows)) { if (!(k in theirs.rows)) { out.push(`${focus} row page, not ${other}: ${k}`); } }
      for (const k of Object.keys(theirs.rows)) { if (!(k in page.rows)) { out.push(`${focus} row ${other} only: ${k}`); } }
      for (const [k, kinds] of Object.entries(page.rows)) {
        const them = theirs.rows[k];
        if (them && them.join() !== kinds.join()) { out.push(`${focus} marks ${other}: ${k} ${them.join('+')} where page ${kinds.join('+')}`); }
      }
    }
    return out;
  }
  // The walk every step is held over (engine-focus.md §6): on wren, from where a wanderer begins, turning to the first
  // one who can be talked to, each of the first two things to be said to them, taking leave, and a wait; at each step
  // the world and the place the same for all three, and what differs gathered. Later steps add their own scenes (an
  // examination, the map, paging and trading).
  static async walk(): Promise<{ steps: number; worlds: string[]; apart: string[] }> {
    const t = await ThreeClients.start('wren'), worlds: string[] = [], apart = new Set<string>();
    const look = () => {
      const s = t.seen();
      worlds.push(['page', 'terminal', 'runner'].map(c => `${c} ${s[c as Client].digest} ${s[c as Client].place}`).join(' | '));
      for (const d of ThreeClients.apart(s)) { apart.add(d); }
    };
    look();
    const talk = ThreeClients.flat(t.menu().choices).find(c => c.does === 'talk_to' && c.command);
    if (!talk) { throw new Error('no one to talk to where a wanderer begins on wren'); }
    await t.act(talk.command!); look();
    // Each time the first reply not yet put, among what can be said to them now.
    for (let n = 0; n < 2; n++) {
      const asked = new Set(t.asked()), reply = (t.menu().talk?.replies ?? []).find(r => r.command && !asked.has(r.id));
      if (!reply) { break; }
      await t.act(reply.command!); look();
    }
    const leave = t.menu().talk?.leave;
    if (leave?.command) { await t.act(leave.command); look(); }
    await t.act('wait'); look();
    return { steps: worlds.length, worlds, apart: [...apart].sort() };
  }
}
