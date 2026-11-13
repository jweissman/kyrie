import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// What is learned by seeing is not learned in the dark, nor does an aim arise from it: a new aim had described a
// flag in pitch dark (R10-11, round 10, S 62; it came by another way than this, and is open). In an unlit hall a flag
// that teaches, unseen; with a torch lit, seen, and the aim it gives.
const hall = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place hall "the dark hall" is room at 1, 0 indoors.
  Passage door "the hall door" is door between yard and hall.
  Initially Assert unlit(hall).
  Company party "You" of 1 at yard.
  Entity flag_seen: fact "a red flag hangs from the beam". Initially Assert established(flag_seen).
  Observe flag at hall when true "A red flag hangs from the beam, the hawk of the Durrants on it." teaches flag_seen.
  Objective durrants when knows(party, flag_seen) "Find out why the Durrants' flag hangs in {hall}.".
  Goal false.`;

describe('what is seen, in the dark', () => {
  it('is not learned until there is light, nor its aim held', async () => {
    const t = await Tiny.start(hall);
    const knows = () => t.world.test(ModuleWriter.call('knows', 'party', 't__flag_seen'));
    await t.perform('go(t__door,t__hall)');
    expect([t.screen.dark, knows(), (t.screen.aims ?? []).length]).toEqual([true, false, 0]);
    await t.perform('light_item(t__party_1__torch)');
    expect(knows()).toBe(true);
    expect((t.screen.aims ?? []).map(a => a.text)).toEqual([expect.stringMatching(/Durrants/)]);
  });
});
