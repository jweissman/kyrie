import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { BoardField } from '../../web/reader/board-field';
import { HexLand } from '../../web/reader/hex-land';

// On the map a town stands for its rooms, which its own plan draws (hex map, town plan, interior: the owner, M19).
// A travelling circus's ground, its backyard and its ring of living-wagons, rooms of the town it pitches in, had each
// been a sign over the town's houses; a touch on Lowmouth had chosen "the ring of living-wagons", and its journey and
// "Enter Lowmouth" set the company down in Wapshott's ground (round 9's P, 91–96: R9-04). Hythe with a circus behind
// its mill, heard of, and a barrow out in the fen: the barrow is a place on the land, the circus is Hythe.
const reedlands = `
  Place shire "the Reedlands" is region.
  Place hythe "Hythe" is settlement within shire at 0, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place mill "the mill" is room within hythe at 1, 0 outdoors.
  Passage green_mill "the mill lane" is path between green and mill.
  Place wagons "the ring of living-wagons" is room within hythe at 2, 0 outdoors.
  Passage mill_wagons "the tenter-field gate" is gate between mill and wagons.
  Entity circus_heard: fact "a circus pitched behind the mill".
  Initially Assert established(circus_heard). Initially Assert leadsTo(circus_heard, wagons).
  Initially Assert knows(party, circus_heard).
  Place barrow "Lacrimerecs" is site within shire at 1, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Passage hythe_barrow "the fen road" is road between green and mouth taking 2 hours.
  Company party "You" of 1 at mouth.
  Goal false.`;

describe('a town on the map', () => {
  it('stands for its rooms: none is a sign of its own, and a journey bound for one is bound for the town', async () => {
    const t = await Tiny.start(reedlands), region = t.screen.region!;
    expect(region.land!.marks.map(m => m.id)).toContain('t__wagons');
    for (const drawn of [BoardField.land(region).marks, HexLand.draw(region).marks]) {
      const ids = drawn.map(m => m.id);
      expect(ids).toEqual(expect.arrayContaining(['t__hythe', 't__barrow']));
      expect(ids.filter(id => ['t__green', 't__mill', 't__wagons'].includes(id))).toEqual([]);
    }
    expect(BoardField.whither(region, 't__wagons')).toBe('t__hythe');
  });
});
