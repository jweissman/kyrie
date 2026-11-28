import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Embers } from '../../../web/reader/embers';
import { ColourCensus } from '../../support/colour-census';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The title's embers blow in the wind (the owner, 27
// November: "Why isn't title just a little more interesting? Maybe the embers could blow in the wind?"; OR-1803): each
// spark is carried in a slow wind that rises into a gust and falls away, reaching it a little later the further right
// it stands, so that a gust is seen to cross the dark; the lighter sparks carried further. Nothing in it is a colour or
// flashes, it keeps the motes' one clock, and one who asks for less motion is shown none of it.
const frame = readFileSync('web/reader/frame.css', 'utf8');
const rule = (selector: string) => [...ColourCensus.rules(frame)].find(r => r.selector === selector)?.body ?? '';
const keyframes = (name: string) => new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\}\\s*(?=@|\\.|/\\*|$)`).exec(frame)?.[1] ?? '';

describe('Interface › The title\'s embers in the wind', () => {
  it('carries each spark in a gust that crosses the dark from the left, the lighter further', () => {
    const html = renderToStaticMarkup(createElement(Embers.View));
    const shape = /<span class="gust" style="--x:(\d+)%;--wind:(\d+)px;--wind-at:(-?[\d.]+)s"><i /g;
    const gusts = [...html.matchAll(shape)]
      .map(m => ({ x: Number(m[1]), g: Number(m[2]), at: Number(m[3]) }));
    expect(gusts).toHaveLength(Embers.count);
    // Further right, reached later: its place in the wind's cycle is behind the one at its left.
    const byX = [...gusts].sort((a, b) => a.x - b.x);
    for (let i = 1; i < byX.length; i++) { expect(byX[i]!.at).toBeGreaterThanOrEqual(byX[i - 1]!.at); }
    // The smallest sparks are carried furthest, on the whole.
    const reach = (s: number) => gusts.filter((_, i) => 2 + (i % 3) === s).reduce((t, x) => t + x.g, 0);
    expect(reach(2)).toBeGreaterThan(reach(4));
  });
  it('moves the sparks only, by the wind\'s one cycle, in no colour, and not at all for less motion', () => {
    expect(rule('.motes .gust')).toMatch(new RegExp(`animation: gust ${Embers.cycle}s ease-in-out var\\(--wind-at\\) infinite`));
    expect(keyframes('gust')).toMatch(/transform: translateX/);
    expect(keyframes('gust')).not.toMatch(/opacity|color|background|filter/);
    expect(ColourCensus.greyless(rule('.motes .gust'))).toBe(false);
    expect(frame).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.motes \{ display: none; \}/);
  });
});
