import type { Aspect } from '../presentation/glance-types';
import type { Signed } from './terminal-signs';

// One row of a picker: what choosing it answers (a choice's id), its words, and what it is (its aspects and signs, for
// the one indicator). note: said quietly under it while it is focused (its minutes, what it risks); about: said in
// whole on asking (?). group: the heading it stands under (creation's). shut: why it cannot be chosen. ask: what a
// grave act asks before it is done, chosen once and then again (GRAMMAR.md). info: not a choice (an instrument), read
// on asking. header: a folded group's own row, which opens it (see Menu.fold).
export interface Row {
  id: string; label: string; aspects?: Aspect[]; signed?: Signed; note?: string; about?: string[]; group?: string;
  shut?: string; ask?: string; info?: true; header?: true;
}
// What a picker offers: the few led with, the rest one deliberate step away, what is read rather than chosen (the
// instruments that bear on the moment), a heading, the keys that are commands here, what back does with nothing open,
// and the row to keep the focus on, by its id, where it is still there.
export interface Menu {
  rows: Row[]; rest?: Row[]; info?: Row[]; title?: string;
  keys?: Record<string, { command: string; said: string }>; back?: string; focus?: string;
  // quiet: what is chosen leaves no line of itself above, where what follows says it already (an aim followed).
  quiet?: true;
  // fold: the rest's groups each folded under a row of their own, opened one at a time (a town's rest).
  fold?: true;
}
// A choice by its id, a command (a lens, the map, back) with the row the focus was on, or leaving.
export type Picked = { choice: string } | { command: string; focus?: string } | null;
// A key as the terminal read it: its name (up, down, return, escape…), the character typed, and whether Ctrl was held.
export interface Key { name?: string; ch?: string; ctrl?: boolean }

