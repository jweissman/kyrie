import { WorldAssembler } from '../src/world/world-assembler';
import type { BundleSource } from '../src/campaign/bundle-source';
import type { CampaignManifest } from '../src/campaign/module-bundle';
import partyExamples from '../data/campaigns/companies.json';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { Narration } from '../src/presentation/narration';
import { ScreenModel } from '../src/ui/screen-model';
import { CombatModel } from '../src/ui/combat-model';
import { ChoiceList, type Choice, type Section } from '../src/ui/choice-list';
import { Tactics } from '../src/tactics';
import type { Battle } from '../src/battle';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { CreatureGenerationContext } from '../src/content';
import type { Command } from '../src/model';
import type { LogEntry, Screen } from '../src/ui/screen-types';
import { Scenarios } from './scenarios';
import { MonoRender, type Mode, type MonoState } from './mono-render';
import { MonoScreens, type Draft, type Opening } from './mono-screens';

interface Saved { checkpoint: Parameters<typeof PlaySession.resume>[0]; log?: LogEntry[] }

// Game-screen controller. All consequences are PlaySession commands; this class only tracks what is on show, what
// is highlighted and which short list is open.
export class MonoApp {
  private session?: PlaySession;
  private mode: Mode = 'title';
  private cursor = 0;
  private trail: string[] = [];
  private log: LogEntry[] = [];
  private turn?: { battle: Battle; resolve: (c: Command) => void };
  private pending = false;
  private error = '';
  private screen?: Screen;
  private history = false;
  private saved?: Saved;
  private opening: Opening = { campaigns: [], cursor: 0 };
  private draft: Draft = { seed: 'serewater', party: MonoApp.preset('fellowship') };
  private readonly key = 'kyrie.mono.v1';
  private readonly query = new URLSearchParams(location.search);
  private manifest = MonoApp.campaign(this.query.get('campaign'));
  // ?world=<seed>[&terrain=…]: a generated region with situated scenarios instead of an authored campaign.
  private world?: { path: string; source: BundleSource; campaign: CampaignManifest };
  private worldSeed = this.query.get('world');
  // ?campaign= names a manifest by its path, or a bundled campaign by its id ("serewater-march").
  static campaign(asked: string | null): string {
    if (!asked) { return 'data/campaigns/serewater-march.campaign.json'; }
    const path = `data/campaigns/${asked.replace(/\.campaign\.json$/, '')}.campaign.json`;
    return Scenarios.files[asked] || !Scenarios.files[path] ? asked : path;
  }
  constructor(private root: HTMLElement) {
    this.opening.campaigns = [
      ...Scenarios.list.map(s => ({ id: s.manifest, title: s.title, note: s.note, detail: s.detail,
        ...(s.recommended ? { recommended: true } : {}) })),
      { id: 'world', title: 'A generated region',
        note: 'Deem draws a region (its towns, people, faith and wild places) and situates authored adventures in it.',
        detail: 'Three settlements and three adventures · seed “thorn”' }];
  }
  static readonly companies = (partyExamples as { companies: { id: string; label: string; note: string;
    members: CreatureGenerationContext[] }[] }).companies;
  static preset(id: string): CreatureGenerationContext[] {
    return structuredClone((this.companies.find(c => c.id === id) ?? this.companies[0]!).members);
  }
  static readonly presets = MonoApp.companies.map(({ id, label, note }) => ({ id, label, note }));
  boot() {
    this.root.addEventListener('click', e => { void this.click(e); });
    this.root.addEventListener('change', e => this.change(e));
    this.root.addEventListener('mousemove', e => this.hover(e));
    document.addEventListener('keydown', e => { void this.keydown(e); });
    window.addEventListener('resize', () => this.render());
    this.saved = this.read();
    // A saved game always offers itself first; a campaign named in the address is where a new one would begin.
    if (!this.saved && this.query.has('campaign')) { this.choose(this.manifest); }
    else if (!this.saved && this.worldSeed) { void this.generate(this.worldSeed); }
    this.render();
  }
  // The region and its scenarios depend only on the seed; the company's contacts follow the backgrounds chosen.
  private async assemble(seed: string, party?: CreatureGenerationContext[]) {
    const terrain = this.query.get('terrain');
    return WorldAssembler.assemble(seed, Scenarios.source(),
      { ...terrain ? { region: { terrain } } : {}, ...party ? { party } : {} });
  }
  private async generate(seed: string) {
    this.pending = true; this.mode = 'create'; this.render();
    try {
      const world = await this.assemble(seed);
      const campaign = JSON.parse(await world.source.read(world.path)) as CampaignManifest;
      this.world = { path: world.path, source: world.source, campaign };
      this.manifest = world.path; this.draft.seed = seed; this.worldSeed = seed;
      if (campaign.party) { this.draft.party = structuredClone(campaign.party); }
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.pending = false; this.render(); }
  }
  private choose(manifest: string) {
    if (manifest === 'world') { void this.generate(this.worldSeed ?? 'thorn'); return; }
    this.manifest = manifest; this.world = undefined; this.worldSeed = null; this.mode = 'create';
    const entry = Scenarios.list.find(s => s.manifest === manifest);
    if (entry) { this.draft.seed = entry.seed; }
    const declared = (JSON.parse(Scenarios.files[manifest] ?? '{}') as { party?: CreatureGenerationContext[] }).party;
    this.draft.party = declared ? structuredClone(declared) : MonoApp.preset('fellowship');
  }
  private read(): Saved | undefined {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) as Saved : undefined;
    } catch { return undefined; }
  }
  private resume() {
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
  private persist() {
    if (!this.session) { return; }
    try {
      this.saved = { checkpoint: this.session.checkpoint(), log: this.log.slice(-60) };
      localStorage.setItem(this.key, JSON.stringify(this.saved));
    }
    catch { /* storage unavailable: play continues without autosave */ }
  }
  private reset() { this.cursor = 0; this.trail = []; }
  // The sections for the current mode, the list on show (the top level or what the trail opened), and the trail.
  private view(): { sections: Section[]; level: Choice[]; trail: Choice[] } {
    const sections = this.mode === 'combat' && this.turn ? ChoiceList.combat(CombatModel.build(this.turn.battle))
      : !this.screen ? [] : this.mode === 'pack' ? ChoiceList.pack(this.screen) : this.mode === 'party' ? ChoiceList.party(this.screen)
        : this.mode === 'explore' ? ChoiceList.explore(this.screen) : [];
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
  get state(): MonoState {
    const { sections, level, trail } = this.view();
    this.cursor = Math.min(Math.max(0, this.cursor), Math.max(0, level.length - 1));
    return { mode: this.mode, ...(this.screen ? { screen: this.screen } : {}),
      ...(this.turn ? { combat: CombatModel.build(this.turn.battle) } : {}), sections, level, trail,
      cursor: this.cursor,
      log: this.log, pending: this.pending, error: this.error, history: this.history,
      narrow: window.matchMedia('(max-width: 719px)').matches,
      chronicle: this.session ? PlayerView.chronicle(this.session.campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })) : [] };
  }
  render() {
    if (!this.session || this.mode === 'title' || this.mode === 'campaigns' || this.mode === 'create') { this.root.innerHTML = this.opener(); return; }
    if (!this.turn && !this.session.acting) { this.screen = ScreenModel.build(this.session.campaign); }
    const s = this.state;
    const body = this.mode === 'combat' && s.combat ? MonoRender.combat(s) : this.mode === 'pack' ? MonoScreens.pack(s)
      : this.mode === 'party' ? MonoScreens.sheet(s) : this.mode === 'journal' ? MonoScreens.journal(s)
        : this.mode === 'map' ? MonoScreens.map(s) : MonoRender.explore(s);
    this.root.innerHTML = MonoRender.frame(s, body);
    this.root.querySelector('.choice.sel')?.scrollIntoView({ block: 'nearest' });
    // What just happened is read where the scene ends, just above the choices.
    const scene = this.root.querySelector('.scene');
    if (scene && this.root.querySelector('.response')) { scene.scrollTop = scene.scrollHeight; }
    const strip = this.root.querySelector('.strip ol');
    if (strip) { strip.scrollTop = strip.scrollHeight; }
  }
  private opener(): string {
    if (this.mode === 'campaigns') { return MonoScreens.campaigns(this.opening); }
    if (this.mode === 'create') {
      const campaign = this.world?.campaign
        ?? JSON.parse(Scenarios.files[this.manifest] ?? '{"name":"A generated region"}') as CampaignManifest;
      return MonoScreens.create(this.draft, this.error, campaign,
        { presets: MonoApp.presets, generated: !!this.world });
    }
    const saved = this.saved ? this.summary(this.saved) : undefined;
    return MonoScreens.title({ ...this.opening, ...(saved ? { saved } : {}) }, this.error);
  }
  private summary(saved: Saved): Opening['saved'] {
    interface Fact { name: string; args: string[] }
    const save = (saved.checkpoint as { save?: { module?: { name?: string; entities?: { id: string; name: string }[] };
      state?: { elapsed?: number; world?: { relations?: Fact[] } } } }).save;
    const party = (saved.checkpoint as { transcript?: { party?: { name?: string }[] } }).transcript?.party ?? [];
    const here = save?.state?.world?.relations?.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
    const place = save?.module?.entities?.find(e => e.id === here)?.name ?? '';
    return { title: save?.module?.name ?? 'your expedition', where: ChoiceList.upper(place),
      when: FictionalTime.at(save?.state?.elapsed ?? 0), company: party.map(p => p.name).filter(Boolean).join(', ') };
  }
  private move(delta: number) {
    const n = this.mode === 'title' ? this.titleEntries() : this.mode === 'campaigns' ? this.opening.campaigns.length : this.view().level.length;
    if (!n) { return; }
    if (this.mode === 'title' || this.mode === 'campaigns') { this.opening.cursor = (this.opening.cursor + delta + n) % n; }
    else { this.cursor = (this.cursor + delta + n) % n; }
    this.render();
  }
  private titleEntries(): number { return this.saved ? 3 : 2; }
  // Doing the highlighted (or numbered) choice: a command happens; a list opens; a barred way says why.
  private async act(index?: number) {
    const { level } = this.view();
    if (index !== undefined) { if (!level[index]) { return; } this.cursor = index; }
    const choice = level[this.cursor];
    if (!choice) { return; }
    if (choice.disabled) { this.error = choice.disabled; this.render(); this.error = ''; return; }
    if (choice.children) { this.trail.push(choice.id); this.cursor = 0; this.render(); return; }
    if (!choice.command) { return; }
    if (this.mode === 'combat') { this.combatCommand(choice.command); return; }
    const { trail, sections } = this.view();
    const section = sections.find(s => s.choices.some(c => c.id === (trail[0]?.id ?? choice.id)));
    const title = [...trail.map(c => c.label), choice.label].join(' › ');
    await this.run(choice.command, { title, subject: section && section.id !== 'ways' && section.id !== 'company' ? section.title : '',
      move: section?.id === 'ways' });
  }
  private back() {
    if (this.history) { this.history = false; }
    else if (this.trail.length) { this.cursor = 0; this.trail.pop(); }
    else if (this.mode === 'campaigns') { this.mode = 'title'; }
    else if (this.mode === 'create' && !this.query.has('campaign') && !this.query.has('world')) { this.mode = 'campaigns'; }
    else if (this.session && !['explore', 'combat', 'title', 'campaigns', 'create'].includes(this.mode)) { this.mode = 'explore'; this.reset(); }
    this.render();
  }
  private readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    this.turn = { battle, resolve }; this.mode = 'combat'; this.pending = false; this.reset();
    this.render();
  });
  private combatCommand(command: string) {
    if (!this.turn) { return; }
    const [ability, target] = command.split('>');
    const state = this.turn.battle.state;
    const legal = this.turn.battle.legalCommands().find(c => c.actor === state.actor && c.ability === ability
      && (!target || c.target === target));
    if (!legal) { this.error = 'That is no longer possible.'; this.render(); return; }
    this.answer(legal);
  }
  private answer(command: Command) {
    const turn = this.turn;
    if (!turn) { return; }
    this.turn = undefined; this.pending = true; this.reset();
    turn.resolve(command);
  }
  private async run(command: string, context: { title: string; subject: string; move: boolean }) {
    if (!this.session || this.pending) { return; }
    const campaign = this.session.campaign, before = PlayerView.observe(campaign);
    this.pending = true; this.error = ''; this.render();
    try {
      const event = await this.session.perform(command, this.controller);
      const feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== PlayerView.observe(campaign).location?.id;
      this.record(event, feedback, { ...context, moved });
      if (this.mode === 'combat') { this.mode = 'explore'; }
      this.reset();
      this.persist();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.turn = undefined; if (this.mode === 'combat') { this.mode = 'explore'; }
    } finally { this.pending = false; this.render(); }
  }
  private record(event: CampaignEvent, f: ActionFeedback, context: { title: string; subject: string; move: boolean;
    moved: boolean }) {
    const fight = event.combat.some(e => e.type === 'end');
    const plain = context.move && context.moved && event.result === 'success';
    const lines = [
      ...(plain ? [] : [f.result]),
      ...f.resources, ...f.discoveries.map(d => `Learned: ${d}`),
      ...f.immediate.map(l => l.replace(/^You witness: /, '')),
      ...(context.moved ? [] : f.observations), ...f.events,
    ];
    const arrived = PlayerView.observe(this.session!.campaign).location?.name ?? '';
    const title = plain ? `→ ${arrived}` : context.subject ? `${context.subject}: ${context.title}` : context.title;
    const told = Narration.tidy([...new Set(lines.filter(Boolean))], fight ? event.combat.filter(e => e.type === 'action').length : 0);
    this.log.push({ at: f.time, title, lines: told, tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act' });
  }
  private async keydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) { return; }
    const key = e.key;
    if (this.mode === 'title' || this.mode === 'campaigns' || this.mode === 'create') { await this.openingKey(e); return; }
    if (this.pending && this.mode !== 'combat') { return; }
    if (key === 'ArrowDown' || key === 'ArrowUp') { e.preventDefault(); this.move(key === 'ArrowDown' ? 1 : -1); return; }
    if (key === 'Enter' || key === 'ArrowRight' || key === ' ') { e.preventDefault(); await this.act(); return; }
    if (key === 'Escape' || key === 'ArrowLeft' || key === 'Backspace') { e.preventDefault(); this.back(); return; }
    if (/^[1-9]$/.test(key)) { e.preventDefault(); await this.act(Number(key) - 1); return; }
    if (this.mode === 'combat') {
      if (key.toLowerCase() === 't' && this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
      return;
    }
    if (key.toLowerCase() === 'h') { e.preventDefault(); this.history = !this.history; this.render(); return; }
    const tab = MonoRender.tabs.find(([, k]) => k.toLowerCase() === key.toLowerCase());
    if (tab) { e.preventDefault(); this.switchMode(tab[0]); }
  }
  private async openingKey(e: KeyboardEvent) {
    const key = e.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') { e.preventDefault(); this.move(key === 'ArrowDown' ? 1 : -1); return; }
    if (key === 'Escape' || key === 'Backspace') { e.preventDefault(); this.back(); return; }
    const digit = /^[1-9]$/.test(key) ? Number(key) - 1 : undefined;
    if (key !== 'Enter' && digit === undefined) { return; }
    e.preventDefault();
    if (this.mode === 'create') { if (key === 'Enter') { await this.start(); } return; }
    if (digit !== undefined) { this.opening.cursor = digit; }
    if (this.mode === 'campaigns') {
      const card = this.opening.campaigns[this.opening.cursor];
      if (card) { this.choose(card.id); this.render(); }
      return;
    }
    const entries = [...(this.saved ? ['continue'] : []), 'campaigns', 'load-file'];
    await this.begin(entries[this.opening.cursor]);
  }
  private async begin(action?: string) {
    if (action === 'continue') { this.resume(); }
    else if (action === 'campaigns' && this.query.has('campaign')) { this.choose(this.query.get('campaign')!); }
    else if (action === 'campaigns' && this.query.has('world')) { void this.generate(this.query.get('world')!); }
    else if (action === 'campaigns') { this.mode = 'campaigns'; this.opening.cursor = 0; }
    else if (action === 'load-file') { this.root.querySelector<HTMLInputElement>('#load')?.click(); }
    this.render();
  }
  private switchMode(mode: Mode) {
    if (this.mode === 'combat') { return; }
    this.mode = mode; this.reset(); this.render();
  }
  // Only a mouse that moves takes the highlight: a page redrawn under a resting pointer must not undo the keys.
  private pointer = { x: -1, y: -1 };
  private hover(e: Event) {
    const { clientX: x, clientY: y } = e as MouseEvent;
    if (x === this.pointer.x && y === this.pointer.y) { return; }
    this.pointer = { x, y };
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action="choice"]');
    if (!el || this.state.narrow) { return; }
    const i = Number(el.dataset.index);
    if (i !== this.cursor) { this.cursor = i; this.render(); }
  }
  private async click(e: Event) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!el) { return; }
    const { action } = el.dataset;
    if (action === 'choice') { await this.act(Number(el.dataset.index)); }
    else if (action === 'mode') { this.switchMode(el.dataset.mode as Mode); }
    else if (action === 'history') { this.history = !this.history; this.render(); }
    else if (action === 'auto' && this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
    else if (action === 'preset') { this.draft.party = MonoApp.preset(el.dataset.id!); this.render(); }
    else if (action === 'campaign') { this.choose(el.dataset.id!); this.render(); }
    else if (action === 'start') { await this.start(); }
    else if (['continue', 'campaigns', 'load-file'].includes(action!)) { await this.begin(action); }
    else if (action === 'export') { this.download(); }
    else if (action === 'title' || action === 'new') { this.mode = 'title'; this.opening.cursor = 0; this.session = undefined; this.render(); }
  }
  private change(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.id === 'load' && input.files?.[0]) {
      void input.files[0].text().then(text => {
        this.session = PlaySession.resume(JSON.parse(text) as Parameters<typeof PlaySession.resume>[0]);
        this.mode = 'explore'; this.log = []; this.reset(); this.persist(); this.render();
      }).catch((error: unknown) => { this.error = String(error); this.render(); });
      return;
    }
    const field = input.dataset.field;
    if (field === 'seed') { this.draft.seed = input.value.trim() || 'serewater'; return; }
    const member = this.draft.party[Number(input.dataset.index)];
    if (field && member) {
      // A specialization is the one chosen trait; its spells are drawn when the company forms. Changing class or
      // specialization discards choices that no longer fit.
      if (field === 'specialization') { member.traits = input.value ? [input.value] : []; delete member.spells; }
      else if (field === 'backgroundId' && !input.value) { delete member.backgroundId; }
      else {
        (member as unknown as Record<string, string>)[field] = input.value;
        if (field === 'classId') { delete member.traits; delete member.spells; }
      }
      if (field !== 'name') { this.render(); }
    }
  }
  private async start() {
    if (this.pending) { return; }
    this.pending = true; this.error = ''; this.render();
    try {
      const world = this.worldSeed ? await this.assemble(this.worldSeed, this.draft.party) : undefined;
      this.session = await PlaySession.start(world?.path ?? this.manifest, this.draft.seed,
        world?.source ?? Scenarios.source(), this.draft.party);
      this.mode = 'explore'; this.log = []; this.reset(); this.persist();
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.pending = false; this.render(); }
  }
  private download() {
    if (!this.session) { return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.session.checkpoint())], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `kyr-${this.session.campaign.state.elapsed}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  exportTranscript() { return this.session?.transcript; }
  private static shape(c: Choice) {
    return { id: c.id, label: c.label, ...(c.command ? { command: c.command } : {}),
      ...(c.children ? { children: c.children.length } : {}), ...(c.disabled ? { disabled: c.disabled } : {}) };
  }
  // Test and automation hook: the same semantic state the renderer draws.
  inspect() {
    const s = this.state;
    return { mode: s.mode, place: s.screen?.place, path: s.screen?.path,
      sections: s.sections.map(sec => ({ id: sec.id, title: sec.title,
        choices: sec.choices.map(c => MonoApp.shape(c)) })),
      choices: s.level.map(c => MonoApp.shape(c)), selected: s.level[s.cursor]?.id, trail: s.trail.map(c => c.label),
      combat: s.combat, log: s.log.slice(-5), party: s.screen?.party.map(m => ({ name: m.name, hp: m.hp })),
      pending: s.pending, error: s.error };
  }
}
