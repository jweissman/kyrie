import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Itineraries } from '../../src/ui/itinerary';
import { KnownWays } from '../../src/ui/known-ways';
import { AimLeading } from '../../src/presentation/aim-lead';
import { AimRoute } from '../../src/presentation/aim-route';
import { JourneyCourse } from '../../web/reader/journey-course';

// One way-finder (AR-21): the gold's step, the itinerary's legs and the way the map draws are one way, laid over the
// ways the company knows by the minutes they take, a road taken only where it is the quicker. A row of six stretches
// of open country, half an hour each: Hithe's green off the west end, a barrow's door off the east, and a drove road
// out of Hithe along the first five, a place of its own at the third (as RegionRoads writes one, its stretches each
// a way onto it, as RegionTracts does), `road` minutes from the green and `off` off at the fifth (a road's time is
// counted to the nearest ten). A cave
// beside the green, never been into, has a short way through to the barrow.
const W = 6;
const land = (road: number, off = road) => {
  const tracts = [...Array(W).keys()].map(c => `Place t${c} "open fields" is room within wild at ${c}, 0 outdoors.`);
  const ways = [...Array(W - 1).keys()].map(c => `Passage tw${c}_${c + 1} "the way across country" is overland `
    + `between t${c} and t${c + 1} taking 30 minutes.`);
  const kyr = `
    Place region "the Reedlands" is region.
    Place wild "the open country" is wilderness within region at 2, 0.
    ${tracts.join('\n')}
    ${ways.join('\n')}
    Place hithe "Hithe" is settlement within region at 0, 0.
    Place green "the green" is room within hithe at 0, 0 outdoors.
    Passage tl_green "the way across country" is overland between t0 and green taking 10 minutes.
    Place barrow "Lacrimerecs" is site within region at 5, 0.
    Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
    Passage tl_mouth "the way across country" is overland between t5 and mouth taking 10 minutes.
    Place drove "the drove" is wilderness within region at 0, 0.
    Place drove_way "the drove road" is room within drove at 1, 1.
    Passage road_hithe "the drove road" is road between green and drove_way taking ${road} minutes.
    Passage tr1_way "the road, west" is overland between t1 and drove_way taking ${Math.round(road / 2)} minutes.
    Passage tr4_way "the road, east" is overland between t4 and drove_way taking ${off} minutes.
    Place cave "a cave" is room within hithe at 1, 0 underground.
    Passage cave_mouth "a cleft" is door between green and cave taking 1 minute.
    Passage cave_through "a long crawl" is passage between cave and mouth taking 5 minutes.
    Entity barrow_told: fact "a barrow out east".
    Initially Assert established(barrow_told). Initially Assert leadsTo(barrow_told, barrow).
    Initially Assert knows(party, barrow_told).
    Objective barrow when not at(party, mouth) toward mouth "Go to the barrow's door.".
    Company party "You" of 1 at green.
    Goal false.`;
  const places = Object.fromEntries([...[...Array(W).keys()].map(c => [`t${c}`, c]), ['hithe', 0], ['barrow', 5]]);
  return Tiny.start(kyr, { chart: { width: W, height: 1, cover: '.'.repeat(W), rivers: [], parts: {}, places,
    roads: { drove_way: [0, 1, 2, 3, 4] } } });
};
const plan = (t: Tiny) => Itineraries.plan(t.campaign, 't__barrow')!;
const stops = (t: Tiny) => plan(t).legs.map(l => l.to);

