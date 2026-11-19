import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Itineraries } from '../../src/ui/itinerary';
import { KnownWays } from '../../src/ui/known-ways';
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
    Place drove "the drove" is wilderness within region at 2, 0.
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
    expect(t.gold.map(a => a.choice)).not.toContain('exit:t__cave');
  });
});
