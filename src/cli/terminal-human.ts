import { emitKeypressEvents } from 'node:readline';
import { TerminalColour, type Shows } from './terminal-colour';
import { TerminalPicker, type Key, type Menu, type Picked } from './terminal-picker';
import { TerminalPickerView } from './terminal-picker-view';
import { TerminalWidth } from './terminal-width';
import type { Picking } from './terminal-input';

// The keyboard of a person at a terminal (TP-01): keys read raw, one at a time, and a picker drawn in place under
// what has been told, then put away once something is chosen, leaving a line of what was chosen. What it answers is
// what a headless player would have typed, by the choice's id, so that both go down one path (see Terminal.play).
// No framework: a key reader, a cursor moved up, the lines cleared, drawn again. Lines asked for (a name, a path) are
// typed on the same keys, a character at a time.
export class TerminalHuman implements Picking {
  private readonly keys: Key[] = [];
  private waiting?: (key: Key) => void;
  private drawn = 0;
  private picker?: TerminalPicker;
  // Whether every key is said (/ turns it): said until the first act in the world, then only on asking, kept from one
  // picker to the next. Hidden from the first, the lenses' keys went unfound.
  private keyed = true;
  private taught = false;
  private constructor(readonly shows: Shows, private readonly out: NodeJS.WriteStream) {}
  static open(shows: Shows = TerminalColour.shows()): TerminalHuman {
    const human = new TerminalHuman(shows, process.stdout);
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.on('keypress', human.heard.bind(human));
    process.stdout.on('resize', human.redraw.bind(human));
    process.on('exit', TerminalHuman.restore);
    return human;
  }
  private static restore() { process.stdout.write('\x1b[?25h'); process.stdin.setRawMode?.(false); }
  close() {
    this.erase();
    TerminalHuman.restore();
    process.stdin.pause();
  }
  // What is chosen from a menu: the picker drawn, each key taken, drawn again, until something is chosen.
  async pick(menu: Menu): Promise<Picked> {
    const picker = this.picker = new TerminalPicker(menu);
    picker.keyed = this.keyed;
    this.out.write('\x1b[?25l');
    try {
      for (;;) {
        this.redraw();
        const picked = picker.press(await this.key());
        this.keyed = picker.keyed;
        if (picked === undefined) { continue; }
        this.erase();
        const row = picked && 'choice' in picked ? picker.visible.find(r => r.id === picked.choice) : undefined;
        if (row && menu.keys && !this.taught) { this.taught = true; this.keyed = false; }
        if (row) { this.out.write(`${TerminalColour.dim(`› ${row.label}`, this.shows.depth)}\n`); }
        return picked;
      }
    } finally { this.picker = undefined; this.out.write('\x1b[?25h'); }
  }
  // A line typed after a prompt, as a headless player's would be: Enter says it, Escape or Ctrl-C says nothing more.
  async ask(prompt: string): Promise<string | null> {
    this.out.write(prompt);
    let line = '';
    for (;;) {
      const key = await this.key();
      if (key.ctrl && (key.name === 'c' || key.name === 'd')) { this.out.write('\n'); return null; }
      if (key.name === 'return' || key.name === 'enter') { this.out.write('\n'); return line.trim(); }
      if (key.name === 'escape') { this.out.write('\n'); return ''; }
      if (key.name === 'backspace') {
        if (line) { line = [...line].slice(0, -1).join(''); this.out.write('\b \b'); }
        continue;
      }
      if (key.ch && !key.ctrl && key.ch >= ' ') { line += key.ch; this.out.write(key.ch); }
    }
  }
  private heard(ch: string | undefined, key: { name?: string; ctrl?: boolean } | undefined) {
    const k: Key = { ...key?.name ? { name: key.name } : {}, ...ch && ch.length === 1 ? { ch } : {},
      ...key?.ctrl ? { ctrl: true } : {} };
    if (this.waiting) { const w = this.waiting; this.waiting = undefined; w(k); } else { this.keys.push(k); }
  }
  private key(): Promise<Key> {
    const kept = this.keys.shift();
    return kept ? Promise.resolve(kept) : new Promise<Key>(resolve => { this.waiting = resolve; });
  }
  private redraw() {
    if (!this.picker) { return; }
    // A long list is a window of a screenful's half or so: the picker under what was told, never over all of it.
    const room = { width: this.out.columns || 80, height: Math.max(8, Math.min(20, (this.out.rows || 24) - 4)),
      shows: this.shows };
    const lines = TerminalPickerView.lines(this.picker, room);
    this.erase();
    const fit = lines.map(l => TerminalWidth.of(l) < room.width ? l
      : TerminalWidth.cut(TerminalWidth.plain(l), room.width - 1));
    this.out.write(fit.join('\n'));
    this.drawn = lines.length;
  }
  // The picker put away: each of its lines cleared, from the last up to the first, the cursor left there. Line by
  // line, not the screen from the cursor down: a multiplexer (tmux) takes a clear from the top of the screen for a
  // page to keep, and kept the picker in its history.
  private erase() {
    if (!this.drawn) { return; }
    this.out.write(`\r\x1b[2K${'\x1b[1A\x1b[2K'.repeat(this.drawn - 1)}`);
    this.drawn = 0;
  }
}
