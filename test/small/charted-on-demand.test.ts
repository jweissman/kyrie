import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { Itineraries } from '../../src/ui/itinerary';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Doable } from '../../src/presentation/doable';
import { TravelQuestion } from '../../src/presentation/travel-question';
import type { Screen } from '../../src/ui/screen-types';
import type { Campaign } from '../../src/campaign/campaign';

// Routes on demand (platform-separation.md's immediate queue, step 3): every other place the map draws, a plan to
// each (Screen.mapped), is worked out only where the map is asked for (Itineraries.charted: the page's frame, the
// terminal's travel question, serve's crossings), never for an ordinary turn's screen and leaf, which read none of it.
// Charted, the map shows what a fresh plan to each of its places lays, and the scene's rows, its gold among them, are
// the same charted or not.
const fen = `
  Place region "the Reedlands" is region.
  Place t0 "the near fen" is wilderness within region at 0, 0.
  Place t1 "the fen about Hythe" is wilderness within region at 1, 0.
  Place t2 "the far fen" is wilderness within region at 2, 0.
  Place t3 "the salt marsh" is wilderness within region at 3, 0.
  Place hythe "Hythe" is settlement within region at 1, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place barrow "Lacrimerecs" is site within region at 0, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Entity heard: fact "a long mound out in the near fen".
  Initially Assert established(heard). Initially Assert leadsTo(heard, barrow).
  Initially Assert knows(party, heard).
  Passage green_out "the town's end" is path between green and t1.
  Passage t1_t0 "the fen" is path between t1 and t0.
  Passage t1_t2 "the causeway" is path between t1 and t2.
  Passage t2_t3 "the dyke" is path between t2 and t3.
  Passage t0_mouth "the mound's foot" is path between t0 and mouth.
  Company party "You" of 1 at green.
  Goal false.`;
const chart = { width: 4, height: 1, cover: '....', rivers: [], roads: {}, parts: {},
  places: { t0: 0, t1: 1, t2: 2, t3: 3, hythe: 1, barrow: 0 } };

// The oracle: a fresh plan to every place the map's land draws that no journey of the screen goes to already.
const fresh = (c: Campaign, s: Screen) => {
  const listed = new Set([...s.destinations ?? [], ...s.roads ?? [], ...s.around ?? []].map(d => d.id));
  const ids = new Set([...s.region?.areas.map(a => a.id) ?? [], ...s.region?.land?.marks.map(m => m.id) ?? []]);
  return [...ids].filter(id => !listed.has(id)).flatMap(id => {
    const p = Itineraries.plan(c, id);
    return p?.legs.length ? [{ id, minutes: p.minutes, stops: p.legs.map(l => l.to) }] : [];
  });
};
// How often a function of Itineraries is called while a run goes.
const counted = <T>(name: 'mapped' | 'plan', run: () => T): { out: T; n: number } => {
  const o = Itineraries as unknown as Record<string, (...a: unknown[]) => unknown>, f = o[name]!;
  let n = 0;
  o[name] = function (this: unknown, ...a: unknown[]) { n++; return f.apply(this, a); };
  try { return { out: run(), n }; } finally { o[name] = f; }
};

describe('the map\'s places, planned on demand', () => {
  it('are planned for no ordinary turn, and charted are what a fresh plan to each lays', async () => {
    // The way out of town taken by the session itself, not by the page's harness, which charts its screen as the page's
    // frame is (Tiny): the turn after it is an ordinary one.
    const t = await Tiny.start(fen, { chart }), c = t.campaign;
    await t.session.leg(PlayerView.choices(c).find(r => r.choice.id.includes('green_out'))!.choice.id);
    // An ordinary turn: the screen and its leaf, the map not asked for.
    const turn = counted('mapped', () => { const s = ScreenModel.build(c); return { s, leaf: Narrator.leaf(c, s) }; });
    expect(turn.n).toBe(0);
    expect(turn.out.s.mapped).toBeUndefined();
    expect(turn.out.leaf.travel).toBeUndefined();
    // The map asked for: its places, each by the way a fresh plan lays to it, planned only now.
    const { out: charted, n: plans } = counted('plan', () => Itineraries.charted(c, turn.out.s));
    expect(plans).toBeGreaterThan(0);
    expect(charted.mapped!.length).toBeGreaterThan(0);
    expect(charted.mapped!.map(d => ({ id: d.id, minutes: d.minutes, stops: d.stops }))).toEqual(fresh(c, charted));
    expect(Itineraries.charted(c, turn.out.s)).toBe(charted);
    // The scene's rows, the gold among them, the same charted or not; the map's question asked of the charted.
    const rows = (s: Screen) => Doable.of(Narrator.leaf(c, s).glance!, s);
    expect(rows(charted)).toEqual(rows(ScreenModel.build(c)));
    const asked = TravelQuestion.on(Narrator.leaf(c, charted), charted).travel!;
    expect(asked.rows.map(r => r.place)).toEqual(expect.arrayContaining(charted.mapped!.map(d => d.id)
      .filter(id => asked.rows.some(r => r.place === id))));
  });
});
