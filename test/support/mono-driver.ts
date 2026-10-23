/// <reference lib="dom" />
import type { Page } from 'playwright-core';

export interface ChoiceShape { id: string; label: string; command?: string; children?: number; disabled?: string }
export interface MonoInspection {
  mode: string; place?: { id: string; name: string }; path?: { kind: string; name: string }[];
  sections: { id: string; title: string; choices: ChoiceShape[] }[];
  choices: ChoiceShape[]; selected?: string; trail: string[];
  combat?: { ours: boolean; outcome: string | null; actorName: string; foes: { name: string; hp: number }[] };
  log: { title: string; lines: string[] }[]; party?: { name: string; hp: number }[]; pending: boolean; error: string;
}

// Drives the Mono client through the keyboard (and optionally the pointer) using semantic ids and labels. It never
// calls the simulation directly: every step is a real browser input event. Arrow keys only highlight a choice;
// Enter (or a click) does it.
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
  // A phone is touched: a tap, which leaves no pointer hovering where it was, made as a finger would, once what it
  // is aimed at has been scrolled to the middle of the screen and has stopped moving.
  async click(selector: string) {
    this.presses++;
    if (this.pointer) {
      await this.page.locator(selector).evaluate(e => e.scrollIntoView({ block: 'center' }));
      await this.still();
      await this.page.tap(selector);
    } else { await this.page.click(selector); }
    await this.settle();
  }
  still() {
    return this.page.waitForFunction(() => new Promise<boolean>(done => {
      const pages = [document.getElementById('page'), document.querySelector('.book')], tops = pages.map(p => p?.scrollTop);
      requestAnimationFrame(() => requestAnimationFrame(() => done(pages.every((p, i) => p?.scrollTop === tops[i]))));
    }), null, { timeout: 10000 });
  }
  // Does a choice on show, found by a predicate; arrows bring the highlight to it, then Enter does it.
  async pick(test: (c: ChoiceShape) => boolean, what: string) {
    const state = await this.inspect();
    const index = state.choices.findIndex(test);
    if (index < 0) { throw new Error(`No choice ${what}: ${state.choices.map(c => `${c.id} "${c.label}"`).join(' | ')}`); }
    if (this.pointer) { await this.click(`.intentions [data-action="choice"][data-index="${index}"]`); return; }
    const current = Math.max(0, state.choices.findIndex(c => c.id === state.selected));
    const delta = index - current;
    for (let i = 0; i < Math.abs(delta); i++) { await this.key(delta > 0 ? 'ArrowDown' : 'ArrowUp'); }
    await this.key('Enter');
  }
  // A choice about a subject (its id, or the id without the installation prefix), by the start of its label; then
  // any further labels pick from the list it opens. A subject with several things to do is one choice that opens them
  // ("Speak with Wren"); it is opened first when the label wanted is inside it.
  async do(subject: string, ...labels: string[]) {
    const [first, ...rest] = labels, state = await this.inspect();
    const direct = state.choices.find(c => this.about(c.id, subject) && (!first || c.label.startsWith(first)));
    if (!direct) {
      const opener = state.choices.find(c => this.about(c.id, subject) && c.children);
      if (opener) { await this.pick(c => c.id === opener.id, `${subject} (open)`); }
    }
    await this.pick(c => this.about(c.id, subject) && (!first || c.label.startsWith(first)), `${subject} ${first ?? ''}`);
    await this.choose(...rest);
  }
  // Labels picked in order from whatever list is on show.
  async choose(...labels: string[]) {
    for (const label of labels) { await this.pick(c => c.label === label || c.label.startsWith(label), label); }
  }
  // The way to a destination (its id, or the id without the installation prefix); with a label, one of several
  // things to do at that way (open a door, risk a pit).
  async go(destination: string, label?: string) {
    await this.pick(c => this.way(c.id, destination) && (!label || c.label.toLowerCase().includes(label.toLowerCase())),
      `way to ${destination}`);
  }
  // Back out of a list that is open (a conversation, a thing's uses) to everything there is to do.
  async back() {
    if (!await this.page.locator('[data-action="back"]').count()) { return; }
    if (this.pointer) { await this.click('[data-action="back"]'); return; }
    await this.key('Escape');
  }
  async mode(key: string) {
    if (this.pointer) { await this.click(`[data-action="mode"][data-key="${key}"]`); return; }
    await this.key(key);
  }
  private about(id: string, subject: string): boolean {
    const head = id.split('/')[0]!;
    const bare = head.replace(/#\w+$/, '');
    return bare === subject || bare.endsWith(`__${subject}`);
  }
  private way(id: string, destination: string): boolean {
    const head = id.split('/')[0]!;
    return head === `exit:${destination}` || (head.startsWith('exit:') && head.endsWith(`__${destination}`));
  }
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
