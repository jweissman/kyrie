import { describe, expect, it } from 'bun:test';
import { Fits } from '../../../src/ui/fits';
import { PaintedSky } from '../../../src/ui/painted-sky';
import { Scenery } from '../../../src/ui/scenery';
import type { PlaceRef, Screen } from '../../../src/ui/screen-types';

// The painting is the place (the resting scene: a painting is never replaced by text), and it keeps to the sky
// (BRIEF §3.4). A new life's first steps had shown no painting one frame in five (the quantity gate's painting misses,
// 27 November, OR-1760): the road, the market-place and the inn's garden in rain, fog or storm, and the way in over a
// causeway on a fair day, each because the first list of paintings its place was given held something and none of it
// fitted the sky, and nothing after it was asked. Now a list none of which fits gives way to the next (the kind to
// the town or the land it lies in, the land to the wild), never to a painting against the sky; and of those that fit,
// the ones painted in the sky's own weather come first. No world is started: the place is a screen as play builds it.
const town: PlaceRef = { id: 'region__s1', name: 'Greenley', kind: 'settlement' };
const at = (name: string, sky: { weather: string; daylight?: string; terrain?: string; season?: string },
  within: PlaceRef[] = [town]): Screen => {
  const place: PlaceRef = { id: `region__s1_${name.split(' ').at(-1)!}`, name, kind: 'room', open: true };
  return { path: [{ id: 'region', name: 'the country', kind: 'region' }, ...within, place], place, dark: false,
    weather: sky.weather, expedition: { daylight: sky.daylight ?? 'day' },
    region: { areas: [], terrain: sky.terrain ?? 'forest', edges: [], within: {} },
    date: { short: '', long: `the 1st; ${sky.season ?? 'summer'}` } } as unknown as Screen;
};
// The painting the page draws, and whether it is resolved: there, and not against the sky.
const drawn = (s: Screen, painting = Scenery.seen(s)) => [painting !== undefined, PaintedSky.of(s, painting).fault];
describe('a place painted for the sky it is under', () => {
  it('gives a kind whose paintings are all of a dry day to what it lies in, in rain, fog and storm', () => {
    for (const name of ['the market-place of Greenley', 'the inn\'s back garden', 'the road into Greenley']) {
      for (const weather of ['rainy', 'foggy', 'stormy']) {
        expect([name, weather, ...drawn(at(name, { weather }))]).toEqual([name, weather, true, undefined]);
      }
      // On a fair day its own kind's painting still stands.
      expect([name, Scenery.seen(at(name, { weather: 'fair' }))?.startsWith('scene-')]).toEqual([name, true]);
    }
  });
  it('gives a kind painted only by day to the town\'s night after dark', () => {
    for (const daylight of ['evening', 'night']) {
      expect([daylight, ...drawn(at('the market-place of Greenley', { weather: 'fair', daylight }))])
        .toEqual([daylight, true, undefined]);
    }
  });
  it('paints the sky\'s own weather first: the rain in the rain, the fog in the fog', () => {
    expect(Fits.looked(Scenery.seen(at('the market-place of Greenley', { weather: 'rainy' }))!)?.weather).toBe('rain');
    expect(Fits.looked(Scenery.seen(at('the market-place of Greenley', { weather: 'foggy' }))!)?.weather).toBe('fog');
  });
  it('opens the way in on the land, or the wild, where its own land has nothing for the sky', () => {
    // A marsh's one painting is a bog at dusk in fog: a causeway into a fen town on a fair day, or in rain, had opened
    // on nothing.
    for (const weather of ['fair', 'sunny', 'rainy', 'foggy']) {
      const s = at('the causeway into Greenley', { weather, terrain: 'marsh' });
      expect([weather, ...drawn(s, Scenery.approach(s))]).toEqual([weather, true, undefined]);
    }
  });
});
