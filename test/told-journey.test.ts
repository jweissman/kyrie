import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Journey } from '../web/reader/stage/journey';

// A journey along known ways is told leg by leg on the page it ends at; what came of the last leg is that page's own
// telling, so it is not said again among the legs (play 8: a companion's word on coming to a tower was said twice).
describe('a journey told where it ends', () => {
  const travel = { to: 'Aurumvigilia', arrived: true, legs: [
    { place: 'the bailey of Holmtun', at: 'Day 1, 9:13 a.m.', journey: [], lines: ['The gate stands open.'] },
    { place: 'Aurumvigilia', at: 'Day 1, 11:13 a.m.', journey: ['A wind comes across the open country.'],
      lines: ['Ghokarn looks at it, then at the sky.'] }] };
  const html = renderToStaticMarkup(createElement(Journey.View, { travel }));
  it('says how each way went, and what came of every leg but the last', () => {
    expect(html).toContain('The gate stands open.');
    expect(html).toContain('A wind comes across the open country.');
    expect(html).toContain('Aurumvigilia');
  });
  it('leaves what came of the last leg to the page', () => {
    expect(html).not.toContain('Ghokarn looks at it');
  });
});
