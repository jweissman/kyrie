import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A journey set upon on the way is stopped there and told so ("You were set upon on the way": Travel.attention), the
// fight fought on the leg. The witness of that stop since a road's roll became a band's fortune for the day (OR-1345,
// OR-1349): journey-receipt's walk over kite no longer meets it, its road bands stopping the journey before they set
// upon it. A vale of three stretches on a path, and a band whose fortune on the middle one is fixed to fall on whoever
// comes back through it (fortune at most a hundred, where a road's band asks at most six), met on the journey's way.
const vale = `
  Place vale "the vale" is wilderness.
  Place near "the near end" is room within vale at 0, 0 outdoors.
  Place mid "the middle of the vale" is room within vale at 1, 0 outdoors.
  Place far "the far end" is room within vale at 2, 0 outdoors.
  Place den "the cutthroats' den" is room within vale at 1, 2 outdoors.
  Passage first "the first stretch" is path between near and mid.
  Passage second "the second stretch" is path between mid and far.
  Company party "You" of 1 at far.
  Person band "two cutthroats" at den { Role "two cutthroats who wait in the vale". Ancestry human. Numbers 2. Level 1.
    Temperament savage. }
  Relation ready(group). Relation sprung(group).
  Rule watching when at(party, near) and not ready(band) { Assert ready(band). }
  Rule waylay when at(party, mid) and ready(band) and fortune(band, mid) <= 100 and not sprung(band) and able(band)
    says "Two men come up out of the bracken with knives." {
    Assert sprung(band). Retract at(band, den). Assert at(band, mid). Assert assails(band, party). }
  Goal false.`;

describe('a journey set upon on the way', () => {
  it('stops where the band falls on it, and says it was set upon', async () => {
    const t = await Tiny.start(vale, { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    // Down the vale on foot first, so that its ways are known (a journey plans over the ways known: Itineraries); the
    // band is watching once the company has come to the near end.
    await t.perform('go(t__second,t__mid)');
    await t.perform('go(t__first,t__near)');
    await t.session.leg('travel:t__far');
    expect(t.session.journeyed?.stopped).toBe('You were set upon on the way');
    expect(t.where()).toBe('t__mid');
    expect(t.campaign.history.some(e => e.combat.some(x => x.type === 'initiative'))).toBe(true);
    expect(t.world.related('t__sprung').length).toBe(1);
  }, 30000);
});
