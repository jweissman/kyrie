import { Component, type ReactNode } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import type { Catalog, CompanyView, Frame, Member, Message, Setting } from '../engine/protocol';
import { EngineClient } from './engine-client';
import { MenuModel, type Menu, type View } from './menu-model';
import { ReaderStore, type SavedGame } from './reader-store';
import { ReaderKeys } from './reader-keys';
import { ReaderOpening } from './reader-opening';
import { Words } from './words';
import { TitlePage } from './title-page';
import { CampaignPage } from './campaign-page';
import { CompanyPage } from './company-page';
import { ProtagonistPage } from './protagonist-page';
import { LoadingPage } from './loading-page';
import { Book } from './book';

export type Phase = 'title' | 'campaigns' | 'company' | 'loading' | 'play';
// A journey the page shows while the engine works it out: from where, to where, by what way and how long.
export interface Travel { from: string; to: string; way: string; minutes: number }
// Where the company last chose in a fight: how many exchanges had been told, and how each fighter then stood, so the
// page can show what happened since and what each blow took.
export interface FightMark { seen: number; hp: Record<string, number>; first: boolean }
export interface AppState {
  phase: Phase; catalog?: Catalog; saved?: SavedGame;
  campaign: string; seed: string; setting?: Setting; party: Member[]; preview?: CompanyView; editing: number;
  // Why the one person playing has come into a generated country: one of the origins it holds.
  origin?: string;
  frame?: Frame; view: View; cursor: number; trail: string[]; hovered?: string; member: string;
  // A command under way: what the company is doing, and the journey if it is one.
  pending?: { said: string; travel?: Travel };
  fight?: FightMark;
  stage: string; error: string; help: boolean;
}

