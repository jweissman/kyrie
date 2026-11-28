import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ident } from '../../../web/reader/ident';
import { Identity } from '../../../src/presentation/identity';
import { SiteBuild } from '../../../src/cli/site-build';
import { ColourCensus } from '../../support/colour-census';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The studio's stab, a little more interesting (the
// owner, 27 November: "Studio stab could be more interesting"; OR-1804): as the indicator rises, sparks are struck
// from its tip and go up into the dark, the title's embers' first, the mark itself still the studio's, small, with no
// wordmark. Within its timing: every spark is out before the mark goes to black, so that it plays whole as it did
// (test/studio-mark-browser). In no colour, and once.
const frame = readFileSync('web/reader/frame.css', 'utf8');
const rule = (selector: string) => [...ColourCensus.rules(frame)].find(r => r.selector === selector)?.body ?? '';

describe('Interface › The studio\'s mark, struck', () => {
  it('strikes sparks from the indicator\'s tip as it rises, each out before the mark goes', () => {
    const html = renderToStaticMarkup(createElement(Ident.View, { studio: Identity.studio }));
    expect((html.match(/class="spark"/g) ?? []).length).toBe(Ident.sparks.length);
    // The early mark the page paints before its script is the same (SiteBuild.mark).
    expect((SiteBuild.mark().match(/class="spark"/g) ?? []).length).toBe(Ident.sparks.length);
    for (const s of Ident.sparks) {
      expect(s.at).toBeGreaterThanOrEqual(Ident.at.rise);
      expect(s.at + s.lasts).toBeLessThanOrEqual(Ident.length * 0.85);
    }
    // Struck higher on the indicator the later it is, as its tip rises.
    const heights = Ident.sparks.map(s => s.height);
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
  });
  it('draws them in no colour, once, by their light and place alone', () => {
    const spark = rule('.ident .spark');
    expect(ColourCensus.greyless(spark)).toBe(false);
    expect(spark).toMatch(/animation: spark var\(--st\) var\(--sd\) ease-out both/);
    const keys = /@keyframes spark \{([^@]*?)\}\s*\n/.exec(frame)?.[1] ?? '';
    expect(keys).toMatch(/opacity/);
    expect(keys).not.toMatch(/color|background|filter|box-shadow/);
  });
});
