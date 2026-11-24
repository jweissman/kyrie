import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Scenery } from '../../src/ui/scenery';

// One place's paintings at other lights, seasons or weather are one family, and the page dissolves one into another
// of its family over a few seconds, never a cut and never a colour; another place's is cut to (OR-446). The family is
// the engine's (Scenery.family, Scenery.dissolves), by the painter's names: a base and its light, season or weather.
describe('a painting\'s family', () => {
  it('is its base, whatever light, season or weather it is of', () => {
    expect(['scene-country-lane', 'scene-country-lane-autumn', 'scene-country-lane-dusk', 'scene-country-lane-winter']
      .map(p => Scenery.family(p))).toEqual(Array(4).fill('scene-country-lane'));
    expect([Scenery.family('scene-harbor-rain'), Scenery.family('scene-quarry-adit')])
      .toEqual(['scene-harbor', 'scene-quarry-adit']);
    // The owner's two families of 24 November: one valley in its seasons, one camp by day and by night.
    expect(['scene-valley', 'scene-valley-spring', 'scene-valley-summer', 'scene-valley-autumn', 'scene-valley-night']
      .map(p => Scenery.family(p))).toEqual(Array(5).fill('scene-valley'));
    expect(Scenery.dissolves('scene-desert-campfire', 'scene-desert-campfire-night')).toBe(true);
  });
  it('dissolves one of a family into another, and cuts to another place\'s', () => {
    expect(Scenery.dissolves('scene-valley-summer', 'scene-valley-autumn')).toBe(true);
    expect(Scenery.dissolves('scene-harbor', 'scene-harbor-rain')).toBe(true);
    expect(Scenery.dissolves('scene-harbor', 'scene-quarry-adit')).toBe(false);
    expect([Scenery.dissolves(undefined, 'scene-harbor'), Scenery.dissolves('scene-harbor', 'scene-harbor')])
      .toEqual([false, false]);
  });
  it('is drawn as a slow fall of the going painting\'s light, a few seconds, nothing coloured', () => {
    const css = readFileSync('web/reader/frame.css', 'utf8');
    const run = /\.ambient\.ambient-was\s*\{\s*animation:\s*([\w-]+)\s+([\d.]+)s/.exec(css)!;
    const frames = new RegExp(`@keyframes ${run[1]} \\{([^}]*)\\}`).exec(css)![1]!;
    expect([Number(run[2]) >= 2, /^\s*to\s*\{\s*opacity:\s*0;\s*$/.test(frames)]).toEqual([true, true]);
  });
  // The valley below the adit's mouth, the stock opening's own room (OR-447): the season's painting of it, held to its
  // family; none where the sky denies it (the rain off the fen on Iscoed's first morning), and the place's kind then.
  it('is the valley\'s painting of the season at the adit\'s mouth, where the sky allows it', () => {
    const at = (season: string, weather = 'fair') => Scenery.authored({ place: { id: 'region__s1_adit_mouth',
      name: "the old drift's mouth above Porthalen", description: '' }, date: { long: `the 1st of Smoke; ${season}` },
      weather } as never);
    expect([at('summer'), at('autumn'), at('spring')])
      .toEqual(['scene-valley-summer', 'scene-valley-autumn', 'scene-valley-spring']);
    expect(at('autumn', 'rain')).toBeUndefined();
  });
});
