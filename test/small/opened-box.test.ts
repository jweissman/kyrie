import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A box opened tells what is in it, and what is in it can be taken (M21's playability list, PL-22): the chest on the
// hobs' ledge, picked, had said only "The chest on the ledge stands open", and the stolen chalice in it was under
// Every way. Shut, nothing of what is in it is told. A ledge, a chest, a chalice in it.
const ledge = `
  Place ledge "the high ledge" is room at 0, 0 indoors.
  Company party "You" of 1 at ledge.
  Thing chest "a chest on the ledge" at ledge {
    State shut closed "A chest stands on the ledge, shut.".
    State open "The chest on the ledge stands open.".
    Change lift "Lift the chest's lid" from shut to open.
  }
  Item chalice "a stolen chalice" is chapel_plate in chest.
  Goal false.`;
const told = (t: Tiny) => [...t.leaf.situation, ...t.leaf.presence].join(' ');

describe('a box opened', () => {
  it('tells what is in it, only once it is open', async () => {
    const t = await Tiny.start(ledge);
    expect(told(t)).not.toMatch(/chalice/);
    await t.play("Lift the chest's lid");
    expect(told(t.look())).toMatch(/In the chest on the ledge: a stolen chalice\./);
    expect(t.journey.choices().some(c => /^take_out\(t__chalice,/.test(c.command))).toBe(true);
  });
});
