import { Component, type ReactNode } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import type { Catalog, CompanyView, Frame, Member, Message, Setting } from '../engine/protocol';
import { EngineClient } from './engine-client';
import { MenuModel, type Menu, type View } from './menu-model';
import { ReaderStore, type SavedGame } from './reader-store';
import { ReaderKeys } from './reader-keys';
import { ReaderOpening } from './reader-opening';
import { TitlePage } from './title-page';
import { CampaignPage } from './campaign-page';
import { CompanyPage } from './company-page';
import { LoadingPage } from './loading-page';
import { PlaySurface } from './play-surface';

export type Phase = 'title' | 'campaigns' | 'company' | 'loading' | 'play';
// A journey the page shows while the engine works it out: from where, to where, by what way and how long.
export interface Travel { from: string; to: string; way: string; minutes: number }
export interface AppState {
  phase: Phase; catalog?: Catalog; saved?: SavedGame;
  campaign: string; seed: string; setting?: Setting; party: Member[]; preview?: CompanyView; editing: number;
  frame?: Frame; view: View; cursor: number; trail: string[]; hovered?: string; member: string;
  // A command under way: what the company is doing, and the journey if it is one.
  pending?: { said: string; travel?: Travel };
  stage: string; error: string; history: boolean; help: boolean;
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
      member: '', stage: '', error: '', history: false, help: false, ...saved ? { saved } : {} };
  }
  override componentDidMount() {
    window.addEventListener('keydown', this.keys.press);
    void this.opening.boot();
  }
  override componentWillUnmount() { window.removeEventListener('keydown', this.keys.press); }
  // A new place opens at the top of its page; something new at the same place is brought into view; a highlight
  // moved by the keys takes the focus with it.
  override componentDidUpdate(_props: unknown, prev: AppState) {
    const page = document.getElementById('page'), frame = this.state.frame;
    if (page && frame && prev.frame !== frame) {
      if (!prev.frame || prev.frame.screen.place.id !== frame.screen.place.id || !!prev.frame.combat !== !!frame.combat) {
        page.scrollTo({ top: 0 });
      } else {
        const latest = page.querySelector<HTMLElement>('.entry.latest, .exchange:last-child');
        const top = latest?.getBoundingClientRect().top ?? 0;
        if (latest && (top > innerHeight * 0.6 || top < 0)) { page.scrollBy({ top: top - 96, behavior: 'smooth' }); }
      }
    }
    if (prev.cursor !== this.state.cursor && !this.state.hovered) {
      const chosen = document.querySelector<HTMLElement>(`.choices [data-index="${this.state.cursor}"]`);
      chosen?.focus({ preventScroll: true });
      chosen?.scrollIntoView({ block: 'nearest' });
    }
  }
  private listen(message: Message) {
    if (message.kind === 'saved') {
      const saved = ReaderStore.write(message.save);
      if (saved) { this.setState({ saved }); }
    } else if (message.kind === 'progress') { this.setState({ stage: message.stage }); }
    else if (message.kind === 'frame') {
      this.setState({ frame: message.frame, pending: undefined, cursor: 0, trail: [], hovered: undefined });
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
    const said = [...this.menu.trail.map(c => c.label), choice.label].join(' › ');
    if (frame.combat) {
      this.setState({ pending: { said } });
      this.engine.request({ kind: 'fight', choice: choice.command }).catch(this.failed);
      return;
    }
    void this.perform(choice, said);
  };
  // Let the companion whose turn it is fight this turn on their own.
  readonly auto = () => {
    if (!this.state.frame?.combat?.ours || this.state.pending) { return; }
    this.setState({ pending: { said: 'Fighting on' } });
    void this.engine.request({ kind: 'fight' });
  };
  private readonly failed = (error: unknown) => {
    this.setState({ pending: undefined, error: error instanceof Error ? error.message : String(error) });
  };
  private async perform(choice: Choice, said: string) {
    const frame = this.state.frame!, travel = this.travel(choice, frame);
    this.setState({ pending: { said, ...travel ? { travel } : {} }, error: '', history: false });
    const started = performance.now();
    try {
      const next = await this.engine.request<Frame>({ kind: 'perform', command: choice.command!, said,
        move: choice.tone === 'way' });
      // A journey is shown for long enough to be seen, whatever the engine took.
      if (travel) { await new Promise(r => setTimeout(r, Math.max(0, this.journey(travel) - performance.now() + started))); }
      this.setState({ frame: next, pending: undefined, cursor: 0, trail: [], hovered: undefined,
        view: this.state.view === 'map' ? 'map' : 'here' });
    } catch (error) { this.failed(error); }
  }
  // A way that takes a while across the country is a journey on the map.
  private travel(choice: Choice, frame: Frame): Travel | undefined {
    const exit = frame.screen.exits.find(e => choice.id === e.id || choice.id.startsWith(`${e.id}/`));
    if (choice.tone !== 'way' || !exit || (choice.minutes ?? 0) < 20) { return undefined; }
    return { from: frame.screen.place.id, to: exit.destination.id, way: exit.way ?? exit.name,
      minutes: choice.minutes ?? 0 };
  }
  journey(travel: Travel): number {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { return 0; }
    return Math.min(2200, 900 + travel.minutes * 6);
  }
  readonly back = () => {
    const s = this.state;
    if (s.help) { this.setState({ help: false }); }
    else if (s.trail.length) { this.setState({ trail: s.trail.slice(0, -1), cursor: 0 }); }
    else if (s.view !== 'here') { this.setState({ view: 'here', cursor: 0 }); }
    else if (s.history) { this.setState({ history: false }); }
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
      : frame?.combat ? 'combat' : { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map' }[s.view];
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
      case 'company': return <CompanyPage.View app={this} />;
      case 'loading': return <LoadingPage.View app={this} />;
      case 'play': return <PlaySurface.View app={this} />;
    }
  }
}
