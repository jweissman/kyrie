import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Whoever needs care is hurt, or under something that does them harm; a torch's light is no wound. Lighting a torch in
// the corn-store cellar, Odo had "bound the hurt fast and badly" of a company at full strength (round 12, A, T40; M21's
// playability list, PL-09): needsCare had held of any condition at all, and "Torchlit" is one.
const cellar = `
  Place cellar "a cellar" is room at 0, 0 indoors.
  Company party "You" of 1 at cellar.
  Event binds near party when memberOf(?m, party) and needsCare(?m) "Someone binds the hurt, fast and badly.".
  Goal false.`;
describe('who needs care', () => {
  it('is not whoever has lit a torch', async () => {
    const t = await Tiny.start(cellar);
    await t.perform('light_item(t__party_1__torch)');
    expect(t.screen.party[0]!.boons?.some(b => /Torchlit/.test(b))).toBe(true);
    expect(t.world.related('needsCare')).toEqual([]);
    expect(t.leaf.changed.join(' ') + (t.leaf.exchange?.lines.map(l => l.text).join(' ') ?? '')).not.toMatch(/binds the hurt/);
  });
});
