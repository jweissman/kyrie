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
  static readonly indicator = /row-mark|\bpip\b|pip-|rail-mark|place-mark|\.led\b|::before|glyph|\.dot\b|lamp|\.star\b/;
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
}
