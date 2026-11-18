import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Itineraries } from '../../src/ui/itinerary';
import { LandModel } from '../../src/ui/land-model';
import { JourneyCourse } from '../../web/reader/journey-course';

// The way a journey is laid is the one a traveller who knows what the company knows would take (the owner, 16
// November: "for country you don't know it should offer the shortest visible path regardless of obstructions; then as
// you encounter/learn about obstructions you should route around them"; OR-35). A country of seven stretches by three,
// drawn by hand: a town at the west end of the middle row, a barrow told of at its east end, six stretches off. Each
// stretch is a place joined to the six about it, half an hour each (as RegionTracts writes a generated country).
const W = 7, H = 3, town = 7, barrow = 13;
const land = (o: { lake?: number; fell?: number; road?: string; surveyed?: boolean }) => {
  const cells = [...Array(W * H).keys()].filter(c => c !== o.lake);
  const tracts = cells.map(c => `Place t${c} "open fields" is room within wild at ${c % W}, ${Math.floor(c / W)} outdoors.`);
  const ways = cells.flatMap(c => LandModel.round({ width: W, height: H }, c).filter(n => n > c && n !== o.lake)
    .map(n => `Passage tw${c}_${n} "the way across country" is overland between t${c} and t${n} taking `
      + `${[c, n].includes(o.fell ?? -1) ? 120 : 30} minutes.`));
  const kyr = `
    Place region "the Reedlands" is region.
    Place wild "the open country" is wilderness within region at 3, 1.
    ${tracts.join('\n')}
    ${ways.join('\n')}
    Place home "Hithe" is settlement within region at 0, 1.
    Place green "the green" is room within home at 0, 0 outdoors.
    Passage tl_green "the way across country" is overland between t${town} and green taking 10 minutes.
    Place barrow "Lacrimerecs" is site within region at 6, 1.
    Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
    Passage tl_mouth "the way across country" is overland between t${barrow} and mouth taking 10 minutes.
    ${o.road ? `Passage drove "the drove road" is road between green and mouth taking ${o.road}.` : ''}
    Entity barrow_told: fact "a barrow out east".
    Initially Assert established(barrow_told). Initially Assert leadsTo(barrow_told, barrow).
    Initially Assert knows(party, barrow_told).
    Relation surveyed(group, place).
    ${o.surveyed ? 'Initially Assert surveyed(party, t8).' : ''}
    Company party "You" of 1 at green.
    Goal false.`;
  const places = Object.fromEntries([...cells.map(c => [`t${c}`, c]), ['home', town], ['barrow', barrow]]);
  return Tiny.start(kyr, { chart: { width: W, height: H, cover: [...Array(W * H).keys()]
    .map(c => c === o.lake ? 'o' : c === o.fell ? 'f' : '.').join(''), rivers: [], roads: {}, parts: {}, places } });
};
// The stretches a journey to the barrow is laid over, by their cells, as the map draws it.
const laid = (t: Tiny) => JourneyCourse.planned(t.screen, 't__barrow');
const plan = (t: Tiny) => Itineraries.plan(t.campaign, 't__barrow');

describe('the way laid across the country', () => {
  it('to a place told of, over country not yet seen, is the straight way, not the long road round', async () => {
    // On main, a place only heard of had no way laid across the country to it, and went by the roads, however far
    // round (in a1, the way into the Aldwater, nine hexes off, was laid twenty-three).
    const t = await land({ road: '8 hours' });
    expect(laid(t)).toEqual([7, 8, 9, 10, 11, 12, 13]);
    expect(plan(t)!.minutes).toBe(10 + 6 * 30 + 10);
    // What is drawn is what is walked, leg by leg.
    const passages = plan(t)!.legs.map(l => l.passage);
    await t.session.leg('travel:t__barrow');
    expect(t.where()).toBe('t__mouth');
    expect(t.session.journeyed?.legs.map(l => /^go\(([^,]+),/.exec(l.command)?.[1])).toEqual(passages);
  });
  // Hard going is the land's own, seen or not, as its folk know it (see Overland): gone round where that is quicker.
  it('goes round water it has seen, and round hard going where that is the quicker', async () => {
    for (const seen of [await land({ lake: 10, surveyed: true }), await land({ fell: 10 })]) {
      const way = laid(seen)!;
      expect(way).not.toContain(10);
      expect([way[0], way.at(-1), way.length]).toEqual([7, 13, 8]);
    }
  });
  // Water found ahead, with a way round it known, is told with the leg and the journey goes round (TR-02).
  it('is laid over water it has not seen, as open country, and turns aside only when it sees it, saying so', async () => {
    const t = await land({ lake: 10 });
    expect(laid(t)).toEqual([7, 8, 9, 10, 11, 12, 13]);
    // Nothing of the lake is told before it is seen: the leg over it is to country not yet seen.
    expect(t.screen.destinations?.find(d => d.id === 't__barrow')?.legs.map(l => l.to))
      .toContain('country not yet seen');
    await t.session.leg('travel:t__barrow');
    const journey = t.session.journeyed!;
    expect([t.where(), journey.stopped]).toEqual(['t__mouth', undefined]);
    expect(journey.legs.map(l => l.passed)).toContain('Water lies across the way ahead: the way on goes round it');
    expect(journey.legs.map(l => /^go\(t__t(\d+),/.exec(l.command)?.[1])).not.toContain('10');
  });
  it('takes a known road only where it is the quicker', async () => {
    const quick = await land({ road: '2 hours' });
    expect(plan(quick)!.legs.map(l => l.way)).toEqual(['the drove road']);
    const slow = await land({ road: '4 hours' });
    expect(plan(slow)!.legs.map(l => l.way)).not.toContain('the drove road');
  });
});
