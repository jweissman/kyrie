import { EngineHost } from '../../web/engine/engine-host';
import { Creation } from '../../web/engine/creation';
import { MenuModel, type Menu } from '../../src/frame/menu-model';
import { TalkQuestion, type Question } from '../../src/frame/talk-question';
import { PlaceQuestion } from '../../src/frame/place-question';
import { MenuTree } from '../../src/frame/menu-tree';
import { QuestionAsked } from '../../src/frame/question-asked';
import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { Runner, type Said } from '../../src/cli/runner';
import { Terminal } from '../../src/cli/terminal';
import { TerminalScene } from '../../src/cli/terminal-scene';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import type { Told } from '../../src/presentation/narrator';
import { PlayerView } from '../../src/presentation/player-view';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Digest } from '../../src/session/digest';
import type { Choice } from '../../src/ui/choice-list';
import type { Frame } from '../../src/creation/protocol';

// What one client shows at a step (OR-1450, engine-focus.md §6): the world (its digest) and where the company is;
// whom it attends to (the focus: "place", "person:<id>", "thing:<id>"); and the question's rows, each by the command
// it does (a turning to someone, which does none, by its own id), with the Atlas kinds it is marked by.
// paged: at the place, the page of its question each draws (OR-1494), by the commands of its rows, in order.
export interface Seen { digest: string; place: string; focus: string; rows: Record<string, string[]>; paged: string[] }
export type Client = 'page' | 'terminal' | 'runner';

