/// <reference lib="dom" />
import type { Page } from 'playwright-core';

export interface MonoInspection {
  mode: string; place?: { id: string; name: string }; path?: { kind: string; name: string }[];
  rows: { id: string; label: string; blocked?: string }[]; selected?: string;
  menu: { label: string; command?: string }[] | null;
  combat?: { ours: boolean; outcome: string | null; actorName: string; foes: { name: string; hp: number }[] };
  log: { title: string; lines: string[] }[]; party?: { name: string; hp: number }[]; pending: boolean; error: string;
}

// Drives the Mono client through the keyboard (and optionally the pointer) using semantic row ids and labels.
// It never calls the simulation directly: every step is a real browser input event.
export class MonoDriver {
  presses = 0;
  constructor(readonly page: Page, readonly pointer = false) {}
  inspect(): Promise<MonoInspection> {
    return this.page.evaluate(() =>
      (window as unknown as { kyrieMono: { inspect(): MonoInspection } }).kyrieMono.inspect());
  }
  async key(key: string) { this.presses++; await this.page.keyboard.press(key); await this.settle(); }
  async settle() {
    await this.page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
  // A row by its full id, or by its id without the installation prefix ('hound' finds 'hill__hound').
  async find(id: string): Promise<string> {
    const rows = (await this.inspect()).rows;
    const [kind, name] = id.includes(':') ? [`${id.split(':')[0]}:`, id.slice(id.indexOf(':') + 1)] : ['', id];
    const match = rows.find(r => r.id === id)
      ?? rows.find(r => r.id.startsWith(kind) && r.id.endsWith(`__${name}`));
    if (!match) { throw new Error(`No row ${id}: ${rows.map(r => r.id).join(', ')}`); }
    return match.id;
  }
  async row(id: string) {
    id = await this.find(id);
    let state = await this.inspect();
    if (state.menu) { await this.key('Escape'); state = await this.inspect(); }
    const target = state.rows.findIndex(r => r.id === id);
    if (target < 0) { throw new Error(`No row ${id} in ${state.mode}: ${state.rows.map(r => r.id).join(', ')}`); }
    const current = Math.max(0, state.rows.findIndex(r => r.id === state.selected));
    const delta = target - current;
    for (let i = 0; i < Math.abs(delta); i++) { await this.key(delta > 0 ? 'ArrowDown' : 'ArrowUp'); }
  }
  async open(id: string) {
    if (id !== 'leave') { id = await this.find(id); }
    if (this.pointer) {
      const state = await this.inspect();
      if (!state.rows.some(r => r.id === id)) { throw new Error(`No row ${id}: ${state.rows.map(r => r.id).join(', ')}`); }
      await this.click(`[data-row="${id.replace(/"/g, '\\"')}"]`);
      return;
    }
    await this.row(id); await this.key('Enter');
  }
  async choose(...labels: string[]) {
    for (const label of labels) {
      const state = await this.inspect();
      const menu = state.menu ?? [];
      const index = menu.findIndex(a => a.label === label || a.label.startsWith(label));
      if (index < 0) { throw new Error(`No menu item ${label}: ${menu.map(a => a.label).join(' | ')}`); }
      if (this.pointer) { await this.click(`.menu [data-action="act"][data-index="${index}"]`); continue; }
      for (let i = 0; i < index; i++) { await this.key('ArrowDown'); }
      await this.key('Enter');
    }
  }
  async mode(key: string) {
    if (this.pointer && key === 'h') { await this.click('[data-action="history"]'); return; }
    if (this.pointer) { await this.click(`[data-action="mode"][data-key="${key}"]`); return; }
    await this.key(key);
  }
  // Opening a row shows its actions; act() also commits a row's only action.
  async act(id: string) {
    await this.open(id);
    const menu = (await this.inspect()).menu;
    if (menu?.length === 1) { await this.choose(menu[0]!.label); }
  }
  async go(destination: string) {
    const rows = (await this.inspect()).rows;
    const exit = rows.find(r => r.id === `exit:${destination}` || r.id.startsWith('exit:') && r.id.endsWith(`__${destination}`));
    await this.open(exit?.id ?? `exit:${destination}`);
    const state = await this.inspect(), menu = state.menu;
    if (!menu?.length) {
      throw new Error(`No way to ${destination}: ${JSON.stringify(state.rows.find(r => r.id === state.selected))}`);
    }
    await this.choose(menu.some(a => a.label === 'Go') ? 'Go' : menu[0]!.label);
  }
  async click(selector: string) { this.presses++; await this.page.click(selector); await this.settle(); }
  async fight(strategy: (state: MonoInspection) => Promise<void> = () => this.key('t')) {
    for (let guard = 0; guard < 200; guard++) {
      const state = await this.inspect();
      if (state.mode !== 'combat') { return; }
      if (state.combat?.ours && !state.combat.outcome) { await strategy(state); }
      else { await this.page.waitForTimeout(20); }
    }
    throw new Error('Combat did not finish');
  }
}
