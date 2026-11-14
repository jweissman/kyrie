import { TerminalColour, type Shows } from './terminal-colour';
import { TerminalWidth } from './terminal-width';
import { TerminalPicker, type Row } from './terminal-picker';
import { Emphasis } from '../presentation/emphasis';

// Where a picker is drawn: how wide and how tall it may be, and what the terminal shows.
export interface Room { width: number; height: number; shows: Shows }

// A picker drawn as the page's quiet dark stage is (the owner, 15 November: "was hoping for a beautiful term
// experience"). Its question as a heading in ivory over a faint rule; the rows one line each, never reflowed: the
// focus mark, a thin mark and an icon in the row's one meaning tone (Indicator.of), the words; under a rule, one detail
// area of fixed height for the row in hand (to the right, on a terminal 120 wide or more); the keys that apply, dim,
// on the last line. The detail had been wrapped into the list under the row focused, and the list moved under the
// keys. Nothing is coloured for its own sake: the inks are ivory, the terminal's own and dim; the rest is meaning.
export class TerminalPickerView {
  // The detail area's height, always the same; and the width from which it stands beside the list.
  static readonly detail = 3;
  static readonly wide = 120;
  static lines(p: TerminalPicker, room: Room): string[] {
    const { shows } = room, width = Math.max(20, room.width - 1), d = shows.depth;
    const title = p.menu.title ? TerminalWidth.cut(p.menu.title, width) : undefined;
    const head = title ? [TerminalColour.bold(TerminalColour.ink('ivory', title, d), d),
      TerminalColour.ink('faint', '─'.repeat(Math.min(width, TerminalWidth.of(title))), d)] : [];
    const rail = [this.rail(p, width, shows)];
    if (width >= this.wide) { return [...head, ...this.beside(p, room, width), '', ...rail]; }
    const rows = this.list(p, width, shows);
    const body = this.window(rows, p.focus, Math.max(4, room.height - head.length - rail.length - this.detail - 2));
    return [...head, ...body, TerminalColour.ink('faint', '─'.repeat(Math.min(width, 40)), d),
      ...this.about(p, width, shows), ...rail];
  }
  // The list at the left, the detail at its right, a faint line between.
  private static beside(p: TerminalPicker, room: Room, width: number): string[] {
    const left = Math.min(72, Math.floor(width * 0.55)), right = width - left - 3, d = room.shows.depth;
    const rows = this.window(this.list(p, left, room.shows), p.focus, Math.max(4, room.height - 4));
    const detail = this.about(p, right, room.shows, Math.max(this.detail, rows.length));
    return Array.from({ length: Math.max(rows.length, detail.length) }, (_, i) => {
      const l = rows[i] ?? '', pad = ' '.repeat(Math.max(0, left - TerminalWidth.of(l)));
      return `${l}${pad} ${TerminalColour.ink('faint', '│', d)} ${detail[i] ?? ''}`.trimEnd();
    });
  }
  // Each row one line, cut to the width; a group's heading where its rows begin.
  private static list(p: TerminalPicker, width: number, shows: Shows): string[][] {
    return p.visible.map((row, i) => {
      const prev = p.visible[i - 1], d = shows.depth;
      const group = row.group && !row.header && row.group !== prev?.group
        ? [TerminalColour.ink('dim', TerminalWidth.cut(`   ${row.group}`, width), d)] : [];
      const gap = row.info && !prev?.info ? [''] : [];
      return [...gap, ...group, this.row(p, row, { focused: i === p.focus, width, shows })];
    });
  }
  // The focus mark (the page's reticule), a thin mark in the row's tone, its icon in the same tone, its words, and
  // its icons for what it is besides.
  private static row(p: TerminalPicker, row: Row, at: { focused: boolean; width: number; shows: Shows }): string {
    const { focused, width, shows } = at, d = shows.depth;
    // No ring for a held act any more (IG-07): its kind's icon (⧗) says it.
    const signed = { ...row.signed ?? {}, aspects: row.aspects ?? [], hold: undefined };
    const ind = TerminalColour.indicated(signed), tone = ind.tone;
    const mark = focused ? TerminalColour.ink('ivory', shows.unicode ? '▸' : '>', d) : ' ';
    const faint = !tone && signed.sensed && !ind.icons.length;
    const bar = d === 'none' ? TerminalColour.pip(ind, shows, signed.sensed) : tone ? TerminalColour.paint(tone, '▎', d)
      : faint ? TerminalColour.dim(TerminalColour.paint(Emphasis.tones[signed.sensed!], '▎', d), d) : ' ';
    const glyph = row.header ? (p.opened.has(row.group ?? '') ? '−' : '+') : row.icon ?? ' ';
    const icon = tone ? TerminalColour.paint(tone, glyph, d) : TerminalColour.ink(row.icon ? 'dim' : 'faint', glyph, d);
    // An icon the row's own kind says already (a journey's ⇢) is not said twice.
    const after = ind.icons.filter(x => x.sign !== row.icon).map(x => TerminalColour.sign(x, shows.unicode)).join(' ');
    const words = TerminalWidth.cut(row.label, width - 5 - (after ? TerminalWidth.of(after) + 1 : 0));
    const quiet = row.info || row.header || row.id === TerminalPicker.more || row.shut || row.signed?.idle;
    const lit = quiet ? TerminalColour.ink('dim', words, d) : focused
      ? TerminalColour.bold(TerminalColour.ink('ivory', words, d), d)
      : shows.prism ? TerminalColour.prism(words, row.aspects ?? [], d) : words;
    return `${mark}${bar}${icon} ${lit}${after ? ` ${TerminalColour.ink('dim', after, d)}` : ''}`;
  }
  // The row in hand, said in one area of fixed height: its words whole where the list cut them, what it costs or
  // risks, what a grave act asks, why it cannot be chosen; its whole on asking (?), which may run longer. More than
  // fits, the last line says so.
  private static about(p: TerminalPicker, width: number, shows: Shows, height: number = TerminalPickerView.detail)
    : string[] {
    const row = p.focused, d = shows.depth;
    if (!row) { return Array.from({ length: height }, () => ''); }
    const said = [...TerminalWidth.of(row.label) > width - 6 ? [row.label] : [], ...row.note ? [row.note] : [],
      ...row.shut ? [row.shut] : [], ...p.asking === row.id && row.ask ? [row.ask] : [],
      ...row.about ?? [], ...row.kinds && (p.about === row.id || d === 'none') ? [row.kinds] : [],
      ...p.said && p.said !== row.shut ? [p.said] : []];
    const lines = said.flatMap(s => TerminalWidth.wrap(s, Math.max(10, width - 4)));
    const fits = p.about === row.id || lines.length <= height;
    const shown = fits ? lines : [...lines.slice(0, height - 1), '… ? more'];
    return [...shown.map(l => `    ${TerminalColour.ink(p.asking === row.id && l === row.ask ? 'ivory' : 'dim', l, d)}`),
      ...Array.from({ length: Math.max(0, height - shown.length) }, () => '')];
  }
  // The keys that apply here, dim, on one line: how to choose, the rest, asking, back, and a menu's own few (its
  // many behind /).
  private static rail(p: TerminalPicker, width: number, shows: Shows): string {
    const row = p.focused, u = shows.unicode;
    const more = p.menu.rest?.length ? [p.unfolded ? `${u ? '←' : 'h'} fewer` : `${u ? '→' : 'l'} more`] : [];
    const grouped = p.visible.some(r => r.group) ? ['[ ] group'] : [];
    const asking = row && (row.about?.length || row.kinds) ? ['? about'] : [];
    const own = Object.entries(p.menu.keys ?? {}).map(([k, v]) => `${k} ${v.said}`);
    const keys = p.keyed || own.length <= 2 ? [...own, 'q leave'] : ['/ keys'];
    const said = [`${u ? '↑↓ ⏎' : 'j/k enter'} choose`, ...more, ...grouped, ...asking,
      ...p.menu.back ? [`${u ? '←' : 'h'} back`] : [], ...keys];
    return TerminalColour.ink('dim', TerminalWidth.cut(said.join(' · '), width), shows.depth);
  }
  // The rows that fit about the focus, with how many lie beyond them each way.
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
    return [...from ? [`   ↑ ${from} more`] : [], ...blocks.slice(from, to).flat(),
      ...to < blocks.length ? [`   ↓ ${blocks.length - to} more`] : []];
  }
}