// The picker of the terminal's human mode (TP-01): focus, unfolding the rest, inspecting, asking once, and back, as one
// small state that takes keys and answers what was chosen. It knows nothing of the game: its rows are the engine's
// choices as the terminal lists them, and what it answers goes down the same path as a line typed headless. Pure, so
// that its keys are proved without a terminal (test/small/terminal-awkward).
export class TerminalPicker {
  static readonly more = '…more';
  focus = 0;
  unfolded = false;
  // The row whose whole is shown (?), the grave act asked about once, and a word said until the next key.
  about?: string;
  asking?: string;
  said?: string;
  // Whether every key is said under the picker, or only how to choose and how to ask (/ shows them all).
  keyed = false;
  // The groups of the rest opened (see Menu.fold).
  readonly opened = new Set<string>();
  constructor(readonly menu: Menu) {
    // Kept where it is in view; a row now among the rest is not unfolded to (a lens turned to had opened on the whole
    // list, the focus deep in it).
    this.focus = Math.max(0, this.visible.findIndex(r => r.id === menu.focus));
  }
  get visible(): Row[] {
    const rest = this.menu.rest ?? [];
    const more: Row[] = rest.length && !this.unfolded ? [{ id: TerminalPicker.more, label: `${rest.length} more` }] : [];
    const shown = !this.unfolded ? [] : this.menu.fold ? this.folded(rest) : rest;
    return [...this.menu.rows, ...more, ...shown, ...this.menu.info ?? []];
  }
  // Each group under its own row, its rows shown only while it is open.
  private folded(rest: Row[]): Row[] {
    return rest.flatMap((r, i) => {
      const head: Row[] = r.group && r.group !== rest[i - 1]?.group ? [{ id: `${TerminalPicker.head}${r.group}`,
        label: `${r.group} · ${rest.filter(x => x.group === r.group).length}`, group: r.group, header: true }] : [];
      return [...head, ...!r.group || this.opened.has(r.group) ? [r] : []];
    });
  }
  static readonly head = '…group:';
  get focused(): Row | undefined { return this.visible[this.focus]; }
  // A key: what was chosen, or undefined to go on picking.
  press(key: Key): Picked | undefined {
    const had = this.said;
    this.said = undefined;
    if (key.ctrl && (key.name === 'c' || key.name === 'd')) { return null; }
    const name = key.name ?? '';
    if (name === 'up' || key.ch === 'k') { return this.move(-1); }
    if (name === 'down' || key.ch === 'j') { return this.move(1); }
    if (name === 'return' || name === 'enter' || name === 'space' || key.ch === ' ') { return this.enter(); }
    if (name === 'pagedown' || name === 'pageup') { return this.page(name === 'pagedown' ? 1 : -1); }
    if (key.ch === ']' || key.ch === '[') { return this.group(key.ch === ']' ? 1 : -1); }
    if (name === 'right' || name === 'tab' || key.ch === '+') { this.open(); return undefined; }
    if (name === 'left' || name === 'escape' || name === 'backspace' || key.ch === 'h') { return this.back(); }
    if (key.ch === '?') { this.inspect(); return undefined; }
    if (key.ch === '/') { this.keyed = !this.keyed; return undefined; }
    if (key.ch && /^[1-9]$/.test(key.ch)) { return this.numbered(Number(key.ch)); }
    if (key.ch === 'q') { return this.quit(had); }
    const command = key.ch ? this.menu.keys?.[key.ch]?.command : undefined;
    return command ? this.command(command) : undefined;
  }
  // A page at a time, without going round: a long list (a town's journeys) is gone through a screenful at once.
  static readonly paged = 10;
  private page(by: number): undefined {
    this.focus = Math.max(0, Math.min(this.visible.length - 1, this.focus + by * TerminalPicker.paged));
    this.about = undefined; this.asking = undefined;
    return undefined;
  }
  // To the first row of the next group (or of this one, then the one before), as the journeys are grouped.
  private group(by: number): undefined {
    const rows = this.visible, starts = rows.flatMap((r, i) => r.group && r.group !== rows[i - 1]?.group ? [i] : []);
    const next = by > 0 ? starts.find(i => i > this.focus) : starts.findLast(i => i < this.focus);
    if (next !== undefined) { this.focus = next; this.about = undefined; this.asking = undefined; }
    return undefined;
  }
  private move(by: number): undefined {
    const n = this.visible.length;
    if (n) { this.focus = (this.focus + by + n) % n; }
    this.about = undefined; this.asking = undefined;
    return undefined;
  }
  private enter(): Picked | undefined {
    const row = this.focused;
    if (!row) { return undefined; }
    if (row.id === TerminalPicker.more) { this.unfold(); return undefined; }
    if (row.header) { this.toggle(row.group!); return undefined; }
    if (row.info) { this.inspect(); return undefined; }
    if (row.shut) { this.said = row.shut; return undefined; }
    if (row.ask && this.asking !== row.id) { this.asking = row.id; return undefined; }
    return { choice: row.id };
  }
  // The rest unfolded beneath the few, the focus on the first of them (where More had stood).
  private unfold() {
    if (this.unfolded || !this.menu.rest?.length) { return; }
    const on = this.focused?.id === TerminalPicker.more;
    this.unfolded = true;
    if (on) { this.focus = this.menu.rows.length; }
  }
  // A group opened where the focus is on its row, else the rest unfolded.
  private open() {
    const row = this.focused;
    if (row?.header && !this.opened.has(row.group!)) { this.toggle(row.group!); return; }
    this.unfold();
  }
  // A group opened or shut, the focus on its own row.
  private toggle(group: string) {
    if (!this.opened.delete(group)) { this.opened.add(group); }
    this.focus = Math.max(0, this.visible.findIndex(r => r.header && r.group === group));
  }
  // Back puts away what was opened last: the whole of a row, a grave act's asking, the group the focus is in, the rest
  // unfolded; then whatever back is here (a lens let go, a target not chosen).
  private back(): Picked | undefined {
    if (this.about) { this.about = undefined; return undefined; }
    if (this.asking) { this.asking = undefined; return undefined; }
    const group = this.focused?.group;
    if (this.menu.fold && this.unfolded && group && this.opened.has(group)) { this.toggle(group); return undefined; }
    if (this.unfolded) {
      const id = this.focused?.id;
      this.unfolded = false;
      const at = this.visible.findIndex(r => r.id === id);
      this.focus = at >= 0 ? at : this.menu.rows.length;
      return undefined;
    }
    return this.menu.back ? this.command(this.menu.back) : undefined;
  }
  private command(command: string): Picked {
    const focus = this.focused?.id;
    return { command, ...focus && focus !== TerminalPicker.more ? { focus } : {} };
  }
  private inspect() {
    const id = this.focused?.id;
    this.about = this.about === id ? undefined : id;
  }
  // A number chooses the row of that number among the choices shown, as a number typed headless does.
  private numbered(n: number): Picked | undefined {
    const choices = this.visible.filter(r => !r.info && !r.header && r.id !== TerminalPicker.more);
    const row = choices[n - 1];
    if (!row) { return undefined; }
    this.focus = this.visible.indexOf(row);
    return this.enter();
  }
  // Leaving the game is asked once, as any act that cannot be undone is.
  private quit(had: string | undefined): Picked | undefined {
    if (had === TerminalPicker.leaving) { return null; }
    this.said = TerminalPicker.leaving;
    return undefined;
  }
  static readonly leaving = 'Press q again to leave the game.';
}
