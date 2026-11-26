import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { CreatureStore } from '../../src/creature-store';

// Knock a verb on a door (OR-1103; the owner, 26 November: "this door opens" is a verb): `Try opening on it.`, cast at
// what a lock holds, from the thing itself (data/rules/elements.kyr's loose_at), tries the kernel's verb `opening` on
// it, and the kernel's opening rule (data/rules/probing.kyr) answers the try with the lockwork change already
// written of it, as if its lock were picked. No author's edit: the chest knows only that its lock wants lockwork.
const strongroom = `
  Place keep "the keep" is settlement.
  Place cell "the strongroom" is room within keep at 0, 0.
  Company party "You" of 1 at cell.
  Thing chest "an iron-bound chest" at cell {
    State locked closed "An iron-bound chest, its hasp locked.".
    State open "The chest stands open, its hasp hanging.".
    Change pick "Pick the chest's lock" from locked to open needing lockwork.
  }
  Goal false.`;
const knock = (t: Tiny) => t.journey.choices().map(c => c.command).filter(c => /^loose_at\(.*knock/.test(c));
describe('a lock opened by art', () => {
  it('opens to Knock cast at it, by the change its lock is written with', async () => {
    const t = await Tiny.start(strongroom, { rules: ['world', 'elements'],
      party: [{ name: 'Aud', raceId: 'human', classId: 'mage', level: 3 }] as never });
    // A mage of the third level who has learned Knock.
    const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['t__party_1']);
    try {
      lease.creatures[0]!.state.learnedAbilities.push('knock');
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    // A while waited: the world's rules have read the chest (its lock suits the try) and the company what it can cast.
    await t.perform('wait');
    const cast = knock(t);
    expect(cast).toHaveLength(1);
    await t.perform(cast[0]!);
    expect(t.world.one('state', 't__chest')).toBe('t__open');
    expect(knock(t)).toEqual([]);
  });
  it('is no row where none can cast it', async () => {
    const t = await Tiny.start(strongroom, { rules: ['world', 'elements'],
      party: [{ name: 'Hild', raceId: 'human', classId: 'warrior' }] as never });
    await t.perform('wait');
    expect(knock(t)).toEqual([]);
    expect(t.world.one('state', 't__chest')).toBe('t__locked');
  });
});
