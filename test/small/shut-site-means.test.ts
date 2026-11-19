import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// OPR-01's open part (a1's debt after Ironkeep, mission-22/onboarding-diagnosis.md): a lone mage at a keep the aim
// names, the portcullis too heavy and the breach in the curtain wall wanting climbing or a rope, found one steel coin
// under the gate and had nothing led after it: the gold walker went out into the open fields and back, then gate to
// mouth and back for sixty acts. With every way into the site the company knows shut for what it has not got, the
// aim's step is whoever sells what would open one, where the company has been (AimMeans): out to them, and then in
// again by the way it opens. A keep's mouth on the moor, its breach a climb into the bailey; a chandler at the lane,
// walked through on the way.
const keep = `
  Place moor "the moor" is wilderness at 0, 0.
  Place lane "the lane" is room within moor at 0, 1 outdoors.
  Place mouth "before the keep's gate" is room within moor at 0, 0 outdoors.
  Place keep "the keep" is site within moor at 1, 0.
  Place bailey "the bailey" is room within keep at 1, 0 outdoors.
  Passage track "the track" is path between lane and mouth.
  Passage breach "a breach in the curtain wall" is climb between mouth and bailey needing climbing or rope.
  Person nest "Nest" at lane { Role "a chandler". Peaceable. Pronouns she. Sells rope for 2 coin from 3. }
  Initially Set quantity(party, gold) to 5.
  Objective spoil when quantity(party, gold) < 50 toward mouth "Find what could pay your debt: the keep, perhaps.".
  Place bailey_store "the store" is room within keep at 2, 0 indoors.
  Passage store_door "the store door" is door between bailey and bailey_store.
  Company party "You" of 1 at lane.
  Goal false.`;

describe('a site shut for want of something', () => {
  it('leads to whoever sells what opens it, and back in by the way it opens', async () => {
    const t = (await Tiny.start(keep)).follow('spoil');
    await t.play('To before the keep\'s gate');
    expect(t.glance.lead).toEqual({ aim: 't__spoil', source: 'means', next: ['t__nest'] });
    expect(t.gold.map(a => a.label)).toEqual(['To the lane']);
    await t.play('To the lane');
    // At the chandler's, the lead is still hers until the rope is had.
    expect(t.glance.lead?.source).toBe('means');
    // Hers is the step: talking to her, where what she sells is offered.
    expect(t.gold.map(a => a.label)).toEqual(['Talk to Nest']);
    await t.perform('buy_item(t__nest_rope_1,t__member_party_1)');
    expect(t.glance.lead).toEqual({ aim: 't__spoil', source: 'toward', next: ['t__mouth'] });
    expect(t.gold.map(a => a.label)).toEqual(['To before the keep\'s gate']);
    // At the mouth again, the breach is a way in (the keep's rooms exploration, as any site's: AimLeading.deeper).
    await t.perform('go(t__track,t__mouth)');
    expect(t.glance.lead).toEqual({ aim: 't__spoil', source: 'deeper', next: ['t__bailey'] });
  });
});
