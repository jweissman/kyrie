import { Terminal } from '../../src/cli/terminal';
import { TerminalPicker, type Key, type Menu, type Picked } from '../../src/cli/terminal-picker';
import { TerminalPickerView, type Room } from '../../src/cli/terminal-picker-view';
import { TerminalWidth } from '../../src/cli/terminal-width';
import type { Picking } from '../../src/cli/terminal-input';
import type { PlaySession } from '../../src/session/play-session';

// The human mode played by keys in the process, without a terminal (TP-05): each key pressed on the real picker, each
// picker drawn as the terminal would draw it, at a width and in a colour depth of the spec's choosing, and kept. A key
// is its name (down, return, right, left, escape, tab) or the character typed; a line asked for is `=` and its words.
// What Terminal.play printed between pickers is kept too, in order.
export interface Frame { lines: string[]; menu: Menu; focused?: string }
export class Keyed implements Picking {
  readonly frames: Frame[] = [];
  readonly said: string[] = [];
  readonly picked: Picked[] = [];
  private constructor(private readonly keys: string[], readonly room: Room) {}
  static of(keys: string[], room: Partial<Room> = {}): Keyed {
    return new Keyed([...keys], { width: 80, height: 40,
      shows: { depth: 'none', unicode: true, companion: 'colour', prism: false }, ...room });
  }
  // A session played by these keys until they run out; what was printed, kept.
  static async play(session: PlaySession, keys: string[], room: Partial<Room> = {}): Promise<Keyed> {
    const keyed = Keyed.of(keys, room), log = console.log, table = console.table;
    console.log = keyed.heard.bind(keyed);
    console.table = keyed.heard.bind(keyed);
    try { await Terminal.play(session, { input: keyed }); } finally { console.log = log; console.table = table; }
    return keyed;
  }
  async pick(menu: Menu): Promise<Picked> {
    const picker = new TerminalPicker(menu);
    for (;;) {
      this.frames.push({ lines: TerminalPickerView.lines(picker, this.room).map(l => TerminalWidth.plain(l)), menu,
        ...picker.focused ? { focused: picker.focused.id } : {} });
      const key = this.keys.shift();
      if (key === undefined || key.startsWith('=')) { this.picked.push(null); return null; }
      const picked = picker.press(Keyed.key(key));
      if (picked !== undefined) { this.picked.push(picked); return picked; }
    }
  }
  async ask(prompt: string): Promise<string | null> {
    this.said.push(prompt);
    const key = this.keys.shift();
    return key?.startsWith('=') ? key.slice(1) : null;
  }
  close() { /* nothing held open */ }
  get last(): Frame { return this.frames.at(-1)!; }
  private heard(...said: unknown[]) { this.said.push(said.map(s => typeof s === 'string' ? s : JSON.stringify(s)).join(' ')); }
  static key(k: string): Key {
    return ['up', 'down', 'left', 'right', 'return', 'escape', 'tab', 'backspace'].includes(k) ? { name: k } : { ch: k };
  }
}
