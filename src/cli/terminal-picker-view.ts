import { TerminalColour, type Shows } from './terminal-colour';
import { TerminalWidth } from './terminal-width';
import { TerminalPicker, type Row } from './terminal-picker';

// Where a picker is drawn: how wide and how tall it may be, and what the terminal shows.
export interface Room { width: number; height: number; shows: Shows }

// A picker drawn as lines, each no wider than the terminal, so that it can be drawn again in place (TP-01). A row is
// its focus mark, its one pip (Indicator), its words and at most two icons. The row focused is lit, its long words
// wrapped rather than cut, and under it what it costs or risks; on asking (?), its whole. Every other row is one line,
// cut where it is too long. Where the rows are more than the room, a window about the focus, with how many lie above
// and below.
export class TerminalPickerView {
  static lines(p: TerminalPicker, room: Room): string[] {
    const { shows } = room, width = Math.max(20, room.width - 1);
    const blocks = p.visible.map((row, i) => this.row(p, row, { i, width, shows }));
    const head = p.menu.title ? [TerminalColour.bold(TerminalWidth.cut(p.menu.title, width), shows.depth)] : [];
    const foot = this.footer(p, width, shows);
    const body = this.window(blocks, p.focus, Math.max(4, room.height - head.length - foot.length));
    return [...head, ...body, ...foot];
  }
  private static row(p: TerminalPicker, row: Row, at: { i: number; width: number; shows: Shows }): string[] {
    const { i, width, shows } = at, d = shows.depth, focused = i === p.focus, prev = p.visible[i - 1];
    const group = row.group && !row.header && row.group !== prev?.group ? [TerminalColour.dim(`  ${row.group}`, d)] : [];
    const gap = row.info && !prev?.info ? [''] : [];
    const signed = { ...row.signed ?? {}, aspects: row.aspects ?? [] };
    const indicated = TerminalColour.indicated(signed);
    const fold = p.opened.has(row.group ?? '') ? '▾' : '▸';
    const pip = row.header ? fold : row.info || row.id === TerminalPicker.more ? ' '
      : TerminalColour.pip(indicated, shows, signed.sensed);
    const icons = indicated.icons.map(x => TerminalColour.sign(x, shows.unicode)).join(' ');
    const mark = focused ? (shows.unicode ? '›' : '>') : ' ';
    // The icons after the words' last line: each line is cut or wrapped to leave them room.
    const room = width - 4 - (icons ? TerminalWidth.of(icons) + 1 : 0);
    const words = focused ? TerminalWidth.wrap(row.label, room) : [TerminalWidth.cut(row.label, room)];
    const lines = words.map((w, n) => `${n ? '   ' : `${mark} ${pip}`} ${this.lit(w, { row, focused, shows })}`
      + `${icons && n === words.length - 1 ? ` ${icons}` : ''}`);
    return [...gap, ...group, ...lines, ...focused ? this.under(p, row, width, shows) : []];
  }
  // A row's words: lit where it is focused, dim where it has nothing new or cannot be chosen, and through its tones
  // where the prism experiment is asked for.
  private static lit(words: string, o: { row: Row; focused: boolean; shows: Shows }): string {
    const { row, focused, shows } = o, d = shows.depth;
    if (row.info || row.header || row.id === TerminalPicker.more || row.shut || row.signed?.idle) {
      return focused ? TerminalColour.bold(words, d) : TerminalColour.dim(words, d);
    }
    const coloured = shows.prism ? TerminalColour.prism(words, row.aspects ?? [], d) : words;
    return focused ? TerminalColour.bold(coloured, d) : coloured;
  }
  // Under the row focused: its note, what a grave act asks, why it cannot be chosen, and on asking its whole.
  private static under(p: TerminalPicker, row: Row, width: number, shows: Shows): string[] {
    const d = shows.depth, said: string[] = [];
    if (row.note) { said.push(row.note); }
    if (row.shut) { said.push(row.shut); }
    if (p.asking === row.id && row.ask) { said.push(row.ask); }
    if (p.about === row.id) { said.push(...row.about ?? [], ...row.about?.length ? [] : ['Nothing more is known of it.']); }
    if (p.said && p.said !== row.shut) { said.push(p.said); }
    return said.flatMap(s => TerminalWidth.wrap(s, width - 4)).map(l => TerminalColour.dim(`    ${l}`, d));
  }
  // The keys, quietly under the picker: how to choose, unfold, ask and go back, and every other key on asking (/).
  private static footer(p: TerminalPicker, width: number, shows: Shows): string[] {
    const arrows = shows.unicode ? '↑↓ ⏎' : 'j/k enter';
    const more = p.menu.rest?.length ? [p.unfolded ? '← fewer' : '→ more'] : [];
    const grouped = p.visible.some(r => r.group) ? ['[ ] group'] : [];
    // A menu's own keys said where they are few (a fight's f), behind / where they are many (a scene's ten).
    const own = Object.entries(p.menu.keys ?? {}).map(([k, v]) => `${k} ${v.said}`);
    const keys = p.keyed || own.length <= 2 ? [...grouped, ...own, 'q leave'] : ['/ keys'];
    const said = [`${arrows} choose`, ...more, '? about', ...p.menu.back ? ['← back'] : [], ...keys];
    return ['', ...TerminalWidth.wrap(said.join(' · '), width)].map(l => TerminalColour.dim(l, shows.depth));
  }
  // The blocks that fit about the focus, with how many rows lie beyond them each way.
  private static window(blocks: string[][], focus: number, height: number): string[] {
    const total = blocks.reduce((n, b) => n + b.length, 0);
    if (total <= height) { return blocks.flat(); }
    let from = focus, to = focus + 1, used = blocks[focus]?.length ?? 0;
    const room = height - 2;
    while (true) {
      const down = to < blocks.length && used + blocks[to]!.length <= room;
      if (down) { used += blocks[to++]!.length; }
      const up = from > 0 && used + blocks[from - 1]!.length <= room;
      if (up) { used += blocks[--from]!.length; }
      if (!down && !up) { break; }
    }
    return [...from ? [`  ↑ ${from} more`] : [], ...blocks.slice(from, to).flat(),
      ...to < blocks.length ? [`  ↓ ${blocks.length - to} more`] : []];
  }
}
