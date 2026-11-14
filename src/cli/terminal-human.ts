import { emitKeypressEvents, type Interface } from 'node:readline';
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
  // Whether every key is said (/ turns it), kept from one picker to the next: the rail is one quiet line, and a scene's
  // ten keys said at once had run off its end (the owner, 15 November).
  private keyed = false;
  static readonly escape = 50;
  // How many of the terminal's rows what was told since the last picker took, and the column the last line ended at:
  // the picker is drawn in what is left, so the place stays in sight above it (it had been pushed off the top of a
  // 24-row terminal by a picker of twenty lines).
  private above = 0;
  private column = 0;
  // Writing to the terminal: the picker's own lines, not counted as told.
  private readonly put: (text: string) => unknown;
  private constructor(readonly shows: Shows, private readonly out: NodeJS.WriteStream) {
    this.put = out.write.bind(out);
  }
  // What is told (console.log: the scene, what came of an act) goes to the terminal as it would, its rows counted.
  private told(log: typeof console.log, ...said: unknown[]): void {
    const cols = this.out.columns || 80;
    for (const line of said.map(x => String(x)).join(' ').split('\n')) {
      this.above += Math.max(1, Math.ceil((this.column + TerminalWidth.of(line)) / cols));
      this.column = 0;
    }
    log(...said);
  }
  static open(shows: Shows = TerminalColour.shows()): TerminalHuman {
    const human = new TerminalHuman(shows, process.stdout);
    console.log = human.told.bind(human, console.log.bind(console));
    // A lone Escape is back as soon as nothing follows it for 50 ms: at readline's half second, Escape and the arrow
    // after it had been read as one sequence, and back was lost (the human mode's second play).
    emitKeypressEvents(process.stdin, { escapeCodeTimeout: TerminalHuman.escape } as unknown as Interface);
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
    this.put('\x1b[?25l');
    try {
      for (;;) {
        this.redraw();
        const picked = picker.press(await this.key());
        this.keyed = picker.keyed;
        if (picked === undefined) { continue; }
        this.erase();
        const row = picked && 'choice' in picked ? picker.visible.find(r => r.id === picked.choice) : undefined;
        // What is told from here on is the next turn's: the line of what was chosen, then what came of it.
        this.above = row && !menu.quiet ? 1 : 0; this.column = 0;
        if (row && !menu.quiet) { this.put(`${TerminalColour.dim(`› ${row.label}`, this.shows.depth)}\n`); }
        return picked;
      }
    } finally { this.picker = undefined; this.put('\x1b[?25h'); }
  }
  // A line typed after a prompt, as a headless player's would be: Enter says it, Escape or Ctrl-C says nothing more.
  async ask(prompt: string): Promise<string | null> {
    this.put(prompt);
    let line = '';
    for (;;) {
      const key = await this.key();
      if (key.ctrl && (key.name === 'c' || key.name === 'd')) { this.put('\n'); return null; }
      if (key.name === 'return' || key.name === 'enter') { this.put('\n'); this.above++; return line.trim(); }
      if (key.name === 'escape') { this.put('\n'); return ''; }
      if (key.name === 'backspace') {
        if (line) { line = [...line].slice(0, -1).join(''); this.put('\b \b'); }
        continue;
      }
      if (key.ch && !key.ctrl && key.ch >= ' ') { line += key.ch; this.put(key.ch); }
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
    // What is left under what was told since the last choice (the place, what came of the act), at most twenty rows
    // and never fewer than eight: a long list is a window, paged.
    const rows = this.out.rows || 24, room = { width: this.out.columns || 80,
      height: Math.max(12, Math.min(22, rows - this.above - 1)), shows: this.shows };
    const lines = TerminalPickerView.lines(this.picker, room);
    this.erase();
    const fit = lines.map(l => TerminalWidth.of(l) < room.width ? l
      : TerminalWidth.cut(TerminalWidth.plain(l), room.width - 1));
    this.put(fit.join('\n'));
    this.drawn = lines.length;
  }
  // The picker put away: each of its lines cleared, from the last up to the first, the cursor left there. Line by
  // line, not the screen from the cursor down: a multiplexer (tmux) takes a clear from the top of the screen for a
  // page to keep, and kept the picker in its history.
  private erase() {
    if (!this.drawn) { return; }
    this.put(`\r\x1b[2K${'\x1b[1A\x1b[2K'.repeat(this.drawn - 1)}`);
    this.drawn = 0;
  }
}
