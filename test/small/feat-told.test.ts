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
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
  it('is loud when it is forced', async () => {
    const t = await Tiny.start(store, { party: [{ name: 'Brann', raceId: 'human', classId: 'warrior' }] });
    await t.perform('change_thing(t__lock_wrench)');
    expect((t.campaign.history.at(-1)?.voiced ?? []).find(v => v.kind === 'feat')?.id).toMatch(/^feat\.brawn\./);
  });
});
