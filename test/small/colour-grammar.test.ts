import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColourCensus } from '../support/colour-census';

// Colour belongs to the atlas's indicators; words are neutral; gold is seen only in an indicator; nothing flashes a
// colour (the owner, 24 November, OR-187). The page's style sheets read for words set in gold, grounds filled with
// gold and animations of a hued colour, held to a baseline that can only shrink (OR-189 burns it down). And the two the
// owner found: a row lit, pressed or taken tints its ground in neutral ink whatever its tone (a gold row had flashed
// gold), and a reply the atlas marks shows its indicator, its words the ink of every reply (the aim's gold had been the
// words' colour).
const kept = JSON.parse(readFileSync(join(import.meta.dir, 'colour-grammar.baseline.json'), 'utf8')) as
  Record<'goldWords' | 'goldGrounds' | 'flashes', string[]>;
const css = (f: string) => ColourCensus.strip(readFileSync(join(ColourCensus.dir, f), 'utf8'));

describe('the colour grammar', () => {
  it.each(['goldWords', 'goldGrounds', 'flashes'] as const)('adds no %s', which => {
    const now = { goldWords: ColourCensus.goldWords(), goldGrounds: ColourCensus.goldGrounds(),
      flashes: ColourCensus.flashes() }[which];
    expect(now.filter(x => !kept[which].includes(x))).toEqual([]);
    // One mended leaves the baseline, so it cannot come back unseen.
    expect(kept[which].filter(x => !now.includes(x))).toEqual([]);
  });
  it('lights a row in neutral ink, never its tone', () => {
    expect(css('menu.css')).not.toMatch(/choice-row[^{]*\{\s*--row-tone:\s*var\(--tone-/);
  });
  it('marks a reply by its indicator, not by the colour of its words', () => {
    const talk = css('talk.css');
    expect(talk).toMatch(/li\.marked > \.choice-row\.choice-row > \.row-mark \{ display: block/);
    expect([...ColourCensus.rules(talk)].filter(r => /replies/.test(r.selector) && /color:\s*var\(--(tone-|gold)/.test(r.body)))
      .toEqual([]);
  });
});
