import type { Battle } from '../src/battle';
import type { Command } from '../src/model';
import { Tactics } from '../src/tactics';
import { CombatChoices } from '../src/ui/combat-choices';
import { Content } from '../src/content';
import { PlayerView } from '../src/presentation/player-view';
import { PlaySession, type CombatController, type TranscriptStep } from '../src/session/play-session';
import { CheckpointStore } from '../src/session/checkpoint-store';
import { Scenarios, type ScenarioEntry } from './scenarios';
import { PlayView } from './play-view';
import { InspectView, type Explanation, type PinnedRun } from './inspect-view';
import { Html } from './html';

interface PendingTurn { battle: Battle; resolve: (command: Command) => void; selected?: string }

// Browser host: DOM events in, Kyr session commands out. No rules are evaluated here.
export class App {
  private session?: PlaySession;
  private tab: 'play' | 'inspect' = 'play';
  private turn?: PendingTurn;
  private autoRest = false;
  private status = '';
  private error = '';
  private explanation?: Explanation[];
  private filter = '';
  private readonly store = new CheckpointStore(localStorage);
  private readonly source = Scenarios.source();
  constructor(private readonly root: HTMLElement) {}
  async boot() {
    this.root.addEventListener('click', event => { void this.click(event); });
    this.root.addEventListener('input', event => this.input(event));
    this.root.addEventListener('change', event => { void this.change(event); });
    this.populate();
    try {
      this.adopt(PlaySession.resume(this.store.read(CheckpointStore.autosave)));
      this.status = 'Resumed the browser autosave.';
    } catch {
      await this.start(Scenarios.list[0]!.manifest, Scenarios.list[0]!.seed);
    }
    this.render();
  }
  private element<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
  private populate() {
    this.element<HTMLSelectElement>('scenario').innerHTML = Scenarios.list.map(s =>
      `<option value="${Html.escape(s.manifest)}">${Html.escape(s.title)}</option>`).join('');
  }
  private adopt(session: PlaySession) {
    this.session = session; this.explanation = undefined; this.turn = undefined; this.autoRest = false;
    const known = Scenarios.list.find(s => s.manifest === session.scenario);
    if (known) { this.element<HTMLSelectElement>('scenario').value = known.manifest; }
    this.element<HTMLInputElement>('seed').value = session.seed;
  }
  private async start(manifest: string, seed: string, steps: TranscriptStep[] = []) {
    this.busy(true);
    try {
      const session = await PlaySession.start(manifest, seed, this.source);
      await session.replay(steps);
      this.adopt(session);
      this.autosave();
    } finally { this.busy(false); }
  }
  private busy(on: boolean) { document.body.classList.toggle('busy', on); }
  private autosave() {
    if (this.session && !this.session.acting) { this.store.write(CheckpointStore.autosave, this.session.checkpoint()); }
  }
  private readonly controller: CombatController = battle => new Promise<Command>(resolve => {
    if (this.autoRest) { resolve(Tactics.choose(battle.state, battle.legalCommands())); return; }
    this.turn = { battle, resolve };
    this.render();
  });
  private async perform(command: string) {
    if (!this.session || this.session.acting) { return; }
    this.error = ''; this.status = ''; this.explanation = undefined;
    const pending = this.session.perform(command, this.controller);
    this.render();
    try { await pending; this.autosave(); }
    finally { this.turn = undefined; this.autoRest = false; }
  }
  private answer(command: Command) {
    const turn = this.turn;
    if (!turn) { return; }
    this.turn = undefined;
    turn.resolve(command);
  }
  private scenario(): ScenarioEntry | undefined {
    return Scenarios.list.find(s => s.manifest === this.element<HTMLSelectElement>('scenario').value);
  }
  private async click(event: Event) {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) { return; }
    const data = target.dataset;
    this.error = '';
    try {
      await this.dispatch(data.action!, data);
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    this.render();
  }
  private async dispatch(action: string, data: DOMStringMap) {
    const session = this.session;
    switch (action) {
      case 'tab': this.tab = data.tab === 'inspect' ? 'inspect' : 'play'; return;
      case 'command': await this.perform(data.id!); return;
      case 'ability': this.select(data.ability ?? ''); return;
      case 'target': this.target(data.target!); return;
      case 'auto-turn': if (this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); } return;
      case 'auto-rest': this.autoRest = true; if (this.turn) { this.answer(Tactics.choose(this.turn.battle.state,
        this.turn.battle.legalCommands())); } return;
      case 'new': {
        const chosen = this.scenario()!;
        await this.start(chosen.manifest, this.element<HTMLInputElement>('seed').value.trim() || chosen.seed);
        this.status = `Started ${chosen.title}.`; return;
      }
      case 'restart': this.guard(); await this.start(session!.scenario, session!.seed); this.status = 'Restarted from the same seed.'; return;
      case 'undo': {
        this.guard();
        if (!session!.transcript.complete || !session!.transcript.steps.length) { throw new Error('Nothing replayable to undo'); }
        await this.start(session!.scenario, session!.seed, session!.transcript.steps.slice(0, -1));
        this.status = 'Rewound one command by replaying the transcript from the seed.'; return;
      }
      default: await this.persistence(action, data);
    }
  }
  private guard() {
    if (!this.session || this.session.acting) { throw new Error('Finish the current command first'); }
    if (!Scenarios.list.some(s => s.manifest === this.session!.scenario)) {
      throw new Error('This session came from an imported save and has no bundled scenario to restart');
    }
  }
  private select(ability: string) {
    if (!this.turn) { return; }
    const choice = CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
      .find(c => c.ability.id === ability);
    if (!choice) { this.turn.selected = undefined; return; }
    if (choice.requiresTarget) { this.turn.selected = ability; return; }
    this.answer(choice.commands[0]!);
  }
  private target(id: string) {
    if (!this.turn?.selected) { return; }
    const choice = CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
      .find(c => c.ability.id === this.turn!.selected)!;
    this.answer(CombatChoices.target(choice, id));
  }
  private async persistence(action: string, data: DOMStringMap) {
    const session = this.session!;
    switch (action) {
      case 'save-slot': {
        if (session.acting) { throw new Error('Kyr saves only between commands'); }
        const name = this.element<HTMLInputElement>('slot-name').value.trim() || `watch ${session.campaign.state.elapsed}`;
        this.store.write(name, session.checkpoint()); this.status = `Saved “${name}”.`; return;
      }
      case 'load-slot': this.adopt(PlaySession.resume(this.store.read(data.slot!))); this.autosave();
        this.status = `Loaded “${data.slot}”.`; return;
      case 'delete-slot': this.store.remove(data.slot!); return;
      case 'export-save': this.download(`kyrie-save-w${session.campaign.state.elapsed}.json`, session.campaign.save(true)); return;
      case 'export-transcript': this.download('kyrie-transcript.json', session.transcript); return;
      case 'copy-transcript': await navigator.clipboard.writeText(JSON.stringify(session.transcript, null, 2));
        this.status = 'Transcript copied.'; return;
      case 'import': this.element<HTMLInputElement>('import-file').click(); return;
      case 'explain': this.explanation = session.campaign.explain(); return;
      case 'show-save': this.element('raw-save').innerHTML = Html.pre(session.campaign.save(true)); return;
      case 'pin': this.pin(); return;
      case 'unpin': this.runs(this.runs().filter((_, i) => i !== Number(data.index))); return;
      case 'replay-run': {
        const run = this.runs()[Number(data.index)]!;
        await this.start(run.scenario, run.seed, run.steps); this.status = `Replayed “${run.label}” from its seed.`; return;
      }
    }
  }
  private pin() {
    const runs = this.runs();
    const label = this.element<HTMLInputElement>('slot-name').value.trim() || `run ${runs.length + 1}`;
    this.runs([...runs, InspectView.pinned(this.session!, label)]);
    this.status = `Pinned “${label}” for comparison.`;
  }
  private runs(next?: PinnedRun[]): PinnedRun[] {
    if (next) { localStorage.setItem('kyrie:runs', JSON.stringify(next)); return next; }
    try { return JSON.parse(localStorage.getItem('kyrie:runs') ?? '[]') as PinnedRun[]; } catch { return []; }
  }
  private download(name: string, value: unknown) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  private async change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.id !== 'import-file' || !input.files?.[0]) { return; }
    try {
      const parsed = CheckpointStore.parse(await input.files[0].text());
      this.adopt('transcript' in parsed ? PlaySession.resume(parsed) : PlaySession.fromSave(parsed));
      this.autosave();
      this.status = `Imported ${input.files[0].name}.`;
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    input.value = '';
    this.render();
  }
  private input(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.id === 'fact-filter' && this.session) {
      this.filter = input.value;
      this.element('facts').innerHTML = InspectView.facts(this.session.campaign, this.filter);
    }
  }
  private render() {
    const session = this.session;
    if (!session) { return; }
    const view = PlayerView.observe(session.campaign);
    this.element('clock').textContent = `Watch ${view.elapsed}`;
    this.element('status').innerHTML = [this.error && `<span class="danger">${Html.escape(this.error)}</span>`,
      this.status && Html.escape(this.status)].filter(Boolean).join(' ');
    for (const tab of ['play', 'inspect']) {
      this.root.querySelector(`[data-tab="${tab}"]`)?.classList.toggle('active', this.tab === tab);
      this.element(tab).hidden = this.tab !== tab;
    }
    const prompt = this.turn ? { battle: this.turn.battle, selected: this.turn.selected } : undefined;
    if (this.tab === 'play') {
      this.element('play').innerHTML = PlayView.render(view, PlayerView.chronicle(session.campaign), prompt,
        session.acting && !this.turn);
    } else {
      this.element('inspect').innerHTML = session.acting ? '<p class="banner">An encounter is in progress; inspect after it resolves.</p>' :
        InspectView.render(session, this.explanation, this.runs(), this.filter);
    }
    this.element('slots').innerHTML = Html.list(this.store.list().map(s => `${Html.button(s.name, 'load-slot', { slot: s.name })}
      <span class="muted small">${Html.escape(s.seed)} · w${s.elapsed}</span>
      ${Html.button('×', 'delete-slot', { slot: s.name, title: 'Delete slot' })}`), 'No saved slots.');
  }
}
