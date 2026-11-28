import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A company holding the key to what bars a way is not offered to force it (cold play 5, CL-36's 14): "Wrench the
// padlock's hasp out of the old door" stood among the acts from the moment the key was given to the moment the
// store was done with. Without the key, the forcing is offered as before; and a change that needs nothing stays.
const store = (held: string) => `
  Place green "the green" is room at 0, 0 outdoors.
  Place store "the corn-store" is room at 1, 0 indoors.
  Passage door "the corn-store door" is door between green and store.
  Thing lock "the corn-store padlock" on door {
    State locked blocking "".
    State open "The padlock hangs open on its hasp.".
    Change wrench "Wrench the padlock's hasp out of the old door" from locked to open needing brawn.
    Change knock "Knock on the corn-store door" from locked to locked.
  }
  Initially Assert state(lock, locked). ${held}
  Company party "You" of 1 at green.
  Goal false.`;
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
const labels = (t: Tiny) => [...t.screen.things, ...t.screen.exits].flatMap(r => r.acts ?? [])
  .flatMap(a => [a, ...a.children ?? []]).map(a => a.label);
describe('a lock whose key is in hand', () => {
  it('is not offered to be forced', async () => {
    const without = await Tiny.start(store(''), { party, horizon: ['probing'] });
    expect(labels(without).some(l => /^Wrench the padlock/.test(l))).toBe(true);
    const held = await Tiny.start(store('Initially Assert keyholder(party, lock).'), { party, horizon: ['probing'] });
    expect(labels(held).some(l => /^Wrench the padlock/.test(l))).toBe(false);
    expect(labels(held).some(l => /^Knock on the corn-store door/.test(l))).toBe(true);
  });
});
