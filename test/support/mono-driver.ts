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
  async row(id: string) {
    let state = await this.inspect();
    if (state.menu) { await this.key('Escape'); state = await this.inspect(); }
    const target = state.rows.findIndex(r => r.id === id);
    if (target < 0) { throw new Error(`No row ${id} in ${state.mode}: ${state.rows.map(r => r.id).join(', ')}`); }
    const current = Math.max(0, state.rows.findIndex(r => r.id === state.selected));
    const delta = target - current;
    for (let i = 0; i < Math.abs(delta); i++) { await this.key(delta > 0 ? 'ArrowDown' : 'ArrowUp'); }
  }
  async open(id: string) {
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
  async go(destination: string) {
    await this.open(`exit:${destination}`);
    const menu = (await this.inspect()).menu;
    if (menu) { await this.choose(menu.some(a => a.label === 'Go') ? 'Go' : menu[0]!.label); }
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
