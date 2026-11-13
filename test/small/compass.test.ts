import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Inside an enclosed place the frame says so, nothing overland is offered, and the compass gives the way out, the next
// known place worth going, and whether nothing known is left (the owner, 14 November: CN-02, CN-03). Inside a building
// the world map had opened, with a confusing Back and no way to the other places about. A keep in the hills: its door
// outside, the gate-passage, the hall with a thing to look into, the cellar under it; and a town two stretches off by
// the road, known of, which is somewhere to set out for from outside.
const keep = `
  Place keep "the keep" is site.
  Place door "the keep's door" is room at 0, 0 outdoors.
  Place gate "the gate-passage" is room within keep at 0, 1 indoors.
  Place hall "the hall" is room within keep at 0, 2 indoors.
  Place cellar "the cellar" is room within keep at 0, 3 underground 1 down.
  Place road "the road" is room at 1, 0 outdoors.
  Place town "Hythe" is settlement.
  Place lane "the lane at Hythe" is room within town at 2, 0 outdoors.
  Passage gateway "the gate" is path between door and gate.
  Passage arch "the inner arch" is path between gate and hall.
  Passage stair "the cellar stair" is path between hall and cellar.
  Passage track "the track" is path between door and road.
  Passage lane_end "the road's end" is path between road and lane.
  Company party "You" of 1 at gate.
  Entity told: fact "Hythe is two stretches off by the road.".
  Initially Assert established(told). Initially Assert knows(party, told). Initially Assert leadsTo(told, lane).
  Thing chest "a chest in the hall" at hall { State shut "A chest stands against the wall.". State open "The chest is open.".
    Change open "Lift the chest's lid" from shut to open. }
  Goal false.`;

describe('the compass inside', () => {
  it('says the place is enclosed and offers nothing overland from it, as it does outside', async () => {
    const t = await Tiny.start(keep);
    expect(t.glance.enclosed).toBe(true);
    await t.play('the keep\'s door', 'the road', 'the keep\'s door');
    expect(t.glance.enclosed).toBeUndefined();
    expect((t.screen.destinations ?? []).map(d => d.id)).toContain('t__lane');
    await t.play('Into the keep');
    expect(t.glance.enclosed).toBe(true);
    expect([t.screen.destinations ?? [], t.screen.roads ?? [], t.screen.mapped ?? []].flat()).toEqual([]);
    expect(t.glance.acts.filter(a => a.command?.startsWith('travel:'))).toEqual([]);
  });
  it('gives the way out by the known ways, and follows it by walking them, time passing', async () => {
    const t = await Tiny.start(keep);
    const out = t.glance.compass!.out!;
    expect([out.to, out.ways, out.command]).toEqual(['t__door', ['the gate'], 'travel:t__door']);
    await t.play('the hall');
    const back = t.glance.compass!.out!;
    expect([back.to, back.ways.length]).toEqual(['t__door', 2]);
    const before = t.campaign.readout.elapsed;
    await t.perform(back.command!);
    expect(t.where()).toBe('t__door');
    expect(t.campaign.readout.elapsed).toBeGreaterThan(before);
  });
  it('names the next place worth going inside, until nothing known is left, never calling the unexplored empty', async () => {
    const t = await Tiny.start(keep);
    expect([t.glance.compass!.next?.to, t.glance.compass!.exhausted]).toEqual(['t__hall', false]);
    await t.play('the hall');
    await t.play('Lift the chest\'s lid');
    await t.play('the cellar');
    expect(t.glance.compass!.exhausted).toBe(true);
    expect(t.glance.compass!.out!.to).toBe('t__door');
  });
});