// The page. The engine decides everything that happens; this keeps what is on show, what is highlighted, which
// short list is open, and what is under way, and turns keys, clicks and the engine's frames into state.
export class ReaderApp extends Component<{ query: URLSearchParams }, AppState> {
  readonly engine = new EngineClient(this.listen.bind(this));
  readonly keys = new ReaderKeys(this);
  readonly opening = new ReaderOpening(this);
  override state: AppState = ReaderApp.initial(ReaderStore.read());
  private static initial(saved?: SavedGame): AppState {
    return { phase: 'title', campaign: '', seed: '', party: [], editing: -1, view: 'here', cursor: 0, trail: [],
      member: '', stage: '', error: '', help: false, ...saved ? { saved } : {} };
  }
  override componentDidMount() {
    window.addEventListener('keydown', this.keys.press);
    void this.opening.boot();
  }
  override componentWillUnmount() { window.removeEventListener('keydown', this.keys.press); }
  // A new place opens at the top of its page; what came of something done at the same place is brought into view
  // with the choices after it; a highlight moved by the keys takes the focus with it.
  override componentDidUpdate(_props: unknown, prev: AppState) {
    const frame = this.state.frame;
    if (frame && prev.frame !== frame) {
      const fresh = !prev.frame || !!frame.combat || !!prev.frame.combat
        || prev.frame.screen.place.id !== frame.screen.place.id;
      ReaderApp.settle(fresh);
    }
    if (prev.cursor !== this.state.cursor && !this.state.hovered) {
      const chosen = document.querySelector<HTMLElement>(`.intentions [data-index="${this.state.cursor}"]`);
      chosen?.focus({ preventScroll: true });
      chosen?.scrollIntoView({ block: 'nearest' });
    }
  }
  // The book lies open on a wide screen, each page scrolling on its own; held upright its pages follow one another and
  // the book scrolls as one. A new place starts at the top. Something new at the same place is brought into view: on
  // an open book the left page shows the exchange; on a single page, the exchange comes to the top of the screen so
  // that it and the choices after it are seen together.
  static settle(fresh: boolean) {
    const book = document.querySelector<HTMLElement>('.book'), verso = document.getElementById('page');
    const exchange = document.querySelector<HTMLElement>('.verso .exchange');
    if (!book || !verso) { return; }
    const open = getComputedStyle(book).display === 'grid', scroller = open ? verso : book;
    if (fresh || !exchange) { scroller.scrollTo({ top: 0 }); return; }
    const top = exchange.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const runner = open ? 0 : (book.querySelector<HTMLElement>('.runner')?.offsetHeight ?? 0);
    if (open ? top > scroller.clientHeight - 120 : top > scroller.clientHeight * 0.45 || top < runner) {
      scroller.scrollBy({ top: top - runner - 12, behavior: 'smooth' });
    }
  }
  private listen(message: Message) {
    if (message.kind === 'saved') {
      const saved = ReaderStore.write(message.save, message.summary);
      if (saved) { this.setState({ saved }); }
    } else if (message.kind === 'progress') { this.setState({ stage: message.stage }); }
    else if (message.kind === 'frame') {
      const combat = message.frame.combat, fight = combat ? this.state.frame?.combat ? this.state.fight
        : { seen: 0, hp: {}, first: true } : undefined;
      this.setState({ frame: message.frame, pending: undefined, cursor: 0, trail: [], hovered: undefined, fight });
    }
  }
  private built?: { frame?: Frame; view: View; trail: string[]; menu: Menu };
  // What can be chosen now, built once for each frame, view and open list.
  get menu(): Menu {
    const { frame, view, trail } = this.state, b = this.built;
    if (b && b.frame === frame && b.view === view && b.trail === trail) { return b.menu; }
    this.built = { frame, view, trail, menu: MenuModel.build(frame, view, trail) };
    return this.built.menu;
  }
  // A choice made: a short list opens, a fight goes on, or the company does it.
  readonly choose = (choice: Choice) => {
    const { frame, pending } = this.state;
    if (pending || choice.disabled || !frame) { return; }
    if (choice.children) { this.setState({ trail: [...this.state.trail, choice.id], cursor: 0, hovered: undefined }); return; }
    if (!choice.command) { if (this.state.view === 'company') { this.setState({ member: choice.id }); } return; }
    const said = ReaderApp.said(this.menu.trail, choice);
    if (frame.combat) {
      this.setState({ pending: { said }, fight: ReaderApp.mark(frame) });
      this.engine.request({ kind: 'fight', choice: choice.command }).catch(this.failed);
      return;
    }
    void this.perform(choice, said, this.unnamed(choice));
  };
  // What the player chose, as they would say it: a question put to someone named in the list it was chosen from is
  // put to them by name ("Ask about the road", in Eamon's list, is "Ask Eamon about the road").
  static said(trail: Choice[], choice: Choice): string {
    const head = trail[0]?.label ?? '', person = /^Speak with (.+)$/.exec(head)?.[1];
    if (person && !choice.label.includes(person) && /^(Ask|Tell|Show|Offer|Give|Pay) (about|what|why|how|if|for|whether|that|where|who)\b/.test(choice.label)) {
      return choice.label.replace(/^(\w+) /, `$1 ${person} `);
    }
    return [...trail.slice(person ? 1 : 0).map(c => c.label), choice.label].join(' › ');
  }
  // A choice whose label leaves out what it is about ("Take", "Attack", in a list headed by the thing or the creature).
  private unnamed(choice: Choice): boolean {
    const section = this.menu.trail.length ? undefined : this.menu.sections.find(s => s.choices.some(c => c.id === choice.id));
    if (!section || ['way', 'company'].includes(section.tone)) { return false; }
    const subject = Words.short(section.title).replace(/^(a|an|the) /i, '').toLowerCase();
    return !choice.label.toLowerCase().includes(subject);
  }
  // Let the companion whose turn it is fight this turn on their own.
  readonly auto = () => {
    if (!this.state.frame?.combat?.ours || this.state.pending) { return; }
    this.setState({ pending: { said: 'Fighting on' }, fight: ReaderApp.mark(this.state.frame) });
    void this.engine.request({ kind: 'fight' });
  };
  // The fight as it stands when the company chooses: what has been told, and everyone's health.
  private static mark(frame: Frame): FightMark {
    const c = frame.combat!;
    return { seen: (c.exchanges.at(-1)?.n ?? -1) + 1, first: false,
      hp: Object.fromEntries([...c.foes, ...c.allies].map(f => [f.id, f.hp])) };
  }
  private readonly failed = (error: unknown) => {
    this.setState({ pending: undefined, error: error instanceof Error ? error.message : String(error) });
  };
  private async perform(choice: Choice, said: string, named: boolean) {
    const frame = this.state.frame!, travel = this.travel(choice, frame);
    this.setState({ pending: { said, ...travel ? { travel } : {} }, error: '' });
    const started = performance.now();
    try {
      const next = await this.engine.request<Frame>({ kind: 'perform', command: choice.command!, said,
        move: choice.tone === 'way', named });
      // A journey is shown for long enough to be seen, whatever the engine took.
      if (travel) { await new Promise(r => setTimeout(r, Math.max(0, this.journey(travel) - performance.now() + started))); }
      this.setState({ frame: next, pending: undefined, cursor: 0, trail: this.kept(next), hovered: undefined, view: 'here' });
    } catch (error) { this.failed(error); }
  }
  // A conversation goes on: after saying something to someone, what else there is to say to them stays open, as long
  // as they are still there and there is more to say.
  private kept(next: Frame): string[] {
    const trail = this.state.trail;
    if (!trail[0]?.endsWith('#speak') || next.combat) { return []; }
    const still = MenuModel.build(next, 'here', [trail[0]]);
    return still.trail.length && still.level.length ? [trail[0]] : [];
  }
  // A way that takes a while across the country is a journey on the map.
  private travel(choice: Choice, frame: Frame): Travel | undefined {
    const exit = frame.screen.exits.find(e => choice.id === e.id || choice.id.startsWith(`${e.id}/`));
    if (choice.tone !== 'way' || !exit || (choice.minutes ?? 0) < 20) { return undefined; }
    return { from: frame.screen.place.id, to: exit.destination.id, way: exit.way ?? exit.name,
      minutes: choice.minutes ?? 0 };
  }
  // Long enough to feel the distance (the way and its time are said while it lasts), never so long as to wait on.
  journey(travel: Travel): number {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { return 0; }
    return Math.min(700, 250 + travel.minutes * 3);
  }
  readonly back = () => {
    const s = this.state;
    if (s.help) { this.setState({ help: false }); }
    else if (s.trail.length) { this.setState({ trail: s.trail.slice(0, -1), cursor: 0 }); }
    else if (s.view !== 'here') { this.setState({ view: 'here', cursor: 0 }); }
  };
  show(view: View) {
    if (this.state.frame?.combat && view !== 'here') { return; }
    const member = this.state.member || (this.state.frame?.screen.party[0]?.id ?? '');
    this.setState({ view: this.state.view === view ? 'here' : view, cursor: 0, trail: [], hovered: undefined, member });
  }
  readonly hover = (id?: string) => { if (id !== this.state.hovered) { this.setState({ hovered: id }); } };
  readonly download = () => {
    void this.engine.request<string | null>({ kind: 'checkpoint' }).then(text => {
      if (text) { ReaderStore.download(text, `kyr-${this.state.frame?.screen.elapsed ?? 0}.json`); }
    });
  };
  readonly dismiss = () => { this.setState({ error: '' }); };
  // Test and automation hook: the same semantic state the page draws.
  inspect() {
    const s = this.state, menu = this.menu, frame = s.frame;
    const mode = s.phase !== 'play' ? { title: 'title', campaigns: 'campaigns', company: 'create', loading: 'create' }[s.phase]
      : frame?.combat ? 'combat' : { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map',
        story: 'story' }[s.view];
    return { mode, place: frame?.screen.place, path: frame?.screen.path,
      sections: menu.sections.map(sec => ({ id: sec.id, title: sec.title, choices: sec.choices.map(MenuModel.shape) })),
      choices: menu.level.map(MenuModel.shape), selected: menu.level[s.cursor]?.id, trail: menu.trail.map(c => c.label),
      combat: frame?.combat, log: (frame?.entries ?? []).slice(-5), party: frame?.screen.party.map(m => ({ name: m.name,
        hp: m.hp })), pending: !!s.pending || s.phase === 'loading', error: s.error };
  }
  exportTranscript() { return this.state.frame?.transcript; }
  override render(): ReactNode {
    switch (this.state.phase) {
      case 'title': return <TitlePage.View app={this} />;
      case 'campaigns': return <CampaignPage.View app={this} />;
      case 'company': return this.state.setting?.generated ? <ProtagonistPage.View app={this} /> : <CompanyPage.View app={this} />;
      case 'loading': return <LoadingPage.View app={this} />;
      case 'play': return <Book.View app={this} />;
    }
  }
}
