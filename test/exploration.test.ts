import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Moments } from '../web/reader/stage/moments';
import { Panorama } from '../web/reader/stage/panorama';
import { MenuModel } from '../web/reader/menu-model';

// Leaving a town simply to explore (the owner's correction of Mission 18: exploration as one of the game's central
// pleasures). b2's Ramavor stands in woods under the fells: out into the country about it, up onto the fells by the
// way each stretch lies, looking out from there and seeing what stands up from the land a long way off, and going to
// it across the country between, by what is now known; and what was learned is kept.
describe('exploring the open country', () => {
  it('leaves a town with no destination, looks out from the fells, sees a tower, and crosses the country to it', async () => {
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
    const after = j.screen().region!.land!, tower = after.marks.find(m => /tower/.test(m.name));
    // The country as far as the eye goes from the fells, three hexes every way, is known (counted by the hexes in
    // sight, not by how many more are known: the land under every place named and every road to it had come with
    // what was seen, and had made the count, until OWN-23).
    const W = after.width, x = after.here! % W, y = Math.floor(after.here! / W);
    const sight = Array.from({ length: W * after.height }, (_, c) => c)
      .filter(c => Math.abs(c % W - x) <= 3 && Math.abs(Math.floor(c / W) - y) <= 3);
    expect(after.known).toEqual(expect.arrayContaining(sight));
    expect(after.known.length).toBeGreaterThan(before.known.length);
    // Seen from afar: by its look, on its own hex, a long way off past the land known, not yet been to (OWN-24).
    expect([tower?.visited, tower?.state, after.known.includes(tower!.cell), before.known.includes(tower!.cell)])
      .toEqual([false, 'seen', true, false]);
    // Each town seen is somewhere to set out for once, by its own name, and the view sets out for it (seen from the
    // fells, Ramavor was offered as "the bailey of Ramavor" and as "Ramavor", and the panorama's row for a town had no
    // Set out: the navigation review).
    const s = j.screen(), going = [...s.destinations ?? [], ...s.roads ?? []];
    expect([going.filter(d => /_green$/.test(d.id)), new Set(going.map(d => d.name)).size]).toEqual([[], going.length]);
    const seen = (j.taken.at(-1)!.event.perceptions ?? []).map(p => ({ text: p.text, kind: 'change' as const }));
    const { sights } = Moments.of(seen);
    const towns = sights.filter(x => s.region!.areas.some(a => a.kind === 'settlement' && a.name === x.place));
    const html = renderToStaticMarkup(createElement(Panorama.View, { sights: towns, choose: () => undefined,
      going: going.map(d => ({ id: d.id, name: d.name, journey: MenuModel.journey(d) })) }));
    expect([towns.length > 0, html.match(/data-action="set-out"/g)?.length]).toEqual([true, towns.length]);
    // Set out toward it, across the country seen: it is reached, and the country stays known.
    expect(Itineraries.plan(j.campaign, tower!.id)).toBeDefined();
    const done = await Travel.go({ campaign: j.campaign, perform: (c: string) => j.session.perform(c) }, tower!.id);
    expect(done.arrived).toBe(true);
    const land = j.screen().region!.land!;
    expect(land.known).toEqual(expect.arrayContaining(after.known));
    expect(land.marks.find(m => m.id === tower!.id)).toMatchObject({ visited: true, state: 'visited' });
  }, 300000);
});
