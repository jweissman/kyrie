import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A calling's own act is told as an act (the blind playtest, 13 November: BP-06): a thief's lock picked had only
// "hung open on its hasp", the capability acknowledged and the act skipped. Now a sentence of how it went, from the
// voice tables (data/voice/feat.json), before what it came to; picking with care, forcing loud.
const store = `
  Place lane "the lane" is room at 0, 0 outdoors.
  Place store "the corn-store" is room at 1, 0 indoors.
  Passage door "the corn-store door" is door between lane and store.
  Thing lock "the padlock" on door {
    State locked blocking "".
    State open "The padlock hangs open on its hasp.".
    State torn "The hasp hangs out of the door by one bolt.".
    Change pick "Pick the padlock" from locked to open needing lockwork.
    Change wrench "Wrench the hasp out of the door" from locked to torn needing brawn.
  }
  Company party "You" of 1 at lane.
  Goal false.`;

describe('a calling\'s own act', () => {
  it('is told as it was done, picked by feel, before what it came to', async () => {
    const t = await Tiny.start(store, { party: [{ name: 'Haze', raceId: 'human', classId: 'thief' }] });
    await t.perform('change_thing(t__lock_pick)');
    const told = t.campaign.history.at(-1)?.voiced ?? [];
    expect(told.map(v => v.kind)).toContain('feat');
    expect(told.find(v => v.kind === 'feat')?.id).toMatch(/^feat\.lockwork\./);
    // Told on the page and in the terminal before what it came to.
    const lines = (t.leaf.exchange?.lines ?? []).map(l => l.text).join(' ');
    expect(lines).toContain(told.find(v => v.kind === 'feat')!.text);
    expect(lines).toMatch(/hangs open on its hasp/);
    expect(lines.indexOf(told.find(v => v.kind === 'feat')!.text)).toBeLessThan(lines.indexOf('hangs open'));
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
  it('is loud when it is forced', async () => {
    const t = await Tiny.start(store, { party: [{ name: 'Brann', raceId: 'human', classId: 'warrior' }] });
    await t.perform('change_thing(t__lock_wrench)');
    expect((t.campaign.history.at(-1)?.voiced ?? []).find(v => v.kind === 'feat')?.id).toMatch(/^feat\.brawn\./);
  });
  it('is told as the companion\'s who did it, by name, not as the one who plays (GR-19)', async () => {
    const t = await Tiny.start(store.replace('of 1', 'of 2'), { party: [{ name: 'Brann', raceId: 'human', classId: 'warrior' },
      { name: 'Haze', raceId: 'human', classId: 'thief' }] });
    await t.perform('change_thing(t__lock_pick)');
    const feat = (t.campaign.history.at(-1)?.voiced ?? []).find(v => v.kind === 'feat');
    expect(feat?.id).toMatch(/^feat\.lockwork\.companion\./);
    expect(feat?.text).toMatch(/^(Haze|It is an old, stiff lock\. Haze) /);
    expect(feat?.text).not.toMatch(/\b[Yy]ou (work|take)\b/);
  });
  it('is never told as the act of someone outside the company who brings the skill (cold play 1 and 3, 25 November)', async () => {
    // "Samwise sets their shoulder to it and heaves", Samwise in no company of the player's: a hand waiting to be hired
    // brings brawn, and whoever brought it anywhere in the world was taken for the one who did it. Here the company has
    // the strength for a while (granted), and nobody in it brings it: the one who plays did it.
    const t = await Tiny.start(`
      Person sam "Samwise" at lane { Role "a hired hand". Ancestry human. Calling warrior. Peaceable. Pronouns he. }
      ${store.replace('Goal false.', 'Initially Assert granted(party, brawn). Goal false.')}`,
    { party: [{ name: 'Iselde', raceId: 'elf', classId: 'mage' }] });
    await t.perform('change_thing(t__lock_wrench)');
    const feat = (t.campaign.history.at(-1)?.voiced ?? []).find(v => v.kind === 'feat');
    expect(feat?.id).toMatch(/^feat\.brawn\.\d/);
    expect(feat?.text).not.toMatch(/Samwise/);
  });
});
