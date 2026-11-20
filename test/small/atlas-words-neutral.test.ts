import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';

// Atlas colours belong to the indicators, never to the words beside them (the owner's playtest, 19 November, AT-03:
// "Atlas colors should belong to semantic indicators, not generally tint menu text"). A choice's title (.n), a led
// key or a bound town on the board keeps the ordinary colour; the gold or the tone is its mark's alone.
describe('the words of a choice are never tinted by its aspect', () => {
  const sheets = readdirSync('web/reader').filter(f => f.endsWith('.css'))
    .map(f => [f, readFileSync(`web/reader/${f}`, 'utf8')] as const);
  const tones = /color:\s*(?:color-mix\([^)]*)?var\(--(?:tone|gold|verdigris|azure|ember|violet)\)/;
  const rules = sheets.flatMap(([f, css]) => [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .map(m => ({ f, selector: m[1]!.replace(/\/\*[\s\S]*?\*\//g, '').trim(), body: m[2]! })));
  it('colours no title of an act, led or aimed, in a tone', () => {
    // A tag drawn after the title ("your aim", ::after) is a mark, like .mark-tag, not the title's words.
    const tinted = rules.filter(r => /\.(?:led-act|aimed|led)\b[^,]*\s\.n\b(?!::)/.test(r.selector)
      && tones.test(r.body));
    expect(tinted.map(r => `${r.f}: ${r.selector}`)).toEqual([]);
  });
  it('colours no led key nor bound town in gold, only their marks', () => {
    const tinted = rules.filter(r => /^\.(?:sheet-key\.led|board-town\.bound)$/.test(r.selector)
      && /(?:^|;)\s*color:/.test(r.body));
    expect(tinted.map(r => `${r.f}: ${r.selector}`)).toEqual([]);
  });
});
