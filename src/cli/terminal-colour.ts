import { Emphasis, type Tone } from '../presentation/emphasis';
import { Signs } from '../presentation/signs';
import type { Aspect } from '../presentation/glance-types';
import type { Signed } from './terminal-signs';

export type Depth = 'true' | '256' | 'none';

// The atlas in a terminal, as the page draws it, from the page's one table of tones (Emphasis). An act's tones make a
// bar at its left edge, one block for each tone it carries (several are its prism). They are drawn in true colour where
// the terminal shows it, and in the 256-colour cube where it shows that. Where it shows none (a pipe, NO_COLOR), each
// tone is said by its word instead, so colour is never the only cue. Nothing else is coloured: a person, a way or a
// heading has no tone of its own (the owner, 14 November: TM-03).
export class TerminalColour {
  static depth(env: Record<string, string | undefined> = process.env, tty = !!process.stdout.isTTY): Depth {
    if (env.NO_COLOR !== undefined || (!tty && !env.FORCE_COLOR)) { return 'none'; }
    return /truecolor|24bit/i.test(env.COLORTERM ?? '') ? 'true' : /256/.test(env.TERM ?? '') || env.FORCE_COLOR ? '256'
      : 'none';
  }
  static paint(tone: Tone, text: string, depth: Depth): string {
    const [r, g, b] = Emphasis.rgb[tone];
    if (depth === 'true') { return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`; }
    if (depth === '256') { return `\x1b[38;5;${this.cube(r, g, b)}m${text}\x1b[0m`; }
    return text;
  }
  // Weight and slant, where there is colour (what is said to the company is set in italics: the owner, 14 November).
  static bold(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[1m${text}\x1b[22m`; }
  static italic(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[3m${text}\x1b[23m`; }
  private static halves(first: Tone, second: Tone, depth: Depth): string {
    const [r, g, b] = Emphasis.rgb[first], [R, G, B] = Emphasis.rgb[second];
    return depth === 'true' ? `\x1b[38;2;${r};${g};${b}m\x1b[48;2;${R};${G};${B}m▌\x1b[0m`
      : `\x1b[38;5;${this.cube(r, g, b)}m\x1b[48;5;${this.cube(R, G, B)}m▌\x1b[0m`;
  }
  // The nearest of the 256-colour cube's 6 × 6 × 6.
  private static cube(r: number, g: number, b: number): number {
    return 16 + 36 * this.level(r) + 6 * this.level(g) + this.level(b);
  }
  private static level(v: number): number { return v < 48 ? 0 : v < 115 ? 1 : Math.min(5, Math.floor((v - 35) / 40)); }
  // A choice drawn: its pip (or its words, without colour) before its words, and after them what the page draws beside
  // them (Signs): the hold's sign, its minutes, what it risks, what is perceived that way. Perceived and not here, its
  // tone is faint; a way with nothing new is dim, or said so.
  static choice(n: number, label: string, signed: Signed & { aspects?: readonly Aspect[] }, depth: Depth): string {
    const aspects = signed.aspects ?? [], tones = aspects.map(a => Emphasis.tones[a]).slice(0, 3);
    const after = [...signed.tags ?? [], ...signed.sensed && !aspects.length ? [Signs.sensed(signed.sensed)] : [],
      ...signed.idle && depth === 'none' ? [Signs.idle] : []].map(t => ` · ${t}`).join('');
    const words = `${label}${signed.hold ? ` ${Signs.hold.sign}` : ''}`;
    if (depth === 'none') {
      return `${n}. ${words}${after}${aspects.length ? `  [${aspects.map(a => Emphasis.words[a]).join(', ')}]` : ''}`;
    }
    // One pip. Where an act is several things at once, the pip is its first two tones in one cell, the half block in
    // the first over a ground of the second: the page's prism, a gradient through its tones, kept in one place. The
    // tones' mean in OKLab would be grey for gold and blue, which says nothing. It had been a bar for each (the
    // owner, 14 November: "not a blended pip but just doubled").
    const faint = !tones.length && signed.sensed ? this.dim(this.paint(Emphasis.tones[signed.sensed], '▌', depth), depth)
      : undefined;
    const bar = tones.length > 1 ? this.halves(tones[0]!, tones[1]!, depth) : tones.length ? this.paint(tones[0]!, '▌', depth)
      : faint ?? ' ';
    const line = `${n}. ${words}${after}`;
    return `${bar}   ${signed.idle ? this.dim(line, depth) : line}`;
  }
  static dim(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[2m${text}\x1b[22m`; }
}
