import { PlaySession } from '../src/session/play-session';
import { Tactics } from '../src/tactics';
import { PlayFrame } from './play-frame';
import { PlayStore } from './play-store';
import type { PlayApp } from './play-app';
import type { Mode } from './play-types';

// Keys, the pointer and the company form, turned into what the controller does. Arrow keys only highlight; Enter, a
// digit or a click does. Nothing here decides what is legal.
export class PlayInput {
  private shown = 0;
  private pointer = { x: -1, y: -1 };
  constructor(private readonly app: PlayApp) {}
  listen() {
    const root = this.app.root;
    root.addEventListener('click', e => { void this.click(e); });
    root.addEventListener('change', e => this.change(e));
    root.addEventListener('mousemove', e => this.hover(e));
    document.addEventListener('keydown', e => { void this.keydown(e); });
    window.addEventListener('resize', () => this.app.render());
  }
  // Redrawing the same view leaves each region where it was. Something new that happened is brought into view at
  // the foot of the page, just above what can be done next.
  redraw(html: string) {
    const root = this.app.root, app = this.app;
    const was = root.querySelector<HTMLElement>('.frame')?.dataset.mode;
    const kept = new Map([...root.querySelectorAll<HTMLElement>('[data-region]')].map(el => [el.dataset.region, el.scrollTop]));
    const fresh = app.log.length !== this.shown || app.pending || app.mode === 'combat';
    this.shown = app.log.length;
    root.innerHTML = html;
    if (was === app.mode) {
      for (const el of root.querySelectorAll<HTMLElement>('[data-region]')) { el.scrollTop = kept.get(el.dataset.region) ?? 0; }
    }
    const transcript = root.querySelector<HTMLElement>('.transcript');
    if (transcript && (fresh || was !== app.mode) && !app.history) { transcript.scrollTop = transcript.scrollHeight; }
    root.querySelector('.choice.sel')?.scrollIntoView({ block: 'nearest' });
  }
  private async keydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement, app = this.app, key = e.key;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) { return; }
    if (['title', 'campaigns', 'create'].includes(app.mode)) { await this.openingKey(e); return; }
    if (app.pending && app.mode !== 'combat') { return; }
    if (key === 'ArrowDown' || key === 'ArrowUp') { e.preventDefault(); this.move(key === 'ArrowDown' ? 1 : -1); return; }
    if (key === 'Enter' || key === 'ArrowRight' || key === ' ') { e.preventDefault(); await this.act(); return; }
    if (key === 'Escape' || key === 'ArrowLeft' || key === 'Backspace') { e.preventDefault(); this.back(); return; }
    if (/^[1-9]$/.test(key)) { e.preventDefault(); await this.act(Number(key) - 1); return; }
    if (app.mode === 'combat') {
      if (key.toLowerCase() === 't' && app.turn) { app.answer(Tactics.choose(app.turn.battle.state, app.turn.battle.legalCommands())); }
      return;
    }
    if (key.toLowerCase() === 'h') { e.preventDefault(); this.toggleHistory(); return; }
    const tab = PlayFrame.tabs.find(([, k]) => k.toLowerCase() === key.toLowerCase());
    if (tab) { e.preventDefault(); this.switchMode(tab[0]); }
  }
  private async openingKey(e: KeyboardEvent) {
    const app = this.app, key = e.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') { e.preventDefault(); this.move(key === 'ArrowDown' ? 1 : -1); return; }
    if (key === 'Escape' || key === 'Backspace') { e.preventDefault(); this.back(); return; }
    const digit = /^[1-9]$/.test(key) ? Number(key) - 1 : undefined;
    if (key !== 'Enter' && digit === undefined) { return; }
    e.preventDefault();
    if (app.mode === 'create') { if (key === 'Enter') { await app.begin(); } return; }
    if (digit !== undefined) { app.start.cursor = digit; }
    if (app.mode === 'campaigns') {
      const card = app.start.campaigns[app.start.cursor];
      if (card) { app.choose(card.id); app.render(); }
      return;
    }
    const entries = [...(app.saved ? ['continue'] : []), 'campaigns', 'load-file'];
    this.opening(entries[app.start.cursor]);
  }
  private opening(action?: string) {
    const app = this.app;
    if (action === 'continue') { app.resume(); }
    else if (action === 'campaigns' && app.query.has('campaign')) { app.choose(app.query.get('campaign')!); }
    else if (action === 'campaigns' && app.query.has('world')) { void app.generate(app.query.get('world')!); }
    else if (action === 'campaigns') { app.mode = 'campaigns'; app.start.cursor = 0; }
    else if (action === 'load-file') { app.root.querySelector<HTMLInputElement>('#load')?.click(); }
    app.render();
  }
  private move(delta: number) {
    const app = this.app, opening = app.mode === 'title' || app.mode === 'campaigns';
    const n = app.mode === 'title' ? (app.saved ? 3 : 2) : app.mode === 'campaigns' ? app.start.campaigns.length : app.view().level.length;
    if (!n) { return; }
    if (opening) { app.start.cursor = (app.start.cursor + delta + n) % n; }
    else { app.cursor = (app.cursor + delta + n) % n; }
    app.render();
  }
  // Doing the highlighted (or numbered) choice: a command happens; a list opens; a barred way says why.
  private async act(index?: number) {
    const app = this.app, { level, trail, sections } = app.view();
    if (index !== undefined) { if (!level[index]) { return; } app.cursor = index; }
    const choice = level[app.cursor];
    if (!choice) { return; }
    if (choice.disabled) { app.error = choice.disabled; app.render(); app.error = ''; return; }
    if (choice.children) { app.trail.push(choice.id); app.cursor = 0; app.render(); return; }
    if (!choice.command) { return; }
    if (app.mode === 'combat') { this.combatCommand(choice.command); return; }
    const section = sections.find(s => s.choices.some(c => c.id === (trail[0]?.id ?? choice.id)));
    const said = [...trail.map(c => c.label), choice.label].join(' › ');
    await app.run(choice.command, { said, move: section?.id === 'ways' });
  }
  private combatCommand(command: string) {
    const app = this.app;
    if (!app.turn) { return; }
    const [ability, target] = command.split('>');
    const state = app.turn.battle.state;
    const legal = app.turn.battle.legalCommands().find(c => c.actor === state.actor && c.ability === ability
      && (!target || c.target === target));
    if (!legal) { app.error = 'That is no longer possible.'; app.render(); app.error = ''; return; }
    app.answer(legal);
  }
  private back() {
    const app = this.app;
    if (app.history) { app.history = false; }
    else if (app.trail.length) { app.cursor = 0; app.trail.pop(); }
    else if (app.mode === 'campaigns') { app.mode = 'title'; }
    else if (app.mode === 'create' && !app.query.has('campaign') && !app.query.has('world')) { app.mode = 'campaigns'; }
    else if (app.session && !['explore', 'combat', 'title', 'campaigns', 'create'].includes(app.mode)) { app.mode = 'explore'; app.reset(); }
    app.render();
  }
  private toggleHistory() { this.app.history = !this.app.history; if (this.app.mode !== 'explore') { this.app.mode = 'explore'; } this.app.render(); }
  private switchMode(mode: Mode) {
    const app = this.app;
    if (app.mode === 'combat') { return; }
    app.mode = app.mode === mode && mode !== 'explore' ? 'explore' : mode; app.history = false; app.reset(); app.render();
  }
  // Only a pointer that moves takes the highlight: a page redrawn under a resting pointer must not undo the keys.
  private hover(e: Event) {
    const { clientX: x, clientY: y } = e as MouseEvent;
    if (x === this.pointer.x && y === this.pointer.y) { return; }
    this.pointer = { x, y };
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action="choice"]');
    if (!el || this.app.state.narrow) { return; }
    const i = Number(el.dataset.index);
    if (i !== this.app.cursor) { this.app.cursor = i; this.app.render(); }
  }
  private async click(e: Event) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]'), app = this.app;
    if (!el) { return; }
    const { action } = el.dataset;
    if (action === 'choice') { await this.act(Number(el.dataset.index)); }
    else if (action === 'mode') { this.switchMode(el.dataset.mode as Mode); }
    else if (action === 'history') { this.toggleHistory(); }
    else if (action === 'auto' && app.turn) { app.answer(Tactics.choose(app.turn.battle.state, app.turn.battle.legalCommands())); }
    else if (action === 'preset') { app.draft.party = app.company(el.dataset.id!); app.render(); }
    else if (action === 'campaign') { app.choose(el.dataset.id!); app.render(); }
    else if (action === 'start') { await app.begin(); }
    else if (['continue', 'campaigns', 'load-file'].includes(action!)) { this.opening(action); }
    else if (action === 'export' && app.session) { PlayStore.download(app.session); }
    else if (action === 'title' || action === 'new') { app.mode = 'title'; app.start.cursor = 0; app.session = undefined; app.render(); }
  }
  private change(e: Event) {
    const input = e.target as HTMLInputElement, app = this.app;
    if (input.id === 'load' && input.files?.[0]) {
      void input.files[0].text().then(text => {
        app.session = PlaySession.resume(JSON.parse(text) as Parameters<typeof PlaySession.resume>[0]);
        app.mode = 'explore'; app.log = []; app.reset(); app.persist(); app.render();
      }).catch((error: unknown) => { app.error = String(error); app.render(); });
      return;
    }
    const field = input.dataset.field;
    if (field === 'seed') { app.draft.seed = input.value.trim() || 'serewater'; return; }
    const member = app.draft.party[Number(input.dataset.index)];
    if (!field || !member) { return; }
    // A specialization is the one chosen trait; its spells are drawn when the company forms. Changing calling or
    // specialization discards choices that no longer fit.
    if (field === 'specialization') { member.traits = input.value ? [input.value] : []; delete member.spells; }
    else if (field === 'backgroundId' && !input.value) { delete member.backgroundId; }
    else {
      (member as unknown as Record<string, string>)[field] = input.value;
      if (field === 'classId') { delete member.traits; delete member.spells; }
    }
    if (field !== 'name') { app.render(); }
  }
}
