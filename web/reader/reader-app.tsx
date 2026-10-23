import { Component, type ReactNode } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import type { Catalog, CompanyView, Frame, Member, Message, Setting } from '../engine/protocol';
import { EngineClient } from './engine-client';
import { MenuModel, type Menu, type View } from './menu-model';
import { ReaderStore, type SavedGame } from './reader-store';
import { ReaderKeys } from './reader-keys';
import { ReaderOpening } from './reader-opening';
import { Timings } from './timings';
import { TitlePage } from './title-page';
import { CampaignPage } from './campaign-page';
import { CompanyPage } from './company-page';
import { ProtagonistPage } from './protagonist-page';
import { LoadingPage } from './loading-page';
import { PlayPage } from './play-page';

export type Phase = 'title' | 'campaigns' | 'company' | 'loading' | 'play';
// A journey under way: from where, to where, by what way and how long. Said while the engine works it out, never
// held on the screen for its own sake.
export interface Travel { from: string; to: string; way: string; minutes: number }
// Where the company last chose in a fight: how many exchanges had been told, and how each fighter then stood, so the
// page can show what happened since and what each blow took.
export interface FightMark { seen: number; hp: Record<string, number>; first: boolean }
export interface AppState {
  phase: Phase; catalog?: Catalog; saved?: SavedGame;
  campaign: string; seed: string; setting?: Setting; party: Member[]; preview?: CompanyView; editing: number;
  origin?: string;
  frame?: Frame; view: View; cursor: number; hovered?: string; member: string;
  // The choices that are open, showing what can be done with them (what to say to someone, what to buy).
  open: string[];
  // Whether the keys are being used: only then is the choice they are on shown.
  keyed?: boolean;
  pending?: { said: string; travel?: Travel };
  fight?: FightMark;
  stage: string; error: string; help: boolean;
}

