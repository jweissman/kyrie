import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Moments } from '../web/reader/stage/moments';
import { Panorama } from '../web/reader/stage/panorama';
import { LineMoments } from '../src/presentation/line-moments';

// What can be seen from somewhere high, on the page (Mission 17's vantage points): the view from the top as told, then
// the compass, each way once and nearest first, a ruin known for what it is by its name with what it looked like and
// whose knowledge named it under it, and the way down after; each way somewhere to set out for, where it is one.
describe('a panorama', () => {
  const lines = ['From the top of the tower Weligtún lies below you.', 'To the north-west, some way off: Fearnglaed.',
    'To the north-west, not far off: a square doorway in a hillside in Beorquudu.',
    'You know it by its look: that is Paliduslac.', 'It is your wayfinding that makes it out.',
    'The way to a square doorway in a hillside in Beorquudu: to the edge of Beorquudu, and on to the old bank, where the track to it starts.',
    'To the north, not far off: the edge of Beorquudu by Weligtún.', 'To the north, far off, through the glass: the pollards.',
    'To the west, some way off: the march-stone of the Corrow.',
    'Beyond it, over the march: a mountain hanging in the sky, with nothing under it but air.',
    'The way down is the stair you came up.']
    .map(text => ({ text, kind: 'change' as const })).map(l => ({ ...l, ...LineMoments.of(l.text) }));
  it('sets the ways round the compass between the view from the top and the way down', () => {
    const { plain, rest, sights } = Moments.of(lines);
    expect(plain.map(l => l.text)).toEqual(['From the top of the tower Weligtún lies below you.']);
    expect(rest.map(l => l.text)).toEqual(['The way down is the stair you came up.']);
    expect(sights.map(s => [s.bearing, s.distance, s.place])).toEqual([
      ['north', 'not far off', 'the edge of Beorquudu by Weligtún'], ['north', 'far off, through the glass', 'the pollards'],
      ['west', 'some way off', 'the march-stone of the Corrow'], ['north-west', 'not far off', 'Paliduslac'],
      ['north-west', 'some way off', 'Fearnglaed']]);
    expect(sights[2]!.beyond).toBe('Beyond it: a mountain hanging in the sky, with nothing under it but air.');
    expect(sights[3]).toMatchObject({ seen: 'a square doorway in a hillside in Beorquudu',
      by: 'It is your wayfinding that makes it out.',
      way: 'The way: to the edge of Beorquudu, and on to the old bank, where the track to it starts.' });
  });
  // Told once, in words (the owner, 26 November, OR-1250): no row for each place seen, none to set out or to look at
  // the map; a place known for what it is said by its name and its look.
  it('tells the view once, in words, with no row for any place seen', () => {
    const { sights } = Moments.of(lines);
    const going = [{ id: 'region__w3', name: 'Paliduslac', journey: { id: 'travel:region__w3', tone: 'way' as const,
      label: 'Set out toward Paliduslac', command: 'travel:region__w3' } }];
    const html = renderToStaticMarkup(createElement(Panorama.View, { sights, going, choose: () => undefined }));
    expect(html).toContain('What can be seen from here');
    expect(html).not.toMatch(/<button|<li|data-action/);
    expect(html.match(/<p class="view">/g)).toHaveLength(1);
    expect(html).toContain('Paliduslac (a square doorway in a hillside in Beorquudu)');
  });
  it('leaves out of the margin what it says itself', () => {
    const { sights } = Moments.of(lines);
    const noted = (text: string) => ({ kind: 'learned' as const, text });
    expect(Panorama.unsaid([noted('Paliduslac: a square doorway in a hillside in Beorquudu'), noted('Fearnglaed lies west')],
      sights)).toEqual([noted('Fearnglaed lies west')]);
  });
  it('leaves an exchange with nothing seen from up high as it was', () => {
    const { plain, rest, sights } = Moments.of([{ text: 'To the inn, then.', kind: 'telling' }]);
    expect([plain.length, rest.length, sights.length]).toEqual([1, 0, 0]);
  });
});
