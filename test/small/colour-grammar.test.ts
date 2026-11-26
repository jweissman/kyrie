import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColourCensus } from '../support/colour-census';

// Colour belongs to the atlas's indicators; words are neutral; gold is seen only in an indicator; nothing flashes a
// colour (the owner, 24 November, OR-187). The page's style sheets read for words set in gold, grounds filled with
// gold and animations of a hued colour: none (OR-189 burnt the census's thirteen down; it holds them at zero). And the
// two the owner found: a row lit, pressed or taken tints its ground in neutral ink whatever its tone (a gold row had
// flashed gold), and a reply the atlas marks shows its indicator, its words the ink of every reply (the aim's gold had
// been the words' colour).
const css = (f: string) => ColourCensus.strip(readFileSync(join(ColourCensus.dir, f), 'utf8'));

describe('the colour grammar', () => {
  it('sets no words in gold', () => { expect(ColourCensus.goldWords()).toEqual([]); });
  // Nor in any other hue (OR-291): a tag, a kicker, a hurt are words; their colour, where they have one, is the row's
  // indicator's.
  it('sets no words in any hue', () => { expect(ColourCensus.huedWords()).toEqual([]); });
  it('fills no ground with gold', () => { expect(ColourCensus.goldGrounds()).toEqual([]); });
  // The Atlas's indicators and colours on the menu's action rows alone (the owner, 25 November, OR-513: "text should
  // just be text"): no hued colour nor bar at the left of words in narration, feedback, the notes, the glance's told
  // lines, a conversation's words or the Book. Its twenty-one found burnt down to none, held there.
  it('draws no indicator nor Atlas colour off the action rows', () => { expect(ColourCensus.offRow()).toEqual([]); });
  // A colour set at run time through a custom property inline in a component counts as a colour (the place's mark's
  // dash had taken the place's tone through '--pm'): the reader finds the ones set, a row's and a pip's among them.
  it('reads the colours components set inline', () => {
    expect([...ColourCensus.inline()]).toEqual(expect.arrayContaining(['prism', 'pip', 'wf-tone']));
  });
  // The Atlas's colour only in its three marks (the owner, 26 November): place-marks (horizontal), action-marks
  // (vertical) and lens-marks with the diamond; nothing else, held at none.
  it('draws the Atlas\'s colour only in its three marks', () => { expect(ColourCensus.atlasOff()).toEqual([]); });
  it('flashes no colour', () => { expect(ColourCensus.flashes()).toEqual([]); });
  it('lights a row in neutral ink, never its tone', () => {
    expect(css('menu.css')).not.toMatch(/choice-row[^{]*\{\s*--row-tone:\s*var\(--tone-/);
  });
  it('marks a reply by its indicator, not by the colour of its words', () => {
    const talk = css('talk.css');
    expect(talk).toMatch(/li\.marked > \.choice-row\.choice-row > \.row-mark \{ display: block/);
    const gilt = [...ColourCensus.rules(talk)].filter(r => /replies/.test(r.selector)
      && /color:\s*var\(--(tone-|gold)/.test(r.body));
    expect(gilt).toEqual([]);
  });
});
