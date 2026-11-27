import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';

// BX-01's separation proof (BRIEF §5D, §11.6): a non-Westernesse scenario through the platform's public lifecycle.
// Thornfield Allotment Society's annual meeting (test/fixtures/boundary/allotment.kyr): money in pounds, not gold; a
// plot-holder of no adventuring calling, carrying only what the campaign gives; no night of Imbar's, no canon, no
// fight; conversation that moves votes, and a vote. Installed, a life made, its frame drawn and acted on by the words
// a player sees, its receipts kept, saved and taken up again to the same game; and without the petition read, the
// motion carries.
const kyr = readFileSync(join(import.meta.dir, '../fixtures/boundary/allotment.kyr'), 'utf8');
// On the shared rules' kernel alone (BX-02; its horizon names no package, OR-407): places and ways, people and talk,
// and what is known; nothing of a fight's, of care, belongings, trade or rule over places.
const start = () => Tiny.start(kyr, { own: true, currency: 'pound', night: 'none', horizon: [],
  party: [{ name: 'Robin Ashe', raceId: 'human', classId: 'commoner', outfit: 'own' }] });
const labels = (t: Tiny) => t.journey.choices().map(c => c.label);

describe('the allotment society, on the platform alone', () => {
  it('installs no canon, and makes its plot-holder of no calling, carrying nothing it was not given', async () => {
    const t = await start();
    expect(t.campaign.installed).toEqual(['t']);
    const canon = /^(imbar|dun_ri)$|^plane_(fire|water|air|earth)/;
    expect(t.campaign.module.entities.map(e => e.id).filter(id => canon.test(id))).toEqual([]);
    expect(t.campaign.readout.creatures.find(c => c.name === 'Robin Ashe')?.classId).toBe('commoner');
    expect(labels(t).filter(l => /torch|candle|pole|battleaxe|mail|attack|fight/i.test(l))).toEqual([]);
    expect(labels(t).filter(l => /dark|night/i.test(l))).toEqual([]);
    // Nothing of care, belongings or rule over places installed under its talk. The kernel still declares the two acts
    // of conflict (core's attack and assail, which the engine assumes: BX-02's remainder), never offered among people
    // at peace (the labels above).
    expect(t.campaign.module.actions.map(a => a.id).filter(id => /^(yield|take_item|eat|rest|buy|sell)/.test(id)))
      .toEqual([]);
    expect(t.campaign.module.actions.length).toBeLessThan(40);
  });
  it('is played by talk and a vote to its end, its receipts kept, saved and taken up again as it was', async () => {
    const t = await start();
    await t.play('To the plots', 'Talk to Stan Mullery', 'Ask Stan Mullery about plot 14', 'Take your leave',
      'To the society\'s hut', 'Talk to Derek Hales', 'Pay Derek Hales your subs', 'Take your leave');
    expect(t.journey.measure('quantity', 'party', 'gold')).toBe(8);
    await t.play('Talk to Joan Pryor', 'Ask Joan Pryor to read the spring petition', 'Take your leave',
      'Talk to Pauline Okonjo', 'Tell Pauline Okonjo what the plot is worth', 'Take your leave');
    expect(t.journey.measure('votes', 'party')).toBe(3);
    const s = t.journey.session, saved = JSON.stringify(s.checkpoint()), receipts = s.receipts.length;
    expect(receipts).toBeGreaterThan(10);
    expect(s.receipts.every(r => r.outcome !== 'undone')).toBe(true);
    // Taken up again from what was kept, it is the same game, and goes on to the vote.
    const again = PlaySession.resume(JSON.parse(saved));
    expect(again.canonical()).toBe(s.canonical());
    await t.play('Ask the chair to put the motion to a vote');
    expect([t.journey.holds('t__motionDefeated', 'party'), t.journey.holds('t__motionCarried', 'party')])
      .toEqual([true, false]);
  });
  it('carries the motion where no one was talked round', async () => {
    const t = await start();
    await t.play('To the plots', 'To the society\'s hut', 'Talk to Derek Hales', 'Pay Derek Hales your subs',
      'Take your leave', 'Ask the chair to put the motion to a vote');
    expect([t.journey.holds('t__motionDefeated', 'party'), t.journey.holds('t__motionCarried', 'party')])
      .toEqual([false, true]);
  });
});