describe('one way-finder', () => {
  it('lays the gold\'s way, the journey\'s legs and the map\'s way over the same places', async () => {
    const t = (await land(20)).follow('barrow');
    // The road is the quicker (40 minutes for five stretches' 160), and is taken.
    expect(stops(t)).toEqual(['t__drove_way', 't__t4', 't__t5', 't__mouth']);
    // The gold is the journey there, whose legs are the plan's.
    expect(t.gold.map(a => a.choice)).toEqual(['travel:t__barrow']);
    expect(t.screen.destinations?.find(d => d.id === 't__barrow')?.stops).toEqual(stops(t));
    // The map draws it over those stops, along the road where it goes by the road.
    expect(JourneyCourse.planned(t.screen, 't__barrow')).toEqual([0, 1, 2, 3, 4, 5]);
    // And it is walked leg by leg as laid.
    const passages = plan(t).legs.map(l => l.passage);
    await t.session.leg('travel:t__barrow');
    expect(t.session.journeyed?.legs.map(l => /^go\(([^,]+),/.exec(l.command)?.[1])).toEqual(passages);
  });
  it('out on the open country, the gold\'s step is the journey\'s first leg', async () => {
    const t = (await land(20)).follow('barrow');
    await t.perform('go(t__tl_green,t__t0)');
    const first = plan(t).legs[0]!;
    expect(t.gold.some(a => a.choice === 'travel:t__barrow' || a.choice === `exit:${first.to}`)).toBe(true);
    expect(KnownWays.first(t.campaign, 't__t0', id => id === 't__mouth', { clear: true, roam: true })).toBe(first.to);
    // From the second stretch, onto the road where it crosses it, and along it: drawn from there, not from where the
    // map draws the road's own country (its west end), back over the stretch just crossed.
    await t.perform('go(t__tw0_1,t__t1)');
    expect(plan(t).legs.map(l => l.to)).toEqual(['t__drove_way', 't__t4', 't__t5', 't__mouth']);
    expect(JourneyCourse.planned(t.screen, 't__barrow')).toEqual([1, 2, 3, 4, 5]);
  });
  it('goes onto a road only where it shortens the way', async () => {
    // As long as the five stretches it passes (70 and 60 against 160 and the step out onto the first), the road is not
    // gone onto and off again: of two ways as quick, the one by no road, though it has fewer legs (the owner, 19
    // November: routes "double back to touch a road then leave it", not a real speedup).
    const even = await land(70, 60);
    expect(stops(even)).not.toContain('t__drove_way');
    expect(plan(even).minutes).toBe(10 + 5 * 30 + 10);
    const slower = await land(70, 70);
    expect(stops(slower)).not.toContain('t__drove_way');
  });
  it('never goes by a place the company has not been to nor been told of', async () => {
    // The cave's crawl is the shortest way of all (six minutes), but nothing of it is known from the green.
    const t = (await land(20)).follow('barrow');
    expect(stops(t)).not.toContain('t__cave');
    // Nor does an aim's lead reckon by it (AimLeading.way had gone by every way the world joins).
    expect(AimLeading.way(t.campaign, 't__green', 't__mouth')).not.toContain('t__cave');
    expect(t.gold.map(a => a.choice)).not.toContain('exit:t__cave');
  });
});

// From an enclosed place the way out toward someone an aim names goes to where they are only where the company has
// been: the miller stands at a mill told of and never come to, and the taproom's door is not his way (AimRoute's
// outward had read where he truly was: the opportunity architecture's knowledge boundary).
const town = (miller: 'mill' | 'yard') => Tiny.start(`
  Place town "Hithe" is settlement.
  Place taproom "the taproom" is room within town at 0, 0 indoors.
  Place yard "the yard" is room within town at 0, 1 outdoors.
  Place lane "the lane" is room within town at 1, 1 outdoors.
  Place mill "the mill" is room within town at 2, 1 outdoors.
  Passage door "the door" is door between taproom and yard.
  Passage gate "the gate" is gate between yard and lane.
  Passage track "the track" is path between lane and mill.
  Entity mill_told: fact "a mill down the lane".
  Initially Assert established(mill_told). Initially Assert leadsTo(mill_told, mill).
  Initially Assert knows(party, mill_told).
  Person miller "Odo the miller" at ${miller} { Role "the miller". }
  Objective flour when true toward miller "Ask Odo for flour.".
  Company party "You" of 1 at taproom.
  Goal false.`);
describe('the way out toward someone', () => {
  it('goes where the company has been, never to where they truly stand unknown to it', async () => {
    const unknown = (await town('mill')).follow('flour');
    // The yard walked and the mill told of, a way to it is known (by the yard, the gate and the lane's track).
    await unknown.perform('go(t__door,t__yard)');
    await unknown.perform('go(t__door,t__taproom)');
    expect(AimRoute.routed(unknown.campaign, unknown.screen, new Set(['t__miller']))).toEqual(new Set(['t__miller']));
    const known = (await town('yard')).follow('flour');
    await known.perform('go(t__door,t__yard)');
    await known.perform('go(t__door,t__taproom)');
    // Seen in the yard, he is gone to there: the door out is the aim's.
    expect(AimRoute.routed(known.campaign, known.screen, new Set(['t__miller'])))
      .toEqual(new Set(['t__miller', 't__yard']));
  });
});