// The page. The engine decides everything that happens; this keeps what is on show, which choice the keys are on,
// what is open, and what is under way, and turns keys, clicks and the engine's frames into state.
export class ReaderApp extends Component<{ query: URLSearchParams }, AppState> {
  readonly engine = new EngineClient(this.listen.bind(this));
  readonly keys = new ReaderKeys(this);
  readonly opening = new ReaderOpening(this);
  override state: AppState = ReaderApp.initial(ReaderStore.read());
  private static initial(saved?: SavedGame): AppState {
    return { phase: 'title', campaign: '', seed: '', party: [], editing: -1, view: 'here', cursor: 0, open: [],
      member: '', stage: '', error: '', help: false, ...saved ? { saved } : {} };
  }
  override componentDidMount() {
    window.addEventListener('keydown', this.keys.press);
    void this.opening.boot();
  }
  override componentWillUnmount() { window.removeEventListener('keydown', this.keys.press); }
  // A new place opens at the top; what came of something done at the same place is in view where it is told; the
  // choice the keys are on is brought into view with them.
  override componentDidUpdate(_props: unknown, prev: AppState) {
    const frame = this.state.frame;
    if (frame && prev.frame !== frame) {
      Timings.painted(frame);
      if (!prev.frame || frame.combat || prev.frame.combat || prev.frame.screen.place.id !== frame.screen.place.id) {
        window.scrollTo({ top: 0 });
      }
    }
    if (prev.cursor !== this.state.cursor && prev.frame === frame && this.state.keyed && !this.state.hovered) {
      const chosen = document.querySelector<HTMLElement>(`[data-action="choice"][data-index="${this.state.cursor}"]`);
      chosen?.focus({ preventScroll: true });
      chosen?.scrollIntoView({ block: 'nearest' });
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
      this.setState({ frame: message.frame, pending: undefined, cursor: 0, open: [], hovered: undefined, fight });
    }
  }
  private built?: { frame?: Frame; view: View; open: string[]; menu: Menu };
  // What can be chosen now, built once for each frame, view and set of open choices.
  get menu(): Menu {
    const { frame, view, open } = this.state, b = this.built;
    if (b && b.frame === frame && b.view === view && b.open === open) { return b.menu; }
    this.built = { frame, view, open, menu: MenuModel.build(frame, view, open) };
    return this.built.menu;
  }
  // A choice made: what it opens is shown beneath it (or put away again); a fight goes on; or the company does it.
  readonly choose = (choice: Choice) => {
    const { frame, pending, open } = this.state;
    if (pending || choice.disabled || !frame) { return; }
    if (choice.children) {
      const shut = open.includes(choice.id), siblings = MenuModel.siblings(this.menu, choice.id);
      this.setState({ open: shut ? open.filter(id => id !== choice.id)
        : [...open.filter(id => !siblings.includes(id)), choice.id], hovered: undefined });
      return;
    }
    if (!choice.command) { if (this.state.view === 'company') { this.setState({ member: choice.id }); } return; }
    const said = MenuModel.said(this.menu, choice);
    Timings.chosen(said);
    if (frame.combat) {
      this.setState({ pending: { said }, fight: ReaderApp.mark(frame) });
      this.engine.request({ kind: 'fight', choice: choice.command }).catch(this.failed);
      return;
    }
    void this.perform(choice, said);
  };
  // Let the companion whose turn it is fight this turn on their own.
  readonly auto = () => {
    if (!this.state.frame?.combat?.ours || this.state.pending) { return; }
    this.setState({ pending: { said: 'Fighting on' }, fight: ReaderApp.mark(this.state.frame) });
    void this.engine.request({ kind: 'fight' });
  };
  private static mark(frame: Frame): FightMark {
    const c = frame.combat!;
    return { seen: (c.exchanges.at(-1)?.n ?? -1) + 1, first: false,
      hp: Object.fromEntries([...c.foes, ...c.allies].map(f => [f.id, f.hp])) };
  }
  private readonly failed = (error: unknown) => {
    this.setState({ pending: undefined, error: error instanceof Error ? error.message : String(error) });
  };
  private async perform(choice: Choice, said: string) {
    const frame = this.state.frame!, travel = MenuModel.travel(choice, frame);
    this.setState({ pending: { said, ...travel ? { travel } : {} }, error: '' });
    try {
      const next = await this.engine.request<Frame>({ kind: 'perform', command: choice.command!, said,
        move: choice.tone === 'way', named: choice.tone !== 'way' });
      this.setState({ frame: next, pending: undefined, cursor: 0, open: this.kept(next), hovered: undefined,
        view: this.state.view === 'map' ? 'map' : 'here', stage: '' });
    } catch (error) { this.failed(error); }
  }
  // A conversation goes on: what was open with someone (what to buy from them) stays open, if they are still there
  // with more to offer. Anything else is put away.
  private kept(next: Frame): string[] {
    const subjects = MenuModel.build(next, 'here', []).scene?.subjects ?? [];
    return this.state.open.filter(id => subjects.some(s => s.kind !== 'thing' && s.choices.some(c => c.id === id && c.children)));
  }
  readonly back = () => {
    const s = this.state;
    if (s.help) { this.setState({ help: false }); }
    else if (s.open.length) { this.setState({ open: s.open.slice(0, -1), cursor: 0 }); }
    else if (s.view !== 'here') { this.setState({ view: 'here', cursor: 0 }); }
  };
  show(view: View) {
    if (this.state.frame?.combat && view !== 'here') { return; }
    const member = this.state.member || (this.state.frame?.screen.party[0]?.id ?? '');
    this.setState({ view: this.state.view === view ? 'here' : view, cursor: 0, open: [], hovered: undefined, member });
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
      choices: menu.choices.map(MenuModel.shape), selected: menu.choices[s.cursor]?.id, trail: s.open,
      combat: frame?.combat, log: (frame?.entries ?? []).slice(-5), party: frame?.screen.party.map(m => ({ name: m.name,
        hp: m.hp })), pending: !!s.pending || s.phase === 'loading', error: s.error, timings: Timings.list };
  }
  exportTranscript() { return this.state.frame?.transcript; }
  override render(): ReactNode {
    switch (this.state.phase) {
      case 'title': return <TitlePage.View app={this} />;
      case 'campaigns': return <CampaignPage.View app={this} />;
      case 'company': return this.state.setting?.generated ? <ProtagonistPage.View app={this} /> : <CompanyPage.View app={this} />;
      case 'loading': return <LoadingPage.View app={this} />;
      case 'play': return <PlayPage.View app={this} />;
    }
  }
}
