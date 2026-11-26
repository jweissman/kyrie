import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The page's colour grammar read from its style sheets (the owner, 24 November, OR-187): colour belongs to the atlas's
// indicators; words are neutral, and gold is seen only in an indicator (or the book's aim); nothing flashes a colour.
// Three findings, each by file and selector: words set in gold (a rule whose `color` is gold, its selector not an
// indicator's), grounds filled with gold (its background), and an animation whose frames set a hued colour (gold,
// ember, verdigris, azure, violet, a tone; or an rgb or hex colour far from grey). And words set in any hue at all, not
// gold alone (OR-291: the glance's tags had said a fight in ember and the night in azure, words, not indicators). Every
// sheet of the page's, in its folders too. Read by test/small/colour-grammar, which holds each at none (OR-189).
export class ColourCensus {
  static readonly dir = join(import.meta.dir, '../../web/reader');
  // An indicator's selector: a row's mark, a pip, the rail's or a place's mark, a lit corner key, a way's glyph.
  static readonly indicator =
    /row-mark|\bpip\b|pip-|rail-mark|place-mark|\.led\b|::before|glyph|\.dot\b|lamp|\.star\b|\.ident \.indicator\b/;
  static readonly gold = /--gold|--tone-gold|#F2BD4C/i;
  static readonly hued = /--(gold|ember|verdigris|azure|violet|tone-|red\b|blue\b|yellow\b|river|danger)/;
  static strip(css: string): string { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }
  // Each innermost rule, as its selector and its declarations.
  static *rules(css: string): Generator<{ selector: string; body: string }> {
    for (const m of this.strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      yield { selector: m[1]!.trim().replace(/\s+/g, ' '), body: m[2]! };
    }
  }
  static greyless(value: string): boolean {
    for (const m of value.matchAll(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/g)) {
      const c = [m[1], m[2], m[3]].map(Number);
      if (Math.max(...c) - Math.min(...c) > 40) { return true; }
    }
    for (const m of value.matchAll(/#([0-9a-f]{6})\b/gi)) {
      const c = [0, 2, 4].map(i => parseInt(m[1]!.slice(i, i + 2), 16));
      if (Math.max(...c) - Math.min(...c) > 40) { return true; }
    }
    return false;
  }
  static files(): string[] {
    return readdirSync(this.dir, { recursive: true }).map(String).filter(f => f.endsWith('.css')).sort();
  }
  // Words in gold: a rule setting `color` to gold, not an indicator's.
  static goldWords(): string[] {
    const out: string[] = [];
    for (const f of this.files()) {
      for (const r of this.rules(readFileSync(join(this.dir, f), 'utf8'))) {
        const color = /(?:^|;)\s*color\s*:([^;]*)/.exec(r.body)?.[1] ?? '';
        if (this.gold.test(color) && !this.indicator.test(r.selector)) { out.push(`${f}: ${r.selector}`); }
      }
    }
    return out;
  }
  // Words in any hue: a rule setting `color` to a hued colour, or an rgb or hex one far from grey, not an indicator's.
  static huedWords(): string[] {
    const out: string[] = [];
    for (const f of this.files()) {
      for (const r of this.rules(readFileSync(join(this.dir, f), 'utf8'))) {
        const color = /(?:^|;)\s*color\s*:([^;]*)/.exec(r.body)?.[1] ?? '';
        if ((this.hued.test(color) || this.greyless(color)) && !this.indicator.test(r.selector)) {
          out.push(`${f}: ${r.selector}`);
        }
      }
    }
    return out;
  }
  // Grounds in gold: a rule filling something with gold (its background), not an indicator's.
  static goldGrounds(): string[] {
    const out: string[] = [];
    for (const f of this.files()) {
      for (const r of this.rules(readFileSync(join(this.dir, f), 'utf8'))) {
        const ground = [...r.body.matchAll(/(?:^|;)\s*background(?:-color)?\s*:([^;]*)/g)].map(m => m[1]!).join(' ');
        if (this.gold.test(ground) && !this.indicator.test(r.selector)) { out.push(`${f}: ${r.selector}`); }
      }
    }
    return out;
  }
  // Animations whose frames set a hued colour.
  static flashes(): string[] {
    const out: string[] = [];
    for (const f of this.files()) {
      const css = this.strip(readFileSync(join(this.dir, f), 'utf8'));
      for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
        const set = /(?:color|background(?:-color)?|border(?:-color)?|box-shadow|fill|stroke)\s*:([^;}]*)/g;
        const colours = [...m[2]!.matchAll(set)].map(x => x[1]!);
        if (colours.some(v => this.hued.test(v) || this.greyless(v))) { out.push(`${f}: @keyframes ${m[1]}`); }
      }
    }
    return out;
  }
  // The Atlas's indicators and colours are for the menu's action rows alone (the owner's playtest, 25 November, OR-513:
  // "text should just be text"): a rule that draws a hued colour (a tone, gold, an rgb or hex colour far from grey) in
  // any colour of its own (its words, ground, border, shadow, fill or stroke), or a left border in any colour not
  // neutral, whose selector is not an action row's nor an instrument's. The rows: a choice row and its mark, the
  // glance's acts and tiles, a way, a plate, a chip, an opener, a lens's corner key. The instruments, which draw what
  // they show and are no Atlas: the map and its board, a fight's field and its cards, the observatory of creation, the
  // light and the hour, a gauge's bar, the journey's strip, the dice, the studio's mark, a field's focus, creation's
  // recommended card. Narration, feedback, the notes, the glance's told lines, a conversation's words and the Book
  // are text: none.
  static readonly rows = new RegExp(['choice-row', 'row-mark', '\\.act\\b', 'way-tile', '\\.option\\b', '\\.opener\\b',
    '\\.corner\\b', 'rail-mark', '\\bpip\\b', 'place-mark', 'place-dash', 'wf-row', 'ah-row', '\\.unfolded', 'opened-list'].join('|'));
  static readonly instruments = new RegExp(['field-land', 'atlas-key', '\\.board', '\\.fight', '\\.obs', '\\.flame',
    '\\.gauge', '\\.strip', '\\.throw', '\\.ident', '\\.fields', '\\.campaign-sheet',
    '\\.world-page\\.threatened', 'face(?:\\.whole| img\\.whole)', 'data-theme="folio"', '\\.sheet-key'].join('|'));
  // The custom properties the page's components set inline (a style object's '--x', or setProperty('--x')) whose
  // value may be a colour: a tone chosen at run time that no style sheet shows (the place's mark had drawn its dash in
  // the tone of the place's chief opportunity through '--pm'). A value that is a picture, a length, an angle, a share
  // or a time is none.
  static inline(): Set<string> {
    const out = new Set<string>(), dir = this.dir;
    const sources = readdirSync(dir, { recursive: true }).map(String).filter(f => /\.tsx?$/.test(f));
    for (const f of sources) {
      const src = readFileSync(join(dir, f), 'utf8');
      const value = '(`[^`]*`|[^,}]+)';
      const set = [...src.matchAll(new RegExp(`'--([\\w-]+)'\\s*:\\s*${value}`, 'g')),
        ...src.matchAll(new RegExp(`setProperty\\('--([\\w-]+)',\\s*${value}`, 'g'))];
      for (const [, name, value] of set) {
        if (!/url\(|(?:px|%|deg|s)`/.test(value!)) { out.add(name!); }
      }
    }
    return out;
  }
  // The Atlas's colour in its three marks alone (the owner, 26 November): a place-mark (horizontal: a place's heading
  // dash, the map's town and sign), an action-mark (vertical: a row's mark, a bar inset or bordered at a row's left)
  // and a lens-mark (the rail's marks, a pip, a lens's corner key) with the diamond; and the studio's stab, which is
  // the Atlas's indicator itself, in heroic size (OR-507). Any other rule drawing an Atlas tone (a tone, gold, or a
  // tone set inline at run time) is a finding.
  static readonly marks = new RegExp(['row-mark', 'rail-mark', '\\bpip\\b', 'pip-', 'place-mark', 'place-dash',
    'lenses-mark', '\\.glint\\b', 'prism', '\\.corner\\b', '\\.ident \\.indicator\\b', 'board-town', 'board-sign'].join('|'));
  static atlasOff(): string[] {
    const out: string[] = [], atlas = new RegExp(`var\\(--(tone-|gold\\b|gold\\)|${[...this.inline()].join('|')})`);
    for (const f of this.files()) {
      for (const r of this.rules(readFileSync(join(this.dir, f), 'utf8'))) {
        if (/^(from|to|[\d.%, ]+)$/.test(r.selector) || this.marks.test(r.selector)) { continue; }
        const decls = [...r.body.matchAll(/(?:^|;)\s*([\w-]+)\s*:([^;]*)/g)].filter(m => !m[1]!.startsWith('--')
          && atlas.test(m[2]!));
        // An action-mark: a bar at a row's left, inset (2px or 3px) or its left border.
        const vertical = (p: string, v: string) => /^border-left(-color)?$/.test(p) || (p === 'box-shadow'
          && /^\s*inset [23]px 0 0 \S+\s*$/.test(v));
        if (decls.some(m => !vertical(m[1]!, m[2]!))) { out.push(`${f}: ${r.selector}`); }
      }
    }
    return out;
  }
  static offRow(): string[] {
    const out: string[] = [], inline = [...this.inline()];
    const runtime = (v: string) => inline.some(n => new RegExp(`var\\(--${n}[,)\\s]`).test(v));
    for (const f of this.files()) {
      for (const r of this.rules(readFileSync(join(this.dir, f), 'utf8'))) {
        // A keyframe's frame is no element's (an animation's colours are flashes' to find).
        const frame = /^(from|to|[\d.%, ]+)$/.test(r.selector);
        if (frame || this.rows.test(r.selector) || this.instruments.test(r.selector)) { continue; }
        const decls = [...r.body.matchAll(/(?:^|;)\s*([\w-]+)\s*:([^;]*)/g)].map(m => [m[1]!, m[2]!] as const);
        const hued = decls.some(([p, v]) => /color|background|border|shadow|fill|stroke|outline/.test(p)
          && (this.hued.test(v) || this.greyless(v) || runtime(v)));
        // A bar at the left of words, of any colour (a panel's hairline edge, 1px, is no bar).
        const left = decls.some(([p, v]) => /^border-left$/.test(p) && /\b([2-9]|\d{2,})px/.test(v));
        if (hued || left) { out.push(`${f}: ${r.selector}`); }
      }
    }
    return out;
  }
}
