import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Moments } from '../web/reader/stage/moments';
import { Panorama } from '../web/reader/stage/panorama';
import { LineMoments } from '../src/presentation/line-moments';
import { LandModel } from '../src/ui/land-model';

// Leaving a town simply to explore (the owner's correction of Mission 18: exploration as one of the game's central
// pleasures). b2's Ramavor stands in woods under the fells: out into the country about it, up onto the fells by the
// way each stretch lies, looking out from there and seeing what stands up from the land a long way off, and going to
// it across the country between, by what is now known; and what was learned is kept.
describe('exploring the open country', () => {
  // Looked out over from the fells, the country shows its own neighbourhood (the owner, 26 November, OR-1253): the land
  // a hex or two about where the company stands is known, no further, and what is seen there is told once, in words,
  // with no row to set out for it; crossing to it is the map's, hidden while compactification holds.
  it('leaves a town with no destination, looks out from the fells, and comes to know its own neighbourhood', async () => {
    const j = Journey.of(await DrawnWorld.start('b2', { party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }],
      origin: 'wanderer' }, NodeBundleSource.shared));
    await j.step('^To the ');
    await j.step('country about');
    expect(j.choices().filter(c => /^(North|South|East|West)[a-z-]*: /.test(c.label)).length).toBeGreaterThan(2);
    for (let k = 0; k < 4 && !/fell|heath|heights/.test(j.screen().place.name); k++) {
      await j.step('^(North|South|East|West)[a-z-]*: .*(heath|fell|heights)');
    }
    const before = j.screen().region!.land!;
    await j.step('^Look out over the country from here');
    const after = j.screen().region!.land!, W = after.width, x = after.here! % W, y = Math.floor(after.here! / W);
    const within = (c: number, r: number) => Math.abs(c % W - x) <= r && Math.abs(Math.floor(c / W) - y) <= r;
    // The hexes about it known, and none past two of them that was not known before.
    expect(after.known.length).toBeGreaterThan(before.known.length);
    expect(after.known.filter(c => !before.known.includes(c) && !within(c, LandModel.lookout))).toEqual([]);
    // What is seen, told once in words: no row for any of it, none to set out for it.
    const seen = LineMoments.typed((j.taken.at(-1)!.event.perceptions ?? []).map(p => ({ text: p.text,
      kind: 'change' as const })));
    const { sights } = Moments.of(seen);
    const html = renderToStaticMarkup(createElement(Panorama.View, { sights }));
    expect(html).not.toMatch(/<button|data-action/);
    expect(sights.every(s => s.distance !== 'far off, through the glass')).toBe(true);
  }, 300000);
});
