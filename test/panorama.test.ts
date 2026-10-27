import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Moments } from '../web/reader/stage/moments';
import { Panorama } from '../web/reader/stage/panorama';

// What can be seen from somewhere high, on the page (Mission 17's vantage points): the view from the top as told, then
// the compass, each way once and nearest first, a ruin known for what it is by its name with what it looked like and
// whose knowledge named it under it, and the way down after; each way somewhere to set out for, where it is one.
describe('a panorama', () => {
  const lines = ['From the top of the tower Weligtún lies below you.', 'To the north-west, some way off: Fearnglaed.',
    'To the north-west, not far off: a square doorway in a hillside in Beorquudu.',
    'You know it by its look: that is Paliduslac.', 'It is your wayfinding that makes it out.',
    'The way to a square doorway in a hillside in Beorquudu: to the edge of Beorquudu, and on to the old bank, where the track to it starts.',
    'To the north, not far off: the edge of Beorquudu by Weligtún.', 'The way down is the stair you came up.']
    .map(text => ({ text, kind: 'change' as const }));
  it('sets the ways round the compass between the view from the top and the way down', () => {
    const { plain, rest, sights } = Moments.of(lines);
    expect(plain.map(l => l.text)).toEqual(['From the top of the tower Weligtún lies below you.']);
    expect(rest.map(l => l.text)).toEqual(['The way down is the stair you came up.']);
    expect(sights.map(s => [s.bearing, s.distance, s.place])).toEqual([
      ['north', 'not far off', 'the edge of Beorquudu by Weligtún'], ['north-west', 'not far off', 'Paliduslac'],
      ['north-west', 'some way off', 'Fearnglaed']]);
    expect(sights[1]).toMatchObject({ seen: 'a square doorway in a hillside in Beorquudu',
      by: 'It is your wayfinding that makes it out.',
      way: 'The way: to the edge of Beorquudu, and on to the old bank, where the track to it starts.' });
  });
  it('offers to set out for each way that is somewhere to set out for', () => {
    const { sights } = Moments.of(lines);
    const going = [{ id: 'region__w3', name: 'Paliduslac', journey: { id: 'travel:region__w3', tone: 'way' as const,
      label: 'Set out toward Paliduslac', command: 'travel:region__w3' } }];
    const html = renderToStaticMarkup(createElement(Panorama.View, { sights, going, choose: () => undefined }));
    expect(html).toContain('What can be seen from here');
    expect(html.match(/data-action="set-out"/g)).toHaveLength(1);
    expect(html).toContain('data-id="region__w3" title="Set out toward Paliduslac"');
    expect(html).toContain('A square doorway in a hillside in Beorquudu. It is your wayfinding that makes it out.');
  });
  it('leaves out of the margin what it says itself', () => {
    const { sights } = Moments.of(lines);
    expect(Panorama.unsaid(['Noted: Paliduslac: a square doorway in a hillside in Beorquudu', 'Noted: Fearnglaed lies west'],
      sights)).toEqual(['Noted: Fearnglaed lies west']);
  });
  it('leaves an exchange with nothing seen from up high as it was', () => {
    const { plain, rest, sights } = Moments.of([{ text: 'To the inn, then.', kind: 'telling' }]);
    expect([plain.length, rest.length, sights.length]).toEqual([1, 0, 0]);
  });
});
