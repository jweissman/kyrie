import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ident } from '../../web/reader/ident';
import { TitlePage } from '../../web/reader/title-page';
import { Identity } from '../../src/presentation/identity';
import { ColourCensus } from '../support/colour-census';

// The opening passage, the studio's stab into the title into creation (TO-03), as the owner asked it on 25 November.
// The stab is the Atlas's indicator in heroic size, every tone flowing through it (the owner, 26 November); the
// title's embers are tilted cool and kept on one clock, so that each page that draws them carries them on, and the
// first page of the choosing lets them go out once (OR-530).
const frame = readFileSync('web/reader/frame.css', 'utf8');
const rule = (selector: string) => [...ColourCensus.rules(frame)].find(r => r.selector === selector)?.body ?? '';

describe('the opening passage', () => {
  it('draws the stab as the Atlas indicator in heroic size, every tone flowing through it, nothing flashing', () => {
    const html = renderToStaticMarkup(createElement(Ident.View, { studio: Identity.studio }));
    expect(html).toContain('class="indicator"');
    const bar = rule('.ident .indicator');
    for (const t of Ident.tones) { expect(bar).toContain(`var(--tone-${t})`); }
    expect(bar).toMatch(/linear-gradient\(in oklab/);
    // Its colours flow by the gradient's position alone: no keyframe of the mark's changes its light.
    expect(frame).not.toMatch(/@keyframes indicator-flow[^}]*\{[^}]*(opacity|filter|brightness)/);
  });
  it('tilts the embers cool, within grey', () => {
    const mote = rule('.motes i');
    expect(mote).toMatch(/background: rgb\(212, 224, 248\)/);
    expect(ColourCensus.greyless(mote)).toBe(false);
  });
  it('carries the embers on one clock, and lets them go out once in creation', () => {
    const delays = (html: string) => [...html.matchAll(/--d:(-?[\d.]+)s/g)].map(m => Number(m[1]));
    const first = delays(renderToStaticMarkup(createElement(TitlePage.Motes)));
    const at = performance.now();
    while (performance.now() - at < 30) { /* the clock moves on */ }
    const later = renderToStaticMarkup(createElement(TitlePage.Motes, { settle: true }));
    expect(later).toContain('class="motes settling"');
    const shift = delays(later).map((d, i) => first[i]! - d);
    expect(Math.min(...shift)).toBeGreaterThan(0.02);
    expect(Math.max(...shift) - Math.min(...shift)).toBeLessThan(0.002);
    expect(rule('.motes.settling')).toMatch(/animation: settle/);
  });
});