// The three clients over one game (the page's engine, the terminal's session and its turn, and the runner over a
// session of its own), from one checkpoint, given the same commands. Whom each attends to is its session's own focus
// (OR-1451: PlaySession.focus, the question each reads, MenuTree.question), so this harness holds that they agree.
export class ThreeClients {
  private page: { frame: Frame } = { frame: undefined! };
  private said?: Said;
  // What came of the terminal's last act, as its turn tells it.
  private told?: Told;
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
  // What the page has asked in the conversation under way (the engine's question's).
  asked(): readonly string[] { return this.page.frame.question?.talk?.asked ?? []; }
  // The page's menu as it draws it now: in a talk, the engine's question; else the frame's menu.
  menu(): Menu { return TalkQuestion.menu(this.page.frame) ?? MenuModel.build(this.page.frame, 'here', []); }
  // The page's choice that does a command (or is a turning by its id), among what it draws now.
  choice(command: string): Choice | undefined {
    const m = this.menu(), all = [...m.choices, ...m.talk ? [...m.talk.replies, m.talk.leave] : []];
    return ThreeClients.flat(all).find(c => c.command === command || c.id === command);
  }
  // A command done by every client, as each does it: the page by its choice's command (the engine's, as the page's
  // choose sends it), the terminal by its session, the runner by the act asked.
  async act(command: string): Promise<void> {
    const choice = this.choice(command) ?? { id: command, label: command, command } as unknown as Choice;
    if (choice.command) {
      this.page = { frame: await this.host.handle({ kind: 'perform', command: choice.command }) as Frame };
      // As the terminal does it (Terminal.act): what came of it, told on its next turn (a focus command tells nothing).
      const c = this.terminal.campaign, before = PlayerView.observe(c);
      const event = await this.terminal.leg(choice.command);
      const moved = before.location?.id !== PlayerView.observe(c).location?.id;
      this.told = choice.command.startsWith('focus:') ? undefined
        : { event, said: choice.label, feedback: ActionFeedbackView.read(c, event, before), moved };
    }
    const asked = await this.runner.ask(JSON.stringify({ act: command }));
    if (!('error' in asked)) { this.said = asked; }
  }
  // The terminal's turn told, and the question asked of it (Terminal.scene's, its screen and leaf).
  private terminalAsked(): { question: Question; screen: ReturnType<typeof ScreenModel.build>;
    glance: ReturnType<typeof Narrator.leaf>['glance'] } {
    const c = this.terminal.campaign, screen = ScreenModel.build(c);
    const leaf = new TerminalScene().leaf(c, screen, this.told);
    const framed = MenuTree.framed({ screen, leaf } as unknown as Omit<Frame, 'menu'>);
    return { question: QuestionAsked.settle(this.terminal, framed), screen, glance: leaf.glance };
  }
  // What each shows now.
  seen(): Record<Client, Seen> {
    const runner = this.runner.session, terminal = this.terminalAsked();
    return {
      page: this.of(Digest.of(this.terminalOf(this.host)), this.page.frame.screen.place.id,
        ThreeClients.focus(this.page.frame.question?.focus), { rows: this.pageRows(), paged: this.pagePaged() }),
      terminal: this.of(Digest.of(this.terminal.campaign), terminal.screen.place.id,
        ThreeClients.focus(terminal.question.focus),
        { rows: this.terminalRows(terminal), paged: this.terminalPaged(terminal) }),
      runner: this.of(Digest.of(runner.campaign), ScreenModel.build(runner.campaign).place.id,
        ThreeClients.focus(runner.focus), { rows: this.runnerRows(), paged: this.runnerPaged() }),
    };
  }
  private of(digest: string, place: string, focus: string, seen: Pick<Seen, 'rows' | 'paged'>): Seen {
    return { digest, place, focus, ...seen };
  }
  // The place's page each draws (OR-1494): the page's question, the terminal's first, the runner's primary.
  private pagePaged(): string[] {
    const place = this.page.frame.question?.place;
    // The first page's four are the glance's offer, held alike by the rows above (test/small/one-projection).
    return place ? [...place.page.at ? PlaceQuestion.paged(place).map(r => r.command) : [],
      PlaceQuestion.next(place)?.command ?? ''] : [];
  }
  private terminalPaged(at: ReturnType<ThreeClients['terminalAsked']>): string[] {
    if (!at.question.place) { return []; }
    const o = Terminal.foreground(this.terminal, at.glance, at.screen, { question: at.question });
    return [...at.question.place.page.at ? o.first.map(l => l.id) : [], o.next?.command ?? ''];
  }
  private runnerPaged(): string[] {
    const o = this.said?.offer;
    const turned = !!o?.page?.at;
    return this.runner.session.focus.kind === 'place' ? [...turned ? (o?.primary ?? []).map(x => x.does ?? x.id) : [],
      o?.page?.next ?? ''] : [];
  }
  private terminalOf(host: EngineHost) { return (host as unknown as { session: PlaySession }).session.campaign; }
  // A focus as the harness compares it: the place, or whom the company talks with.
  private static focus(f?: Question['focus']): string { return f?.kind === 'talk' ? `person:${f.with}` : 'place'; }
  private pageRows(): Record<string, string[]> {
    const m = this.menu(), marks = this.page.frame.menu.marks, talk = this.page.frame.question?.talk;
    return Object.fromEntries(ThreeClients.flat(m.choices).map(c => [c.command ?? c.id,
      [...new Set((talk ? talk.marks[c.id] : marks.replies[c.id] ?? marks.rows[c.id] ?? [])
        ?.flatMap(l => l.witnesses.flatMap(w => w.aspects)) ?? [])].map(String).sort()]));
  }
  private terminalRows(at: ReturnType<ThreeClients['terminalAsked']>): Record<string, string[]> {
    const offered = Terminal.foreground(this.terminal, at.glance, at.screen, { question: at.question });
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
      if (focus === 'place' && theirs.paged.join() !== page.paged.join()) {
        out.push(`place page ${other}: ${theirs.paged.join(' ')} where page ${page.paged.join(' ')}`);
      }
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
    // (The leave is the question's last row but the next page; taken by its command.)
    if (leave?.command) { await t.act(leave.command); look(); }
    await t.act('wait'); look();
    // The place's pages (OR-1494): turned twice by Something else…, and back to the first.
    for (const n of [1, 2, 0]) { await t.act(`focus:page:${n}`); look(); }
    return { steps: worlds.length, worlds, apart: [...apart].sort() };
  }
}
