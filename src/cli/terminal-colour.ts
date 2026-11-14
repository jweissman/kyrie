import { Emphasis, type Tone } from '../presentation/emphasis';
import { Signs } from '../presentation/signs';
import { Indicator, type Icon, type Indicated } from '../presentation/indicator';
import type { Aspect } from '../presentation/glance-types';
import type { Signed } from './terminal-signs';

export type Depth = 'true' | '256' | 'none';
// What a terminal can show: its colour, whether it has unicode (else each sign's plain character), and the true-colour
// gradient across a label (flag only: KYRIE_PRISM=1).
export interface Shows { depth: Depth; unicode: boolean; prism: boolean }

// The atlas in a terminal, as the page draws it, from the page's one table of tones (Emphasis) and its one indicator
// grammar (Indicator): an act's colour is one pip at its left edge, and what it is besides at most two icons after its
// words. They are drawn in true colour where the terminal shows it, and in the 256-colour cube where it shows that.
// Where it shows none (a pipe, NO_COLOR), each aspect is said by its word instead, so colour is never the only cue.
// Nothing else is coloured: a person, a way or a heading has no tone of its own (the owner, 14 November: TM-03).
export class TerminalColour {
  static depth(env: Record<string, string | undefined> = process.env, tty = !!process.stdout.isTTY): Depth {
    if (env.NO_COLOR !== undefined || (!tty && !env.FORCE_COLOR)) { return 'none'; }
    return /truecolor|24bit/i.test(env.COLORTERM ?? '') ? 'true' : /256/.test(env.TERM ?? '') || env.FORCE_COLOR ? '256'
      : 'none';
  }
  // Unicode unless the locale says otherwise, or KYRIE_ASCII asks for the plain signs.
  static unicode(env: Record<string, string | undefined> = process.env): boolean {
    const locale = env.LC_ALL || env.LC_CTYPE || env.LANG;
    return env.KYRIE_ASCII === undefined && (!locale || /utf-?8/i.test(locale));
  }
  static shows(env: Record<string, string | undefined> = process.env, tty = !!process.stdout.isTTY): Shows {
    return { depth: this.depth(env, tty), unicode: this.unicode(env), prism: env.KYRIE_PRISM === '1' };
  }
  static paint(tone: Tone, text: string, depth: Depth): string {
    const [r, g, b] = Emphasis.rgb[tone];
    if (depth === 'true') { return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`; }
    if (depth === '256') { return `\x1b[38;5;${this.cube(r, g, b)}m${text}\x1b[0m`; }
    return text;
  }
  // The stage's inks (web/reader/foundations.css): ivory for what is read first (a heading, the row in hand), dim for
  // what is said beside it, faint for rules. Two or three inks and the meaning tones, nothing else.
  static readonly inks = { ivory: [236, 230, 217], dim: [165, 159, 148], faint: [110, 106, 98] } as const;
  static ink(ink: keyof typeof TerminalColour.inks, text: string, depth: Depth): string {
    const [r, g, b] = this.inks[ink];
    if (depth === 'true') { return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`; }
    if (depth === '256') { return `\x1b[38;5;${this.cube(r, g, b)}m${text}\x1b[39m`; }
    return text;
  }
  // Weight and slant, where there is colour (what is said to the company is set in italics: the owner, 14 November).
  static bold(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[1m${text}\x1b[22m`; }
  static italic(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[3m${text}\x1b[23m`; }
  static dim(text: string, depth: Depth): string { return depth === 'none' ? text : `\x1b[2m${text}\x1b[22m`; }
  // The nearest of the 256-colour cube's 6 × 6 × 6.
  private static cube(r: number, g: number, b: number): number {
    return 16 + 36 * this.level(r) + 6 * this.level(g) + this.level(b);
  }
  private static level(v: number): number { return v < 48 ? 0 : v < 115 ? 1 : Math.min(5, Math.floor((v - 35) / 40)); }
  // An act's indicator, as the shared grammar has it.
  static indicated(signed: Signed & { aspects?: readonly Aspect[] }): Indicated {
    return Indicator.of({ aspects: signed.aspects ?? [], gilded: true, ...signed.crosses ? { crosses: true } : {},
      ...signed.hold ? { hold: true } : {},
      ...signed.sensed ? { sensed: { aspect: signed.sensed, far: signed.far ?? 1 } } : {} });
  }
  // The one cell at an act's left edge: its colour's pip; without colour, its colour's sign; perceived along a way and
  // not here, faint; otherwise nothing.
  // A companion perceived along a way is said in words, never a faint rose (TP-03).
  static pip(ind: Indicated, shows: Pick<Shows, 'depth' | 'unicode'>, perceived?: Aspect): string {
    const { depth, unicode } = shows, sensed = perceived === 'companionship' ? undefined : perceived;
    if (depth === 'none') {
      const a = ind.aspect ?? sensed;
      return a ? this.sign(Indicator.icon(a), unicode) : ' ';
    }
    if (ind.tone) { return this.paint(ind.tone, '▌', depth); }
    return sensed ? this.dim(this.paint(Emphasis.tones[sensed], '▌', depth), depth) : ' ';
  }
  static sign(icon: Icon, unicode: boolean): string { return unicode ? icon.sign : icon.plain; }
  // A choice drawn for a line-by-line terminal: its pip (or its words, without colour) before its number and words,
  // and after them its icons (Indicator) and what the page draws beside them in words (Signs): its minutes, what it
  // risks, what is perceived that way. A way with nothing new is dim, or said so.
  static choice(n: number, label: string, signed: Signed & { aspects?: readonly Aspect[] }, depth: Depth): string {
    const words = Indicator.said(signed.aspects ?? []);
    // What is perceived along a way said in words wherever it is, not only on a way of no colour of its own.
    const after = [...signed.bearing ? [signed.bearing] : [], ...signed.tags ?? [],
      ...Indicator.tells(signed.sensed) ? [Signs.sensed(signed.sensed!, signed.far)] : [],
      ...signed.idle && depth === 'none' ? [Signs.idle] : []].map(t => ` · ${t}`).join('');
    if (depth === 'none') {
      const held = `${label}${signed.hold ? ` ${Signs.hold.sign}` : ''}`;
      return `${n}. ${held}${after}${words.length ? `  [${words.join(', ')}]` : ''}`;
    }
    const ind = this.indicated(signed), icons = ind.icons.map(i => ` ${i.sign}`).join('');
    const line = `${n}. ${label}${icons}${after}`;
    return `${this.pip(ind, { depth, unicode: true }, signed.sensed)}   ${signed.idle ? this.dim(line, depth) : line}`;
  }
  // The experiment the brief allows behind a flag alone: a label coloured through the act's first two tones, in true
  // colour (KYRIE_PRISM=1). Never the default: one colour is the grammar.
  static prism(text: string, aspects: readonly Aspect[], depth: Depth): string {
    const tones = Emphasis.ranked(aspects).slice(0, 2).map(a => Emphasis.rgb[Emphasis.tones[a]]);
    if (depth !== 'true' || tones.length < 2) { return text; }
    const chars = [...text], a = tones[0]!, b = tones[1]!;
    return `${chars.map((ch, i) => this.blend(a, b, chars.length > 1 ? i / (chars.length - 1) : 0) + ch).join('')}\x1b[0m`;
  }
  private static blend(a: readonly number[], b: readonly number[], t: number): string {
    const c = a.map((v, k) => Math.round(v + (b[k]! - v) * t));
    return `\x1b[38;2;${c[0]};${c[1]};${c[2]}m`;
  }
}
