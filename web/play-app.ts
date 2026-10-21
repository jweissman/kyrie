import { WorldAssembler } from '../src/world/world-assembler';
import type { BundleSource } from '../src/campaign/bundle-source';
import type { CampaignManifest } from '../src/campaign/module-bundle';
import partyExamples from '../data/campaigns/companies.json';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ScreenModel } from '../src/ui/screen-model';
import { CombatModel } from '../src/ui/combat-model';
import { ChoiceList, type Choice, type Section } from '../src/ui/choice-list';
import type { Battle } from '../src/battle';
import type { CreatureGenerationContext } from '../src/content';
import type { Command } from '../src/model';
import type { Screen } from '../src/ui/screen-types';
import { Scenarios } from './scenarios';
import { PlayFrame } from './play-frame';
import { PlayOpening, type Opening } from './play-opening';
import { PlayCreate, type Draft } from './play-create';
import { PlayStore, type Saved } from './play-store';
import { PlayTranscript } from './play-transcript';
import { PlayInput } from './play-input';
import type { Entry, Mode, PlayState } from './play-types';

// The game's controller. Every consequence is a PlaySession command; this class only tracks what is on show, what is
// highlighted, which short list is open, and what the page has told so far.
export class PlayApp {
  session?: PlaySession;
  mode: Mode = 'title';
  cursor = 0;
  trail: string[] = [];
  log: Entry[] = [];
  turn?: { battle: Battle; resolve: (c: Command) => void };
  opening: string[] = [];
  pending = false;
  doing = '';
  error = '';
  screen?: Screen;
  history = false;
  saved?: Saved;
  start: Opening = { campaigns: [], cursor: 0 };
  draft: Draft = { seed: 'serewater', party: PlayApp.preset('fellowship') };
  readonly query = new URLSearchParams(location.search);
  manifest = PlayApp.campaign(this.query.get('campaign'));
  // ?world=<seed>[&terrain=…]: a generated region with situated adventures instead of an authored campaign.
  world?: { path: string; source: BundleSource; campaign: CampaignManifest };
  worldSeed = this.query.get('world');
  private readonly input = new PlayInput(this);
  // ?campaign= names a manifest by its path, or a bundled campaign by its id ("serewater-march").
  static campaign(asked: string | null): string {
    if (!asked) { return 'data/campaigns/serewater-march.campaign.json'; }
    const path = `data/campaigns/${asked.replace(/\.campaign\.json$/, '')}.campaign.json`;
    return Scenarios.files[asked] || !Scenarios.files[path] ? asked : path;
  }
  static readonly companies = (partyExamples as { companies: { id: string; label: string; note: string;
    members: CreatureGenerationContext[] }[] }).companies;
  static preset(id: string): CreatureGenerationContext[] {
    return structuredClone((this.companies.find(c => c.id === id) ?? this.companies[0]!).members);
  }
  static readonly presets = PlayApp.companies.map(({ id, label, note }) => ({ id, label, note }));
  company(id: string): CreatureGenerationContext[] { return PlayApp.preset(id); }
  constructor(readonly root: HTMLElement) {
    this.start.campaigns = [
      ...Scenarios.list.map(s => ({ id: s.manifest, title: s.title, note: s.note, detail: s.detail,
        ...(s.recommended ? { recommended: true } : {}) })),
      { id: 'world', title: 'A generated region',
        note: 'Deem draws a region (its towns, people, faith and wild places) and the assembler sets adventures in it.',
        detail: 'Three settlements and three adventures · seed “thorn”' }];
  }
  boot() {
    this.input.listen();
    this.saved = PlayStore.read();
    // A saved game always offers itself first; a campaign named in the address is where a new one would begin.
    if (!this.saved && this.query.has('campaign')) { this.choose(this.manifest); }
    else if (!this.saved && this.worldSeed) { void this.generate(this.worldSeed); }
    this.render();
  }
  async generate(seed: string) {
    this.pending = true; this.mode = 'create'; this.render();
    try {
      const terrain = this.query.get('terrain');
      const world = await WorldAssembler.assemble(seed, Scenarios.source(),
        { ...terrain ? { region: { terrain } } : {} });
      const campaign = JSON.parse(await world.source.read(world.path)) as CampaignManifest;
      this.world = { path: world.path, source: world.source, campaign };
      this.manifest = world.path; this.draft.seed = seed; this.worldSeed = seed;
      if (campaign.party) { this.draft.party = structuredClone(campaign.party); }
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.pending = false; this.render(); }
  }
  choose(manifest: string) {
    if (manifest === 'world') { void this.generate(this.worldSeed ?? 'thorn'); return; }
    this.manifest = manifest; this.world = undefined; this.worldSeed = null; this.mode = 'create';
    const entry = Scenarios.list.find(s => s.manifest === manifest);
    if (entry) { this.draft.seed = entry.seed; }
    const declared = (JSON.parse(Scenarios.files[manifest] ?? '{}') as { party?: CreatureGenerationContext[] }).party;
    this.draft.party = declared ? structuredClone(declared) : PlayApp.preset('fellowship');
  }
  resume() {
    if (!this.saved) { return; }
    try {
      this.session = PlaySession.resume(this.saved.checkpoint);
      this.log = this.saved.log ?? []; this.mode = 'explore'; this.reset();
    } catch (error) {
      this.session = undefined;
      this.error = `The saved game could not be resumed (${error instanceof Error ? error.message : String(error)}). `
        + 'It stays in this browser until a new company sets out.';
    }
  }
  persist() { if (this.session) { this.saved = PlayStore.write(this.session, this.log) ?? this.saved; } }
  reset() { this.cursor = 0; this.trail = []; }
  // The sections for the current mode, the list on show (the top level or what the trail opened), and the trail.
  view(): { sections: Section[]; level: Choice[]; trail: Choice[] } {
    const sections = this.mode === 'combat' && this.turn ? ChoiceList.combat(CombatModel.build(this.turn.battle))
      : !this.screen ? [] : this.mode === 'pack' ? ChoiceList.pack(this.screen) : this.mode === 'party'
        ? ChoiceList.party(this.screen) : this.mode === 'explore' ? ChoiceList.explore(this.screen) : [];
    const trail: Choice[] = [];
    for (const id of this.trail) {
      const found = ChoiceList.find(sections, id);
      if (!found?.children) { break; }
      trail.push(found);
    }
    if (trail.length !== this.trail.length) { this.trail = trail.map(c => c.id); }
    const level = trail.length ? trail.at(-1)!.children! : ChoiceList.all(sections);
    return { sections, level, trail };
  }
  get state(): PlayState {
    const { sections, level, trail } = this.view();
    this.cursor = Math.min(Math.max(0, this.cursor), Math.max(0, level.length - 1));
    return { mode: this.mode, ...(this.screen ? { screen: this.screen } : {}),
      ...(this.turn ? { combat: CombatModel.build(this.turn.battle) } : {}), opening: this.opening,
      sections, level, trail, cursor: this.cursor, log: this.log, pending: this.pending,
      ...(this.doing ? { doing: this.doing } : {}), error: this.error, history: this.history,
      narrow: window.matchMedia('(max-width: 719px)').matches,
      chronicle: this.session ? PlayerView.chronicle(this.session.campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })) : [] };
  }
  render() {
    if (!this.session || ['title', 'campaigns', 'create'].includes(this.mode)) { this.root.innerHTML = this.opener(); return; }
    if (!this.turn && !this.session.acting) { this.screen = ScreenModel.build(this.session.campaign); }
    this.input.redraw(PlayFrame.render(this.state));
  }
  private opener(): string {
    if (this.mode === 'campaigns') { return PlayOpening.campaigns(this.start); }
    if (this.mode === 'create') {
      const campaign = this.world?.campaign
        ?? JSON.parse(Scenarios.files[this.manifest] ?? '{"name":"A generated region"}') as CampaignManifest;
      return PlayCreate.render(this.draft, this.error, campaign, { presets: PlayApp.presets, generated: !!this.world });
    }
    const saved = this.saved ? PlayStore.summary(this.saved) : undefined;
    return PlayOpening.title({ ...this.start, ...(saved ? { saved } : {}) }, this.error);
  }
  // The fight's controller: the page turns to the fight, opening with what started it.
  readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    if (!this.turn && this.mode !== 'combat') { this.opening = this.begun(); }
    this.turn = { battle, resolve }; this.mode = 'combat'; this.pending = false; this.reset();
    this.render();
  });
  // What was seen and said in the moment the company was set upon, if it was.
  private begun(): string[] {
    const last = this.session?.campaign.events.at(-1);
    return [...(last?.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text), ...(last?.response ? [last.response] : [])];
  }
  answer(command: Command) {
    const turn = this.turn;
    if (!turn) { return; }
    this.turn = undefined; this.pending = true; this.reset();
    turn.resolve(command);
  }
  async run(command: string, context: { said: string; move: boolean }) {
    if (!this.session || this.pending) { return; }
    const campaign = this.session.campaign, before = PlayerView.observe(campaign);
    this.pending = true; this.doing = context.said; this.error = ''; this.render();
    try {
      const event = await this.session.perform(command, this.controller);
      const after = PlayerView.observe(campaign), feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      this.log.push(PlayTranscript.entry(event, feedback, { ...context, moved, place: after.location?.id ?? '',
        placeName: after.location?.name ?? '', elapsed: event.elapsed }));
      if (this.mode === 'combat') { this.mode = 'explore'; }
      this.opening = []; this.history = false; this.reset(); this.persist();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.turn = undefined; if (this.mode === 'combat') { this.mode = 'explore'; }
    } finally { this.pending = false; this.doing = ''; this.render(); }
  }
  async begin() {
    if (this.pending) { return; }
    this.pending = true; this.error = ''; this.render();
    try {
      const terrain = this.query.get('terrain');
      const world = this.worldSeed ? await WorldAssembler.assemble(this.worldSeed, Scenarios.source(),
        { ...terrain ? { region: { terrain } } : {}, party: this.draft.party }) : undefined;
      this.session = await PlaySession.start(world?.path ?? this.manifest, this.draft.seed,
        world?.source ?? Scenarios.source(), this.draft.party);
      this.mode = 'explore'; this.log = []; this.reset(); this.persist();
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.pending = false; this.render(); }
  }
  exportTranscript() { return this.session?.transcript; }
  private static shape(c: Choice) {
    return { id: c.id, label: c.label, ...(c.command ? { command: c.command } : {}),
      ...(c.children ? { children: c.children.length } : {}), ...(c.disabled ? { disabled: c.disabled } : {}) };
  }
  // Test and automation hook: the same semantic state the page draws.
  inspect() {
    const s = this.state;
    return { mode: s.mode, place: s.screen?.place, path: s.screen?.path,
      sections: s.sections.map(sec => ({ id: sec.id, title: sec.title,
        choices: sec.choices.map(c => PlayApp.shape(c)) })),
      choices: s.level.map(c => PlayApp.shape(c)), selected: s.level[s.cursor]?.id, trail: s.trail.map(c => c.label),
      combat: s.combat, log: s.log.slice(-5), party: s.screen?.party.map(m => ({ name: m.name, hp: m.hp })),
      pending: s.pending, error: s.error };
  }
}
