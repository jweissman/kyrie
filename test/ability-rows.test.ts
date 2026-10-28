import { describe, expect, it } from 'bun:test';
import { AbilityRows } from '../src/ui/ability-rows';

// A technique says what it needs in hand: "Set Spear" was listed for a ranger with a bow, and said nothing of a spear
// (the cold evaluation, M17-73).
describe('a technique in the company\'s book', () => {
  it('says what it needs in hand, and nothing where it needs nothing', () => {
    const [spear, mark] = AbilityRows.of({ abilities: ['set_spear', 'hunters_mark'], level: 1 });
    expect(spear!.text).toMatch(/Only with a spear, or another weapon that sets against a charge, in hand\.$/);
    expect(mark!.text).not.toMatch(/Only with/);
  });
});
