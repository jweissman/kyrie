import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { LandCrossing } from '../../src/ui/land-crossing';
import { Serve } from '../../src/cli/serve';
import { MapView } from '../../web/reader/map-view';

// What the map may set out for across the country is the engine's to say (LandCrossing; M21's playability list,
// PL-18), and every client offers the same: the page's map, `serve`'s view, the terminal's list (see Terminal). A
// place in the company's own hex never (E155: the circus ground behind Hythe had been walked to across the fen about
// the town); a place in a known stretch beside it, across that stretch. test/small/own-hex holds the page's side.
const fen = `
  Place region "the Reedlands" is region.
  Place t0 "the near fen" is wilderness within region at 0, 0.
  Place t1 "the fen about Hythe" is wilderness within region at 1, 0.
  Place t2 "the far fen" is wilderness within region at 2, 0.
  Place hythe "Hythe" is settlement within region at 1, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place circus "the circus ground" is room within hythe at 2, 0 outdoors.
  Place barrow "Lacrimerecs" is site within region at 0, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Entity heard: fact "a circus behind the mill, and a long mound out in the near fen".
  Initially Assert established(heard). Initially Assert leadsTo(heard, circus). Initially Assert leadsTo(heard, barrow).
  Initially Assert knows(party, heard).
  Passage green_out "the town's end" is path between green and t1.
  Passage t1_t0 "the fen" is path between t1 and t0.
  Company party "You" of 1 at green.
  Goal false.`;
const chart = { width: 3, height: 1, cover: '...', rivers: [], roads: {}, parts: {},
  places: { t0: 0, t1: 1, t2: 2, hythe: 1, barrow: 0 } };

describe('the map\'s way across the country', () => {
  it('is the engine\'s, never to a place in the company\'s own hex, and the same for every client', async () => {
    const t = await Tiny.start(fen, { chart });
    const offers = LandCrossing.offers(t.screen);
    expect(offers.map(o => o.id)).toEqual(['t__barrow']);
    expect(MapView.way(t.screen, 't__circus').go).toBeUndefined();
    for (const o of offers) { expect(MapView.way(t.screen, o.id).go?.command).toBe(o.command); }
    const serve = new Serve();
    await serve.handle({ op: 'resume', checkpoint: t.session.checkpoint() });
    expect((serve.view() as { across: unknown }).across).toEqual(offers);
  });
});
