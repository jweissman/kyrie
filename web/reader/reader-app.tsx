import { Component, type ReactNode } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import type { Catalog, CompanyView, Entry, Frame, Member, Message, Setting } from '../engine/protocol';
import { EngineClient } from './engine-client';
import { MenuModel, type Menu, type View } from './menu-model';
import { Conversation, type TalkLine } from './conversation';
import type { Attention } from '../../src/ui/attention';
import { ReaderStore, type SavedGame } from './reader-store';
import { ReaderKeys } from './reader-keys';
import { ReaderOpening } from './reader-opening';
import { Timings } from './timings';
import { TitlePage } from './title-page';
import { CampaignPage } from './campaign-page';
import { CompanyPage } from './company-page';
import { CreationPage } from './creation/creation-page';
import { LoadingPage } from './loading-page';
import { PlayPage } from './play-page';
import { OptionsPage } from './options-page';
import { ReaderOptions, type Options } from './reader-options';
import { Shell } from './shell';
import { Stage } from './stage/stage';
import { Act } from './stage/act';

export type Phase = 'title' | 'options' | 'campaigns' | 'company' | 'loading' | 'play';
// A journey under way: from where, to where, by what way and how long. Said while the engine works it out, never
// held on the screen for its own sake.
export interface Travel { from: string; to: string; way: string; minutes: number }
// Where the company last chose in a fight: how many exchanges had been told, and how each fighter then stood, so the
// page can show what happened since and what each blow took.
export interface FightMark { seen: number; hp: Record<string, number>; first: boolean }
export interface AppState {
  phase: Phase; catalog?: Catalog; saved?: SavedGame; options: Options;
  campaign: string; seed: string; setting?: Setting; party: Member[]; preview?: CompanyView; editing: number;
  origin?: string;
  // Whether the protagonist's name is one the player wrote: a name drawn for them is drawn again for a new people.
  named?: boolean;
  // Someone who died in this country before, whom it will remember when it is begun again.
  memorial?: import('../../src/world/memorial').Memorial;
  frame?: Frame; view: View; cursor: number; hovered?: string; member: string;
  // Which beat of a new game's opening is shown, while it is, and when it came (see PrologueStage).
  prologue?: number; beat?: number;
  // Whether the company is setting out from the choice of a life: the page says only that, over the country.
  leaving?: boolean;
  // The choices that are open, showing what can be done with them (what to say to someone, what to buy).
  open: string[];
  // Whether the keys are being used: only then is the choice they are on shown.
  keyed?: boolean;
  pending?: { said: string; travel?: Travel };
  // What the player is attending to (the place, someone spoken with, one thing looked at), what has been said in
  // the conversation under way, and which of its questions have been put already.
  attention: Attention; talk: TalkLine[]; asked: string[];
  fight?: FightMark;
  // A choice that cannot be undone, chosen once: its cost is said, and it is done if chosen again.
  confirming?: string;
  stage: string; error: string; help: boolean;
  // The whole story so far, asked for when the Story is opened (frames carry only its last entries).
  story?: Entry[];
  // Whether the last game the engine kept could not be kept in this browser (see ReaderStore.write).
  unkept?: boolean;
  // The thing the last command was done to, from its own page: what came of it is told there, and not under another
  // thing looked at after (leave taken of the steward, told under his hook).
  acted?: string;
}

