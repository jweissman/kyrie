import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// Nothing on the page flashes or blinks a colour, the Atlas's least of all (the owner, 23 November: "the only place we
// should see that color is in explicit atlas indicators … and we should never use flashing colors in general"; and
// 24 November: "make sure there's nothing flashing/blinking atlas colors, especially in the world map"). Read from the
// page's own stylesheets: every @keyframes and every animation that uses one. The world map's moving parts are its
// sky's drift (board-look's shaders: haze and cloud, never a mark) and the camera, which are not CSS.
class Sheets {
  // The colours an indicator is drawn in: never animated.
  static readonly atlas = ['gold', 'gold-glow', 'gold-line', 'gold-bright', 'gold-deep', 'ember', 'ember-glow',
    'verdigris', 'azure', 'violet', 'life', 'hour', 'blue', 'red', 'yellow', 'touch-glow'];
  static readonly colour = ['color', 'background', 'background-color', 'background-image', 'fill', 'stroke',
    'border-color', 'box-shadow', 'outline-color', 'text-shadow', 'filter'];
  // What is drawn as an opportunity's mark, on a row, a person or the map.
  static readonly marks = /prism|row-mark|\bpip\b|\.mark\b|indicator|board-sign|board-town|aim|::before/;
  static all(): { file: string; text: string }[] {
    return [...new Glob('web/reader/**/*.css').scanSync('.')].sort().map(file => ({ file, text: readFileSync(file, 'utf8') }));
  }
  static keyframes(): { name: string; body: string; file: string }[] {
    const out: { name: string; body: string; file: string }[] = [];
    for (const { file, text } of this.all()) {
      for (const m of text.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
        let i = m.index + m[0].length, depth = 1;
        for (; depth && i < text.length; i++) { depth += text[i] === '{' ? 1 : text[i] === '}' ? -1 : 0; }
        out.push({ name: m[1]!, body: text.slice(m.index + m[0].length, i - 1), file });
      }
    }
    return out;
  }
  // Each rule that runs an animation: its selector, the keyframes it names, and how many times.
  static runs(): { selector: string; name: string; times: string; file: string }[] {
    const out: { selector: string; name: string; times: string; file: string }[] = [];
    for (const { file, text } of this.all()) {
      const flat = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
      for (const m of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const a = /animation\s*:\s*([^;]+)/.exec(m[2]!)?.[1];
        if (!a || /^\s*none/.test(a)) { continue; }
        const name = a.split(/\s+/).find(w => /^[a-z][\w-]*$/i.test(w) && !Sheets.timing.test(w));
        const times = /\binfinite\b/.test(a) ? 'infinite' : /\s(\d+)(\s|;|$)/.exec(` ${a} `)?.[1] ?? '1';
        if (name) { out.push({ selector: m[1]!.trim(), name, times, file }); }
      }
    }
    return out;
  }
  // The words of an animation that are not its name.
  static readonly timing =
    /^(ease|linear|both|forwards|backwards|infinite|alternate|var|normal|reverse|running|paused)/;
  static hex(h: string): number[] {
    return h.length === 3 ? [...h].map(c => parseInt(c + c, 16)) : [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  }
  static changesColour(body: string): boolean {
    return this.colour.some(p => new RegExp(`(^|[;{\\s])${p}\\s*:`).test(body));
  }
  // An atlas token, or a literal colour that is not near grey (white, ivory and black are neutral).
  static atlasIn(body: string): string[] {
    const tokens = [...body.matchAll(/var\(--([\w-]+)/g)].map(m => m[1]!).filter(t => this.atlas.includes(t));
    const literals = [...body.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(([^)]+)\)/gi)].filter(m => {
      const rgb = m[1] ? this.hex(m[1]) : m[2]!.split(',').slice(0, 3).map(Number);
      return Math.max(...rgb) - Math.min(...rgb) > 40;
    }).map(m => m[0]);
    return [...tokens, ...literals];
  }
}

describe('nothing flashes or blinks a colour', () => {
  const frames = Sheets.keyframes(), runs = Sheets.runs();
  it('animates no atlas colour, nor any colour that is not neutral', () => {
    expect(frames.flatMap(k => Sheets.atlasIn(k.body).map(c => `${k.file} @keyframes ${k.name}: ${c}`))).toEqual([]);
  });
  it('repeats no animation that changes a colour', () => {
    const coloured = new Set(frames.filter(k => Sheets.changesColour(k.body)).map(k => k.name));
    expect(runs.filter(r => coloured.has(r.name) && r.times !== '1').map(r => `${r.file} ${r.selector}: ${r.name} ×${r.times}`))
      .toEqual([]);
  });
  it('repeats no animation on what draws an opportunity\'s mark', () => {
    expect(runs.filter(r => Sheets.marks.test(r.selector) && r.times !== '1'
      && !/flame|obs-/.test(r.selector)).map(r => `${r.file} ${r.selector}: ${r.name} ×${r.times}`)).toEqual([]);
  });
  it('reads the page\'s animations (the census is not empty)', () => {
    expect(frames.length).toBeGreaterThan(20);
    expect(runs.length).toBeGreaterThan(20);
  });
});
