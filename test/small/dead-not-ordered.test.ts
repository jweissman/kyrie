import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { CreatureStore } from '../../src/creature-store';

// A companion dead is given no order (OR-684, cold play 2, T113–142: "Ask Ellyjobell to stay here" was offered after
// she died of a casket's trap, through to the end). The one order there is (people.kyr: hold_here) asks one who can
// hear it.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person hob "Hob" at yard { Role "a hired hand". Ancestry human. Calling warrior. Peaceable. Pronouns he. }
  Initially Assert willing(hob, party). Initially Set hire(hob) to 0.
  Goal false.`;
const ordered = (t: Tiny) => t.journey.choices().some(c => /^hold_here\(/.test(c.command ?? ''));

describe('a companion dead', () => {
  it('is asked to stay no more', async () => {
    const t = await Tiny.start(yard, { horizon: [] });
    await t.play('Ask (Hob|him) to join the company');
    expect(ordered(t)).toBe(true);
    const store = (t.campaign as unknown as { creatures: CreatureStore }).creatures;
    const hob = t.campaign.readout.creatures.find(c => c.name === 'Hob')!.id, lease = store.acquire([hob]);
    try {
      const h = lease.creatures[0]!;
      h.state.hp = 0; h.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    t.campaign.refreshProjection(); t.look();
    expect(ordered(t)).toBe(false);
  });
});