// The page. The engine decides everything that happens; this keeps what is on show, which choice the keys are on,
// what is open, and what is under way, and turns keys, clicks and the engine's frames into state.
export class ReaderApp extends Component<{ query: URLSearchParams }, AppState> {
  readonly engine = new EngineClient(this.listen.bind(this));
  readonly keys = new ReaderKeys(this);
  readonly opening = new ReaderOpening(this);
  override state: AppState = ReaderApp.initial(ReaderStore.read());
  private static initial(saved?: SavedGame): AppState {
    return { phase: 'title', options: ReaderOptions.read(), campaign: '', seed: '', party: [], editing: -1, view: 'here',
      cursor: 0, open: [],
      attention: Conversation.place, talk: [], asked: [],
      member: '', stage: '', error: '', help: false, ...saved ? { saved } : {} };
  }
  override componentDidMount() {
    window.addEventListener('keydown', this.keys.press);
    ReaderOptions.apply(this.state.options);
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
        ReaderApp.top();
      }
    }
    // So does someone or something turned to (a phone kept the place's scroll, and opened a portrait at its chest).
    const [was, now] = [prev.attention, this.state.attention];
    if (now.kind !== 'place' && (was.kind !== now.kind || was.id !== now.id)) { ReaderApp.top(); }
    if (prev.cursor !== this.state.cursor && prev.frame === frame && this.state.keyed && !this.state.hovered) {
      // On the sheet raised over a place, when it is there too (a way rowed under the glance and among every way).
      const at = `[data-action="choice"][data-index="${this.state.cursor}"]`;
      const chosen = document.querySelector<HTMLElement>(`[aria-modal="true"] ${at}`) ?? document.querySelector<HTMLElement>(at);
      chosen?.focus({ preventScroll: true });
      chosen?.scrollIntoView({ block: 'nearest' });
    }
  }
  // The page, and each leaf of it that scrolls, back at its top.
  static top() {
    window.scrollTo({ top: 0 });
    const leaves = '.leaves, .verso, .recto, .scene, .on-pane, .ways-all, .book, .lines';
    for (const leaf of document.querySelectorAll<HTMLElement>(leaves)) { leaf.scrollTop = 0; }
  }
  private listen(message: Message) {
    if (message.kind === 'saved') {
      const started = performance.now(), size = message.save.length + (message.world?.text.length ?? 0);
      // A state is kept only beside the world it was kept against; the engine is told whether its world is kept here,
      // so that one not kept goes again with the next (the architecture review's A3).
      const beside = !!message.world || ReaderStore.holds(message.key);
      const saved = beside ? ReaderStore.write(message.save, message.summary, message.world) : undefined;
      if (message.world || !beside) {
        void this.engine.request({ kind: 'kept', key: message.key, ok: !!saved }).catch(() => undefined);
      }
      if (saved) { this.setState({ saved, unkept: false }, () => Timings.kept(performance.now() - started, size)); }
      // Not kept (the browser's storage is full, or refused): the player is told, and given the save to take.
      else if (!this.state.unkept) { this.setState({ unkept: true }); }
    } else if (message.kind === 'unkept') { if (!this.state.unkept) { this.setState({ unkept: true }); } }
    else if (message.kind === 'progress') { this.setState({ stage: message.stage }); }
    else if (message.kind === 'frame') {
      const combat = message.frame.combat, fight = combat ? this.state.frame?.combat ? this.state.fight
        : { seen: 0, hp: {}, first: true } : undefined;
      this.setState({ frame: message.frame, pending: undefined, cursor: 0, open: [], hovered: undefined, fight,
        attention: Conversation.place, talk: [], asked: [], confirming: undefined });
    }
  }
  private built?: { frame?: Frame; view: View; open: string[]; attention: Attention; member: string; menu: Menu };
  // What can be chosen now, built once for each frame, view, attention, member shown and set of open choices.
  get menu(): Menu {
    const { frame, view, open, attention, member } = this.state, b = this.built;
    if (b && b.frame === frame && b.view === view && b.open === open && b.attention === attention && b.member === member) {
      return b.menu;
    }
    this.built = { frame, view, open, attention, member, menu: MenuModel.build(frame, view, open, { attention, member }) };
    return this.built.menu;
  }
  // A choice made: what it opens is shown beneath it (or put away again); a fight goes on; or the company does it.
  readonly choose = (choice: Choice) => {
    const { frame, pending, open } = this.state;
    if (pending || choice.disabled || !frame) { return; }
    if (frame.combat?.outcome) { this.onward(); return; }
    const turned = Conversation.turn(choice);
    if (turned) { this.attend(choice, turned); return; }
    if (choice.children) {
      const shut = open.includes(choice.id), siblings = MenuModel.siblings(this.menu, choice.id);
      // In the company, a member's row is the member: their sheet is shown as what they can do opens (a caster's row
      // opened their spells and left the first member's sheet, the follow-up review found).
      const member = this.state.view === 'company' && frame.screen.party.some(m => m.id === choice.id)
        ? choice.id : this.state.member;
      this.setState({ open: shut ? open.filter(id => id !== choice.id)
        : [...open.filter(id => !siblings.includes(id)), choice.id], hovered: undefined, member });
      return;
    }
    if (!choice.command) { if (this.state.view === 'company') { this.setState({ member: choice.id }); } return; }
    // A pointer to a book (a development to spend is spent in the character).
    const book = /^view:(\w+)(?::(.+))?$/.exec(choice.command);
    if (book) { this.show(book[1] as View, book[2]); return; }
    // Nothing that cannot be undone is done by a slip: it is said first, and done when chosen again.
    // So is a fight the company could lose, as it reckons it (see Marks).
    if (Act.asks(choice) && this.state.confirming !== choice.id) { this.setState({ confirming: choice.id }); return; }
    const said = MenuModel.said(this.menu, choice);
    Timings.chosen(said);
    if (frame.combat) {
      this.setState({ pending: { said }, fight: ReaderApp.mark(frame) });
      this.engine.request({ kind: 'fight', choice: choice.command }).catch(this.failed);
      return;
    }
    void this.perform(choice, said);
  };
  // Attention turned: to someone (saying so to them, when the world has a way to), to a thing, or back to the place
  // (taking leave, when there is leave to take).
  private attend(choice: Choice, attention: Attention) {
    // A conversation opens on what they were doing when the company came over.
    const doing = attention.kind === 'person' ? this.menu.scene?.subjects.find(x => x.id === attention.id)?.says?.[0] : undefined;
    this.setState({ attention, open: [], cursor: 0, hovered: undefined, keyed: false,
      talk: attention.kind !== 'person' ? this.state.talk : doing ? [{ kind: 'telling', text: doing }] : [], asked: [] });
    if (choice.command) { void this.perform(choice, choice.label, attention); }
  }
  // Automation (kyrieMono.act): a command done by its id, as choosing it would, and timed as a choice is.
  readonly act = (command: string, said: string) => {
    if (this.state.pending || !this.state.frame) { return; }
    Timings.chosen(said);
    void this.perform({ id: command, label: said, command } as unknown as Choice, said);
  };
  // Let the companion whose turn it is fight this turn on their own.
  readonly auto = () => {
    if (!this.state.frame?.combat?.ours || this.state.pending) { return; }
    this.setState({ pending: { said: 'Fighting on' }, fight: ReaderApp.mark(this.state.frame) });
    void this.engine.request({ kind: 'fight' });
  };
  // On from a fight that has ended, to the place it was fought in.
  private onward() {
    const frame = this.state.frame!;
    this.setState({ frame: { ...frame, combat: undefined }, fight: undefined, cursor: 0, open: [], hovered: undefined });
  }
  private static mark(frame: Frame): FightMark {
    const c = frame.combat!;
    return { seen: (c.exchanges.at(-1)?.n ?? -1) + 1, first: false,
      hp: Object.fromEntries([...c.foes, ...c.allies].map(f => [f.id, f.hp])) };
  }
  private readonly failed = (error: unknown) => {
    this.setState({ pending: undefined, error: error instanceof Error ? error.message : String(error) });
  };
  private async perform(choice: Choice, said: string, turning?: Attention) {
    const frame = this.state.frame!, travel = MenuModel.travel(choice, frame);
    this.setState({ pending: { said, ...travel ? { travel } : {} }, error: '' });
    try {
      const journey = /^travel:(.+)$/.exec(choice.command!)?.[1], unbind = choice.command === MenuModel.unbind;
      const next = journey ? await this.engine.request<Frame>({ kind: 'travel', destination: journey })
        : unbind ? await this.engine.request<Frame>({ kind: 'unbind' })
          : await this.engine.request<Frame>({ kind: 'perform', command: choice.command! });
      // What is done from the pack or the company page in the middle of a conversation is not said in it: the follow-up
      // review tended a wound from the pack and was put back in the creditor's dialogue, the bandaging told there.
      const aside = !turning && (this.state.view === 'pack' || this.state.view === 'company');
      const attention = aside ? Conversation.place : Conversation.holds(turning ?? this.state.attention, frame, next);
      const person = attention.kind === 'person';
      const talk = person ? [...this.state.talk, ...Conversation.lines(next, choice, said)] : [];
      this.setState({ frame: next, pending: undefined, cursor: 0, open: this.kept(next, attention), hovered: undefined,
        // Set out from the map, the journey is told where it arrives; anything else done from the map or the company
        // leaves it open.
        view: !journey && ['map', 'company'].includes(this.state.view) ? this.state.view : 'here', stage: '', attention, talk,
        asked: person && !turning ? [...this.state.asked, choice.id] : [],
        acted: this.state.attention.kind === 'thing' ? this.state.attention.id : undefined });
    } catch (error) { this.failed(error); }
  }
  // A conversation goes on: what was open with someone (what to buy from them) stays open, if they are still there
  // with more to offer. Anything else is put away.
  private kept(next: Frame, attention: Attention): string[] {
    const subjects = MenuModel.build(next, 'here', [], { attention }).scene?.subjects ?? [];
    return this.state.open.filter(id => subjects.some(s => s.kind !== 'thing' && s.choices.some(c => c.id === id && c.children)));
  }
  readonly back = () => {
    const s = this.state;
    if (s.frame?.combat?.outcome) { this.onward(); }
    else if (s.help) { this.setState({ help: false }); }
    else if (s.open.length) { this.setState({ open: s.open.slice(0, -1), cursor: 0 }); }
    else if (s.view !== 'here') { this.setState({ view: 'here', cursor: 0 }); }
    else if (s.attention.kind === 'person' && this.menu.talk) { this.choose(this.menu.talk.leave); }
    else if (s.attention.kind !== 'place') { this.setState({ attention: Conversation.place, cursor: 0 }); }
  };
  show(view: View, who?: string) {
    if (this.state.frame?.combat && view !== 'here') { return; }
    const member = who ?? (this.state.member || (this.state.frame?.screen.party[0]?.id ?? ''));
    this.setState({ view: this.state.view === view ? 'here' : view, cursor: 0, open: [], hovered: undefined, member });
    if (view === 'story' && this.state.view !== 'story') {
      this.setState({ story: undefined });
      void this.engine.request<Entry[]>({ kind: 'story' }).then(story => { this.setState({ story }); });
    }
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
    const mode = s.phase !== 'play' ? { title: 'title', options: 'options', campaigns: 'campaigns', company: 'create',
      loading: 'create' }[s.phase]
      : Stage.prologue(this) ? 'prologue' : frame?.combat ? 'combat' : s.view === 'here' && s.attention.kind !== 'place'
        ? { person: 'talk', thing: 'examine' }[s.attention.kind] : { here: 'explore', company: 'party', pack: 'pack',
          journal: 'journal', map: 'map', story: 'story' }[s.view];
    return { mode, place: frame?.screen.place, path: frame?.screen.path,
      attention: s.attention, talk: s.talk,
      sections: menu.sections.map(sec => ({ id: sec.id, title: sec.title, choices: sec.choices.map(MenuModel.shape) })),
      choices: menu.choices.map(MenuModel.shape), selected: s.keyed ? menu.choices[s.cursor]?.id : undefined, trail: s.open,
      // A place at a glance: how the company came, what it leads with and why, the ways it rows; where the rest is drawn;
      // and a choice chosen once that asks again before it is done.
      ...frame?.leaf.glance && menu.sheets && s.view === 'here' && s.attention.kind === 'place' && !frame.combat
        ? { glance: { arrival: frame.leaf.glance.arrival, sight: frame.leaf.glance.sight?.id,
          acts: frame.leaf.glance.acts.map(a => ({ choice: a.choice, why: a.why, marks: a.marks.map(m => m.kind) })),
          ways: frame.leaf.glance.ways }, sheets: menu.sheets } : {},
      ...s.confirming ? { confirming: s.confirming } : {},
      combat: frame?.combat, log: (frame?.entries ?? []).slice(-5), party: frame?.screen.party.map(m => ({ name: m.name,
        hp: m.hp })), pending: !!s.pending || s.phase === 'loading', error: s.error, timings: Timings.list,
      keeps: Timings.keeps };
  }
  exportTranscript() { return this.state.frame?.transcript; }
  override render(): ReactNode {
    return <Shell.View app={this}>{this.page()}</Shell.View>;
  }
  private page(): ReactNode {
    switch (this.state.phase) {
      case 'title': return <TitlePage.View app={this} />;
      case 'options': return <OptionsPage.View app={this} />;
      case 'campaigns': return <CampaignPage.View app={this} />;
      case 'company': return this.state.setting?.generated ? <CreationPage.View app={this} /> : <CompanyPage.View app={this} />;
      case 'loading': return <LoadingPage.View app={this} />;
      case 'play': return <PlayPage.View app={this} />;
    }
  }
}
