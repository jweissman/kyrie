import { describe, expect, it } from 'bun:test';
import { AimSaid } from '../../src/presentation/aim-said';

// An aim as a row's words is cut where a clause joins, never mid-word by the row (OR-45: "Follow: Your father went out
// by the road between Mistshaw and …"); an aim short enough is said whole, to its first pause.
describe('an aim as a row says it', () => {
  it('cuts at a joint, within the room', () => {
    const long = 'Your father went out by the road between Mistshaw and Millholm with the cart, and did not come home.';
    expect(AimSaid.short(long)).toBe('Your father went out by the road');
    expect(AimSaid.short(long).length).toBeLessThanOrEqual(AimSaid.room);
    expect(AimSaid.short('Clear the rats out of the corn-store cellar, under the old corn-store.'))
      .toBe('Clear the rats out of the corn-store cellar');
  });
});
