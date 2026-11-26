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

// Routes on demand (platform-separation.md's immediate queue, step 3; OR-632, OR-633): in a country drawn in hexes the
// map's journeys, every lead and road a plan to each (Screen.destinations, roads) and every other place it draws
// (Screen.mapped), are worked out only where the map is asked for (Itineraries.charted), never for an ordinary turn's
// screen and leaf. An ordinary turn lays only the aim's journey, and of one whose way leaves the hex only that it does:
// it plans no itinerary at all. Charted, the map's journeys are what a fresh plan to each lays (the oracle), and the
// scene's own rows, the gold among them, are the same charted or not; the map's rows are the charted screen's alone.
const fen = `
  Place region "the Reedlands" is region.
  Place t0 "the near fen" is wilderness within region at 0, 0.
  Place t1 "the fen about Hythe" is wilderness within region at 1, 0.
  Place t2 "the far fen" is wilderness within region at 2, 0.
  Place t3 "the salt marsh" is wilderness within region at 3, 0.
  Place hythe "Hythe" is settlement within region at 1, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place lane "Tanners' Lane" is room within hythe at 1, 0 outdoors.
  Place yard "the tanyard" is room within hythe at 2, 0 outdoors.
  Passage green_lane "the lane's end" is path between green and lane.
  Passage lane_yard "the yard gate" is path between lane and yard.
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

// The oracle for the leads and the roads: every one the company knows, freshly planned, as a screen had laid them on
// every turn.
const leads = (c: Campaign) => {
  const ds = Itineraries.destinations(c), rs = Itineraries.roads(c, ds);
  return [...ds, ...rs].map(d => ({ id: d.id, minutes: d.minutes, stops: d.legs.map(l => l.to) }));
};
const scene = (rows: ReturnType<typeof Doable.of>) => Doable.flat(rows).filter(r => !r.map);
const aimed = `${fen}
  Relation looked(entity). Objective mound when not looked(barrow) toward barrow "Look into the long mound.".`;
const out = async (world: string) => {
  const t = await Tiny.start(world, { chart, earned: true }), c = t.campaign;
  await t.session.leg(PlayerView.choices(c).find(r => r.choice.id.includes('green_out'))!.choice.id);
  return { c, t };
};

describe('the map\'s journeys, planned on demand', () => {
  it('are planned for no ordinary turn, and charted are what a fresh plan to each lays', async () => {
    // The way out of town taken by the session itself, not by the page's harness, which charts its screen as the page's
    // frame is (Tiny): the turn after it is an ordinary one.
    const { c } = await out(fen);
    // An ordinary turn: the screen and its leaf, the map not asked for. No aim followed, no itinerary is laid.
    const turn = counted('plan', () => counted('mapped', () => {
      const s = ScreenModel.build(c); return { s, leaf: Narrator.leaf(c, s) };
    }));
    expect(turn.n).toBe(0);
    expect(turn.out.n).toBe(0);
    const s = turn.out.out.s;
    expect(s.mapped).toBeUndefined();
    expect([...s.destinations ?? [], ...s.roads ?? []]).toEqual([]);
    expect(turn.out.out.leaf.travel).toBeUndefined();
    // The map is offered all the same, by a row that says no number.
    const plain = Doable.of(turn.out.out.leaf.glance!, s);
    expect(plain.find(r => r.id === 'view:map')?.label).toBe('Open the world map');
    // The map asked for: its journeys, each by the way a fresh plan lays to it, planned only now.
    const { out: charted, n: plans } = counted('plan', () => Itineraries.charted(c, s));
    expect(plans).toBeGreaterThan(0);
    expect(charted.mapped!.length).toBeGreaterThan(0);
    expect([...charted.destinations!, ...charted.roads!].map(d => ({ id: d.id, minutes: d.minutes, stops: d.stops })))
      .toEqual(leads(c));
    expect(charted.mapped!.map(d => ({ id: d.id, minutes: d.minutes, stops: d.stops }))).toEqual(fresh(c, charted));
    expect(Itineraries.charted(c, s)).toBe(charted);
    // The scene's own rows, the gold among them, the same charted or not; the map's rows the charted screen's alone.
    const rows = (x: Screen) => Doable.of(Narrator.leaf(c, x).glance!, x);
    const full = rows(charted);
    expect(scene(full)).toEqual(scene(rows(ScreenModel.build(c))));
    expect(Doable.flat(full).filter(r => r.map).map(r => r.does)).toEqual(expect.arrayContaining(['travel:t__barrow']));
    const asked = TravelQuestion.on(Narrator.leaf(c, charted), charted).travel!;
    expect(asked.rows.map(r => r.place)).toEqual(expect.arrayContaining(['t__barrow']));
  });
  it('walk about the town by its own ways, as a search across the open country walks it', async () => {
    const t = await Tiny.start(fen, { chart, earned: true }), c = t.campaign;
    // Down the lane and back to the green: the yard gate known, the tanyard a walk of two ways from the green.
    const go = (to: string) => t.session.leg(PlayerView.choices(c).find(r => r.choice.id.includes(to))!.choice.id);
    await go('green_lane'); await go('green_lane');
    const s = ScreenModel.build(c);
    // The oracle: each walk by a search that roams the open country too, as a walk about the town had been searched.
    const route = (Itineraries as unknown as { route: (c: Campaign, id: string, clear: boolean, roam: boolean) =>
      { legs: { to: string }[]; minutes: number } | undefined }).route.bind(Itineraries);
    const roaming = s.around!.map(d => { const p = route(c, d.id, true, true)!; return { id: d.id, minutes: p.minutes,
      stops: p.legs.map(l => l.to) }; });
    expect(s.around!.map(d => d.id)).toEqual(['t__yard']);
    expect(s.around!.map(d => ({ id: d.id, minutes: d.minutes, stops: d.stops }))).toEqual(roaming);
  });
  it('lay for an aim across the hex only that its way leaves it: the gold opens the map there', async () => {
    const { c, t } = await out(aimed);
    await t.session.leg('follow:t__mound');
    const { out: s, n } = counted('plan', () => ScreenModel.build(c));
    // The mound lies in the next hex: no itinerary laid, only the aim's journey known to be had, leaving the hex.
    expect(n).toBe(0);
    expect(s.destinations!.map(d => ({ id: d.id, crosses: d.crosses, legs: d.legs }))).toEqual([
      { id: 't__barrow', crosses: true, legs: [] }]);
    const glance = Narrator.leaf(c, s).glance!, led = Doable.of(glance, s).find(r => r.led && r.chart);
    expect(led).toMatchObject({ label: 'Open the map', chart: 't__barrow', does: 'view:map:t__barrow' });
    // Charted, the aim's journey is laid as a fresh plan lays it, and the scene's rows, the gold first, are as they
    // were.
    const charted = Itineraries.charted(c, s);
    expect(charted.destinations!.find(d => d.id === 't__barrow')!.stops)
      .toEqual(Itineraries.plan(c, 't__barrow')!.legs.map(l => l.to));
    const rows = (x: Screen) => Doable.of(Narrator.leaf(c, x).glance!, x);
    expect(scene(rows(charted))).toEqual(scene(rows(s)));
  });
});
