// How much of a terminal's line a text takes, and fitting a text to it. Colour is no width, a wide character (an
// emoji, a CJK sign) two cells, a combining mark none. The picker draws in place, so it must know each line is one
// line: a label that wrapped on its own had pushed the redraw a line too far each time (TP-01).
export class TerminalWidth {
  private static readonly ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
  static plain(text: string): string { return text.replace(this.ansi, ''); }
  static of(text: string): number {
    let n = 0;
    for (const ch of this.plain(text)) { n += this.cell(ch.codePointAt(0)!); }
    return n;
  }
  private static cell(cp: number): number {
    if ((cp >= 0x300 && cp < 0x370) || cp === 0x200d || (cp >= 0xfe00 && cp <= 0xfe0f)) { return 0; }
    const wide = (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3)
      || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0x1f300 && cp <= 0x1faff);
    return wide ? 2 : 1;
  }
  // A plain text cut to a width, with an ellipsis where it was cut.
  static cut(text: string, width: number): string {
    if (this.of(text) <= width) { return text; }
    let out = '', n = 0;
    for (const ch of text) {
      const w = this.cell(ch.codePointAt(0)!);
      if (n + w > width - 1) { break; }
      out += ch; n += w;
    }
    return `${out.trimEnd()}…`;
  }
  // A plain text broken into lines of a width, at spaces where it can be; the first line's width may differ (a row's
  // marks before it), and later lines are indented to match.
  static wrap(text: string, width: number, first = width): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const room = lines.length ? width : first;
      const next = line ? `${line} ${word}` : word;
      if (this.of(next) <= room || !line) { line = next; continue; }
      lines.push(line); line = word;
    }
    if (line) { lines.push(line); }
    return lines.flatMap((l, i) => this.of(l) <= (i ? width : first) ? [l] : [this.cut(l, i ? width : first)]);
  }
}
