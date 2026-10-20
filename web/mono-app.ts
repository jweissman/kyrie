import partyExamples from '../data/campaigns/companies.json';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ScreenModel } from '../src/ui/screen-model';
import { CombatModel } from '../src/ui/combat-model';
import { Tactics } from '../src/tactics';
import type { Battle } from '../src/battle';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { CreatureGenerationContext } from '../src/content';
import type { Command } from '../src/model';
import type { Act, LogEntry, Screen } from '../src/ui/screen-types';
import { Scenarios } from './scenarios';
import { MonoRows, type Mode, type Row, type Talk } from './mono-rows';
import { MonoRender, type MonoState } from './mono-render';
import { MonoScreens, type Draft } from './mono-screens';

// Game-screen controller. All consequences are PlaySession commands; this class only tracks selection and mode.
export class MonoApp {
  private session?: PlaySession;
  private mode: Mode = 'create';
  private rowId = '';
  private menu: MonoState['menu'] = null;
  private log: LogEntry[] = [];
  private talk?: Talk;
  private turn?: { battle: Battle; resolve: (c: Command) => void };
  private pending = false;
  private error = '';
  private screen?: Screen;
  private confirmNew = false;
  private history = false;
  private draft: Draft = { seed: 'serewater', field: 0, party: MonoApp.preset('fellowship') };
  private readonly key = 'kyrie.mono.v1';
  readonly manifest = new URLSearchParams(location.search).get('campaign') ?? 'data/campaigns/serewater-march.campaign.json';
  constructor(private root: HTMLElement) {
    const declared = (JSON.parse(Scenarios.files[this.manifest] ?? '{}') as { party?: CreatureGenerationContext[] }).party;
    if (declared) { this.draft.party = structuredClone(declared); }
  }
  static preset(id: 'fellowship' | 'company'): CreatureGenerationContext[] {
    const backgrounds = id === 'fellowship' ? ['forager', 'surveyor', 'pilgrim'] : ['surveyor', 'forager', 'pilgrim'];
    return structuredClone(partyExamples[id])
      .map((p, i) => ({ ...p, backgroundId: backgrounds[i] })) as CreatureGenerationContext[];
  }
  boot() {
    this.root.addEventListener('click', e => { void this.click(e); });
    this.root.addEventListener('change', e => this.change(e));
    document.addEventListener('keydown', e => { void this.keydown(e); });
    window.addEventListener('resize', () => this.render());
    this.restore();
    this.render();
  }
  private restore() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) { return; }
      const saved = JSON.parse(raw) as { checkpoint: Parameters<typeof PlaySession.resume>[0]; log?: LogEntry[] };
      this.session = PlaySession.resume(saved.checkpoint);
      this.log = saved.log ?? []; this.mode = 'explore';
    } catch { this.session = undefined; }
  }
  private persist() {
    if (!this.session) { return; }
    try {
      const saved = { checkpoint: this.session.checkpoint(), log: this.log.slice(-40) };
      localStorage.setItem(this.key, JSON.stringify(saved));
    }
    catch { /* storage unavailable: play continues without autosave */ }
  }
  get state(): MonoState {
    const rows = this.rows();
    const index = Math.max(0, rows.findIndex(r => r.id === this.rowId));
    return { mode: this.mode, ...(this.screen ? { screen: this.screen } : {}),
      ...(this.turn ? { combat: CombatModel.build(this.turn.battle) } : {}), rows, row: index, menu: this.menu,
      log: this.log, ...(this.talk ? { talk: this.talk } : {}), pending: this.pending, error: this.error,
      chronicle: this.session ? PlayerView.chronicle(this.session.campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })) : [],
      narrow: window.matchMedia('(max-width: 719px)').matches, history: this.history };
  }
  private rows(): Row[] {
    if (this.mode === 'combat' && this.turn) { return MonoRows.combat(CombatModel.build(this.turn.battle)); }
    const screen = this.screen;
    if (!screen) { return []; }
    if (this.mode === 'talk' && this.talk) { return MonoRows.talk(screen, this.talk); }
    if (this.mode === 'pack') { return MonoRows.pack(screen); }
    if (this.mode === 'party') { return MonoRows.party(screen); }
    if (this.mode === 'journal') { return []; }
    return MonoRows.explore(screen);
  }
  render() {
    if (!this.session) { this.root.innerHTML = MonoScreens.create(this.draft, this.error); return; }
    if (!this.turn && !this.session.acting) { this.screen = ScreenModel.build(this.session.campaign); }
    if (this.mode === 'talk' && !this.screen?.people.some(p => p.id === this.talk?.person && !p.state)) {
      this.mode = 'explore'; this.talk = undefined;
    }
    const s = this.state;
    if (s.rows[s.row]) { this.rowId = s.rows[s.row]!.id; }
    const body = this.mode === 'combat' && s.combat ? MonoRender.combat(s) : this.mode === 'talk' ? MonoRender.talk(s) :
      this.mode === 'pack' ? MonoScreens.pack(s) : this.mode === 'party' ? MonoScreens.party(s) :
        this.mode === 'journal' ? MonoScreens.journal(s) : MonoRender.explore(s);
    this.root.innerHTML = MonoRender.frame(s, body);
    this.root.querySelector('.row.sel, .act.sel')?.scrollIntoView({ block: 'nearest' });
    const strip = this.root.querySelector('.strip ol');
    if (strip) { strip.scrollTop = strip.scrollHeight; }
  }
  private level(): Act[] {
    const row = this.state.rows.find(r => r.id === this.rowId) ?? this.state.rows[0];
    if (!row) { return []; }
    return this.menu ? this.menu.trail.at(-1)?.children ?? row.acts : row.acts;
  }
  private move(delta: number) {
    if (this.menu) {
      const n = this.level().length;
      if (n) { this.menu.cursor = (this.menu.cursor + delta + n) % n; }
    } else {
      const rows = this.state.rows, i = rows.findIndex(r => r.id === this.rowId);
      if (rows.length) { this.rowId = rows[((i < 0 ? 0 : i) + delta + rows.length) % rows.length]!.id; }
    }
    this.render();
  }
  private async open(index?: number) {
    const rows = this.state.rows;
    if (index !== undefined) { if (!rows[index]) { return; } this.rowId = rows[index].id; this.menu = null; }
    const row = rows.find(r => r.id === this.rowId) ?? rows[0];
    if (!row) { return; }
    this.rowId = row.id;
    if (row.id === 'leave') { this.mode = 'explore'; this.talk = undefined; this.menu = null; this.rowId = ''; this.render(); return; }
    if (!this.menu) {
      const only = row.acts.length === 1 ? row.acts[0]! : undefined;
      if (only && !only.children && only.command) { await this.choose(only, row); return; }
      this.menu = { trail: [], cursor: 0 }; this.render(); return;
    }
    const act = this.level()[this.menu.cursor];
    if (act) { await this.choose(act, row); }
  }
  private async choose(act: Act, row: Row) {
    if (act.label === 'Talk' && act.children && this.mode === 'explore') {
      this.mode = 'talk'; this.talk = { person: row.id, name: row.label, lines: [] }; this.menu = null; this.rowId = '';
      this.render(); return;
    }
    if (act.children) { this.menu = { trail: [...(this.menu?.trail ?? []), act], cursor: 0 }; this.render(); return; }
    if (!act.command) { return; }
    if (this.mode === 'combat') { this.combatCommand(act.command); return; }
    const topic = this.mode === 'talk' && row.id.startsWith('topic:');
    await this.run(act.command, { title: [...(this.menu?.trail.map(a => a.label) ?? []), act.label].join(' › '),
      subject: row.label, plainMove: row.tone === 'exit' && act.label === 'Go', topic, exit: row.tone === 'exit' });
  }
  private back() {
    if (this.menu?.trail.length) { this.menu.trail.pop(); this.menu.cursor = 0; }
    else if (this.menu) { this.menu = null; }
    else if (this.mode !== 'explore' && this.mode !== 'combat') { this.mode = 'explore'; this.talk = undefined; this.rowId = ''; }
    this.render();
  }
  private readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    this.turn = { battle, resolve }; this.mode = 'combat'; this.menu = null; this.pending = false;
    const first = MonoRows.combat(CombatModel.build(battle))[0];
    if (!this.rowId.startsWith('ability:') && first) { this.rowId = first.id; }
    this.render();
  });
  private combatCommand(command: string) {
    if (!this.turn) { return; }
    const [ability, target] = command.split('>');
    const state = this.turn.battle.state;
    const legal = this.turn.battle.legalCommands().find(c => c.actor === state.actor && c.ability === ability
      && (!target || c.target === target));
    if (!legal) { this.error = 'That action is no longer possible.'; this.render(); return; }
    this.answer(legal);
  }
  private answer(command: Command) {
    const turn = this.turn;
    if (!turn) { return; }
    this.turn = undefined; this.menu = null; this.pending = true;
    turn.resolve(command);
  }
  private async run(command: string, context: { title: string; subject: string; plainMove: boolean; topic: boolean;
    exit: boolean }) {
    if (!this.session || this.pending) { return; }
    const campaign = this.session.campaign, before = PlayerView.observe(campaign);
    this.pending = true; this.error = ''; this.render();
    try {
      const event = await this.session.perform(command, this.controller);
      const feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== PlayerView.observe(campaign).location?.id;
      this.record(event, feedback, { ...context, moved });
      if (this.mode === 'combat') { this.mode = 'explore'; this.rowId = ''; }
      if (context.topic && this.talk) { this.talk.lines.push({ topic: context.title, reply: feedback.result }); }
      this.menu = null;
      this.persist();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.turn = undefined; if (this.mode === 'combat') { this.mode = 'explore'; }
    } finally { this.pending = false; this.render(); }
  }
  private record(event: CampaignEvent, f: ActionFeedback, context: { title: string; subject: string; plainMove: boolean;
    topic: boolean; moved: boolean; exit?: boolean }) {
    const fight = event.combat.some(e => e.type === 'end');
    const lines = [
      ...(context.plainMove || context.topic ? [] : [f.result]),
      ...f.resources, ...f.discoveries.map(d => `Learned: ${d}`),
      ...MonoApp.tidy(f.immediate.map(l => l.replace(/^You witness: /, '')),
        fight ? event.combat.filter(e => e.type === 'action').length : 0),
      ...(context.moved ? [] : f.observations), ...f.events,
    ];
    const arrived = PlayerView.observe(this.session!.campaign).location?.name ?? context.subject;
    const title = context.plainMove ? `→ ${arrived}` : context.exit ? `${context.title}${context.moved ? ` → ${arrived}` : ''}`
      : `${context.subject}: ${context.title}`;
    this.log.push({ at: f.time, title, lines, tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act' });
  }
  static tidy(lines: string[], actions: number): string[] {
    const clean = lines.map(l => l.replace(/ \((\d+) HP; [^)]*\)/, ' ($1 HP left)')
      .replace(/(passes|fails) the (\w+) save \([^)]*\)/, (_m, verb: string, stat: string) =>
        `${verb === 'passes' ? 'resists' : 'fails to resist'} (${stat})`));
    if (!actions || clean.length <= 6) { return clean; }
    const key = clean.filter(l => /falls|wins|withdraw|defeated|experience|dies/.test(l));
    return [`${actions} actions over the fight; the journal keeps every blow.`, ...key];
  }
  private async keydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) { return; }
    if (!this.session) { if (e.key === 'Enter') { e.preventDefault(); await this.start(); } return; }
    if (this.pending && this.mode !== 'combat') { return; }
    const key = e.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') { e.preventDefault(); this.move(key === 'ArrowDown' ? 1 : -1); return; }
    if (key === 'Enter' || key === 'ArrowRight' || key === ' ') { e.preventDefault(); await this.open(); return; }
    if (key === 'Escape' || key === 'ArrowLeft' || key === 'Backspace') { e.preventDefault(); this.back(); return; }
    if (/^[1-9]$/.test(key)) { e.preventDefault(); this.menu = null; await this.open(Number(key) - 1); return; }
    if (this.mode === 'combat') {
      if (key.toLowerCase() === 't' && this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
      return;
    }
    if (key.toLowerCase() === 'h') { e.preventDefault(); this.history = !this.history; this.render(); return; }
    const tab = MonoRender.tabs.find(([, k]) => k.toLowerCase() === key.toLowerCase());
    if (tab) { e.preventDefault(); this.switchMode(tab[0]); }
  }
  private switchMode(mode: Mode) {
    if (this.mode === 'combat') { return; }
    this.mode = mode; this.menu = null; this.rowId = ''; this.talk = mode === 'talk' ? this.talk : undefined;
    this.render();
  }
  private async click(e: Event) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!el) { return; }
    const { action } = el.dataset;
    if (action === 'row') { this.menu = null; await this.open(Number(el.dataset.index)); }
    else if (action === 'act' && this.menu) { this.menu.cursor = Number(el.dataset.index); await this.open(); }
    else if (action === 'act') {
      const act = this.level()[Number(el.dataset.index)], row = this.state.rows[this.state.row];
      if (act && row) { this.menu = { trail: [], cursor: Number(el.dataset.index) }; await this.choose(act, row); }
    }
    else if (action === 'mode') { this.switchMode(el.dataset.mode as Mode); }
    else if (action === 'history') { this.history = !this.history; this.render(); }
    else if (action === 'auto' && this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
    else if (action === 'preset') { this.draft.party = MonoApp.preset(el.dataset.id as 'fellowship' | 'company'); this.render(); }
    else if (action === 'start') { await this.start(); }
    else if (action === 'load-file') { this.root.querySelector<HTMLInputElement>('#load')?.click(); }
    else if (action === 'export') { this.download(); }
    else if (action === 'new') { this.abandon(); }
  }
  private change(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.id === 'load' && input.files?.[0]) {
      void input.files[0].text().then(text => {
        this.session = PlaySession.resume(JSON.parse(text) as Parameters<typeof PlaySession.resume>[0]);
        this.mode = 'explore'; this.log = []; this.persist(); this.render();
      }).catch((error: unknown) => { this.error = String(error); this.render(); });
      return;
    }
    const field = input.dataset.field;
    if (field === 'seed') { this.draft.seed = input.value.trim() || 'serewater'; return; }
    const i = Number(input.dataset.index);
    const member = this.draft.party[i];
    if (field && member) {
      // A specialization is the one chosen trait; its spells are drawn when the company forms. Changing class or
      // specialization discards choices that no longer fit.
      if (field === 'specialization') { member.traits = input.value ? [input.value] : []; delete member.spells; }
      else {
        (member as unknown as Record<string, string>)[field] = input.value;
        if (field === 'classId') { delete member.traits; delete member.spells; }
      }
      if (field !== 'name') { this.render(); }
    }
  }
  private async start() {
    if (this.pending) { return; }
    this.pending = true; this.error = '';
    try {
      this.session = await PlaySession.start(this.manifest, this.draft.seed, Scenarios.source(), this.draft.party);
      this.mode = 'explore'; this.log = []; this.rowId = ''; this.persist();
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.pending = false; this.render(); }
  }
  private download() {
    if (!this.session) { return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.session.checkpoint())], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `serewater-${this.session.campaign.state.elapsed}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  private abandon() {
    if (!this.confirmNew) { this.confirmNew = true; this.error = 'Choose “New company” again to abandon this expedition.'; this.render(); return; }
    try { localStorage.removeItem(this.key); } catch { /* ignore */ }
    this.session = undefined; this.screen = undefined; this.confirmNew = false; this.error = ''; this.log = [];
    this.mode = 'create'; this.render();
  }
  exportTranscript() { return this.session?.transcript; }
  // Test and automation hook: the same semantic state the renderer draws.
  inspect() {
    const s = this.state;
    return { mode: s.mode, place: s.screen?.place, path: s.screen?.path,
      rows: s.rows.map(r => ({ id: r.id, label: r.label, blocked: r.blocked })), selected: s.rows[s.row]?.id,
      menu: this.menu ? this.level().map(a => ({ label: a.label, command: a.command })) : null,
      combat: s.combat, log: s.log.slice(-5), party: s.screen?.party.map(m => ({ name: m.name, hp: m.hp })),
      pending: s.pending, error: s.error };
  }
}
