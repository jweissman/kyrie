/// <reference lib="dom" />
import type { Page } from 'playwright-core';

export interface ChoiceShape { id: string; label: string; command?: string; children?: number; disabled?: string }
export interface MonoInspection {
  mode: string; place?: { id: string; name: string }; path?: { kind: string; name: string }[];
  sections: { id: string; title: string; choices: ChoiceShape[] }[];
  choices: ChoiceShape[]; selected?: string; trail: string[];
  combat?: { ours: boolean; outcome: string | null; actorName: string; foes: { name: string; hp: number }[] };
  log: { title: string; lines: string[] }[]; party?: { name: string; hp: number }[]; pending: boolean; error: string;
  talk?: { kind: string; text: string }[];
  // At a place: what its glance leads with and rows, and which sheet draws each other choice (see Raised).
  glance?: { arrival: string; sight?: string; acts: { choice: string; why: string; marks: string[] }[];
    ways: string[] };
  sheets?: { look: string[]; ways: string[]; more: string[] };
  confirming?: string;
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
  // Into the place the company stands in, from the map, where play has begun on it or open country raised it: what a
  // player does before anything else there.
  async enter() {
    if (await this.page.locator('[data-action="enter-hex"]').count()) { await this.click('[data-action="enter-hex"]'); }
  }
  // The place told whole: at rest it always is (the owner, 5 November, late), so only what is opened over it is put
  // away.
  async lookAbout() {
    const shut = '[data-action="explore-shut"]';
    if (await this.page.locator(shut).count()) { await this.click(shut); }
  }
  // A choice touched where it is on show, as a finger would: on the sheet raised over a place when it is there; else
  // on the place's glance, the sheet put away first; else the sheet that holds it raised first (Look about, Every way
  // or More: see Raised), or, where there are no such sheets (a road), every way. Out in the wild, on the world map,
  // the hex the company stands in is entered first (nothing is done in a hex from the map).
  async tap(index: number) {
    const choice = `[data-action="choice"][data-index="${index}"]`, sheet = '.intentions [aria-modal="true"]';
    const raised = `${sheet} ${choice} >> visible=true`, shown = `.intentions ${choice} >> visible=true`;
    const has = async (s: string) => (await this.page.locator(s).count()) > 0;
    if (await has(raised)) { await this.click(raised); return; }
    // In a conversation, what is not among the few things salient is under Something else.
    if (!await has(shown) && await has('.more-talk:not([open]) > summary')) { await this.click('.more-talk > summary'); }
    // Out in the wild, on the world map, the hex the company stands in is entered first.
    if (!await has(shown) && await has('[data-action="enter-hex"]')) { await this.click('[data-action="enter-hex"]'); }
    // An explorer (or an old sheet) up that does not hold it is put away, and the place at rest looked at again.
    if (await has(sheet)) { await this.click(`${sheet} :is(.sheet-shut, [data-action="explore-shut"])`); }
    if (await has(shown)) { await this.click(shown); return; }
    // A place at rest draws only who is here, what is pressing and searching: a way is gone by from Go… (chosen there,
    // then gone), a thing's acts are in its pane under Look…, waiting under Wait….
    if (await this.opened(index, raised)) { return; }
    // Where there is no explorer (a road, a book), the old sheets that hold it, or every way.
    const state = await this.inspect(), id = state.choices[index]?.id ?? '';
    const glanced = !!state.glance && [...state.glance.acts.map(a => a.choice), ...state.glance.ways].includes(id);
    const holder = state.sheets && !glanced ? (['look', 'ways', 'more'] as const).find(k => state.sheets![k].includes(id))
      : undefined;
    const opener = holder && { look: '[data-action="look-about"]', ways: '.all-ways', more: '[data-action="more"]' }[holder];
    if (opener && await has(opener)) { await this.click(opener); }
    else if (!await has(shown) && await has('.all-ways')) { await this.click('.all-ways'); }
    await this.click(await has(raised) ? raised : shown);
  }
  // A choice found in what a place at rest opens: the way chosen in Go… and gone by; the thing whose pane holds it in
  // Look…; or Wait….
  private async opened(index: number, raised: string): Promise<boolean> {
    const has = async (s: string) => (await this.page.locator(s).count()) > 0;
    const shut = '.intentions [aria-modal="true"] [data-action="explore-shut"]';
    // What is done about someone or something on the picture is done from its own page, opened by its likeness.
    const id = (await this.inspect()).choices[index]?.id ?? '', subject = id.split(/[/#]/)[0] ?? '';
    const likeness = `.surface .portraits [data-subject="${subject}"] .portrait`;
    if (subject && await has(likeness)) {
      await this.click(likeness);
      // Its page is a menu of its own: the choice is found there by what it is, not where it was.
      const shown = `.intentions [data-action="choice"][data-choice="${id}"] >> visible=true`;
      if (await has(shown)) { await this.click(shown); return true; }
    }
    for (const part of ['go', 'look', 'wait'] as const) {
      const opener = `.opens-${part}`;
      if (!await has(opener)) { continue; }
      await this.click(opener);
      // Waiting, opened, is Wait… itself: its lengths are what it shows.
      if (part === 'wait' && (await this.inspect()).choices.find(c => c.id === id)?.children
        && await has('.pastime .pt-length')) { return true; }
      if (part === 'go' && await has(`[data-pick-index="${index}"]`)) {
        await this.click(`[data-pick-index="${index}"]`);
        await this.click('.wf-go');
        return true;
      }
      if (await has(raised)) { await this.click(raised); return true; }
      // Turning to a thing is choosing it among what is at hand: its pane is its own view.
      const thing = /^(.+)#look$/.exec((await this.inspect()).choices[index]?.id ?? '')?.[1];
      if (part === 'look' && thing && await has(`.ah-row[data-pick="${thing}"]`)) {
        await this.click(`.ah-row[data-pick="${thing}"]`);
        return true;
      }
      if (part === 'look') {
        for (const row of await this.page.locator('.ah-row').all()) {
          await row.click();
          if (await has(raised)) { await this.click(raised); return true; }
        }
      }
      await this.click(shut);
    }
    return false;
  }
  // Does a choice on show, found by a predicate; arrows bring the highlight to it, then Enter does it.
  // A choice that asks again before it is done (what cannot be undone, a fight that could be lost) is chosen again,
  // as a player who has read what it risks.
  async pick(test: (c: ChoiceShape) => boolean, what: string) {
    let state = await this.inspect(), index = state.choices.findIndex(test);
    // What is bought or had for coin is in the trading, opened from the conversation as a player opens it.
    if (index < 0 && (await this.page.locator('[data-action="trade"]').count()) > 0) {
      await this.click('[data-action="trade"]');
      state = await this.inspect(); index = state.choices.findIndex(test);
    }
    if (index < 0) { throw new Error(`No choice ${what}: ${state.choices.map(c => `${c.id} "${c.label}"`).join(' | ')}`); }
    for (let again = 0; again < 2; again++) {
      if (this.pointer || !await this.keyed(state, index)) { await this.tap(index); }
      if ((await this.inspect()).confirming !== state.choices[index]!.id) { return; }
    }
  }
  // A choice done by the keys, as a player at a keyboard does it: where the arrows reach it (on the page; at a place at
  // rest, what is drawn there; a way, in Go…, opened by G), the arrows brought to it and Enter. False where the keys
  // reach it only through a pane chosen first (a thing at hand), for a touch to do.
  private async keyed(state: Awaited<ReturnType<MonoDriver['inspect']>>, index: number): Promise<boolean> {
    const id = state.choices[index]!.id, has = async (s: string) => (await this.page.locator(s).count()) > 0;
    // What is opened over the place that does not hold it is put away first, as a player would.
    const modal = '.intentions [aria-modal="true"]';
    if (await has(modal) && !await has(`${modal} [data-choice="${id}"], ${modal} [data-pick="${id}"]`)) {
      await this.key('Escape');
    }
    const rest = state.glance && !await has(modal);
    if (rest && !await has(`.intentions [data-choice="${id}"]`)) {
      if (!await has('.opens-go')) { return false; }
      await this.key('g');
      if (!await has(`[data-pick="${id}"]`)) { await this.key('Escape'); return false; }
    }
    for (let i = 0; i <= state.choices.length && (await this.inspect()).selected !== id; i++) { await this.key('ArrowDown'); }
    if ((await this.inspect()).selected !== id) { return false; }
    await this.key('Enter');
    return true;
  }
  // A choice about a subject (its id, or the id without the installation prefix), by the start of its label; then
  // any further labels pick from the list it opens. A subject with several things to do is one choice that opens them
  // ("Speak with Wren"); it is opened first when the label wanted is inside it.
  async do(subject: string, ...labels: string[]) {
    const [first] = labels;
    if (!(await this.inspect()).choices.some(c => this.about(c.id, subject))) { await this.away(); }
    const rest = labels.slice(1), state = await this.inspect();
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
  // A road out is folded under "Roads out" where there are ways about the place: opened first when the way is in it.
  async go(destination: string, label?: string) {
    await this.away();
    const wanted = (c: ChoiceShape) => this.way(c.id, destination)
      && (!label || c.label.toLowerCase().includes(label.toLowerCase()));
    const state = await this.inspect();
    if (!state.choices.some(wanted)) { throw new Error(`No way to ${destination} among ${state.choices.map(c => c.label).join(' | ')}`); }
    await this.pick(wanted, `way to ${destination}`);
  }
  // Back out of a list that is open (a conversation, a thing's uses) to everything there is to do.
  async back() {
    if (!await this.page.locator('[data-action="back"]').count()) { return; }
    if (this.pointer) { await this.click('[data-action="back"]'); return; }
    await this.key('Escape');
  }
  // Out of a conversation or a thing looked at, back to the place: taking leave, or turning away.
  async away() {
    for (let i = 0; i < 3 && ['talk', 'examine'].includes((await this.inspect()).mode); i++) { await this.back(); }
  }
  // A book opened as a player would: by its key, or, by pointer, from the book in the corner and then its tab.
  async mode(key: string) {
    if (!this.pointer) { await this.key(key); return; }
    // The map is the whole screen, closed by its own cross (Mission 18).
    const shut = '.field-map [data-action="close"]';
    if (key === 'm' && await this.page.locator(shut).count()) { await this.click(shut); return; }
    const tab = `[data-action="mode"][data-key="${key}"]`;
    if (!await this.page.locator(tab).count()) {
      await this.click('[data-action="book"]');
      const opened = { j: 'journal', c: 'party', i: 'pack', m: 'map', h: 'story' }[key];
      if ((await this.inspect()).mode === opened) { return; }
    }
    await this.click(tab);
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
      // A fight that has ended is held on its page until the player goes on.
      else if (state.combat?.outcome) { await this.pick(c => c.id === 'onward', 'go on'); }
      else { await this.page.waitForTimeout(20); }
    }
    throw new Error('Combat did not finish');
  }
}
