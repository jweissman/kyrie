import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Told } from '../../web/reader/stage/told';
import type { Frame } from '../../src/creation/protocol';

// The purse in play (CL-66, split from CL-06): what the company has to spend and to eat is said under where and when,
// in the heading every place's page draws, not only in the Book. Drawn only by PlaceStage.You, which nothing
// rendered, it had been in the Book alone. A reading: no control of the page's own.
const frame = (purse: object) => ({ title: 'Porthalen', leaf: {}, screen: { place: { id: 'green', name: 'the landing' },
  path: [], elapsed: 600, weather: 'fair', purse: { coin: 0, rations: 0, other: [], ...purse } } }) as unknown as Frame;
const render = (purse: object) => renderToStaticMarkup(createElement(Told.Heading, { frame: frame(purse) }));

describe('the purse in play', () => {
  it('is said under where and when, coin and rations', () => {
    const html = render({ coin: 12, rations: 3 });
    expect(html).toMatch(/data-id="clock"[\s\S]*data-id="purse"[^>]*>12 coin · 3 rations</);
    expect(html).not.toContain('<button');
  });
  it('by the country\'s own coin, and one ration as one', () => {
    expect(render({ coin: 4, rations: 1, currency: 'crowns' })).toContain('>4 crowns · 1 ration<');
  });
});
