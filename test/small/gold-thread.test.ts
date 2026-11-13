import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The thread of the gold (the owner's player report, 12 November: led out of a place and back to it, and nothing there
// to advance the aim). A company that follows its aim and takes only the gold sees it through: never the same act at
// the same place twice over, and never past where what the aim waits on is hidden. The dead man's map in miniature
// (data/origins/map/origin.kyr): a box under the stone at Murkweard's door, a gate-passage and a wall-walk past it.
// At the door the gold had gone into the gate-passage and back out before it searched: a search was led only for a
// sign or the aim's naming, never for what the aim waits on (Promotion.allowed), and the aim's naming is withheld while
// a way on is untaken. test/gold-thread.test.ts keeps the walks through generated countries' origins (its check that
// AimAdvances counts the search had passed while the page never led with it).
const murkweard = `
  Place ferris "Ferris" is settlement.
  Place inn "the inn-yard at Ferris" is room within ferris at 0, 0 outdoors.
  Place keep "Murkweard" is site.
  Place door "the door of Murkweard" is room within keep at 0, 0 outdoors.
  Place gate "the gate-passage" is room within keep at 1, 0.
  Place walk "the wall-walk" is room within keep at 2, 0 outdoors.
  Passage road "the moor road" is path between inn and door taking 1 hour.
  Passage gateway "the gateway" is door between door and gate.
  Passage stair "the wall stair" is stair between gate and walk.
  Company party "You" of 1 at inn.
  Discovery cache_found "Under the stone at the door the earth has been dug and filled again." { Found by searching door. }
  Item cache "the dead man's box" is jeweled_box at door hidden until cache_found.
  Objective marked when not carries(party, cache) toward door "The dead man's map marks {door}, with a cross at its door. Search there.".
  Goal false.`;

// Each step the gold leads with, taken, until the aim is gone or nothing is gold; and where each was taken. Never two
// at once: one next step (the owner, 12 November).
async function thread(t: Tiny, most = 10): Promise<string[]> {
  const trail: string[] = [];
  for (let i = 0; i < most && t.gold[0]; i++) {
    const g = t.gold[0];
    trail.push(`${t.where()}: ${t.gold.map(a => a.label).join(' + ')}`);
    await t.perform(g.for ?? g.command!);
  }
  return trail;
}

describe('the gold\'s thread, in miniature', () => {
  it('goes to the door, searches there, takes the box, and is done', async () => {
    const t = (await Tiny.start(murkweard)).follow('marked');
    const trail = await thread(t);
    expect(trail).toEqual(['t__inn: To the door of Murkweard', 't__door: Search here', 't__door: the dead man\'s box']);
    expect(t.world.test({ kind: 'call', name: 'carries', args: ['party', 't__cache'] })).toBe(true);
    expect(t.gold).toEqual([]);
  });
  // Gone on in past the door, the box not yet found, the gold leads back out to it, not on up the wall-walk (round 10,
  // S at Murkweard).
  it('leads back out to where the box is hidden, from inside the place past it', async () => {
    const t = (await Tiny.start(murkweard)).follow('marked');
    t.journey.put('party', 't__walk');
    expect((await thread(t.look())).slice(0, 3)).toEqual(['t__walk: To the gate-passage',
      't__gate: To the door of Murkweard', 't__door: Search here']);
  });
});
