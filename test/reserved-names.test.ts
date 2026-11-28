import { describe, expect, it } from 'bun:test';
import { Endings } from '../src/lang/endings';
import { Tiny } from './support/tiny';

// The names the language writes for its constructs (the architecture review's A16, from its probe lang-compiler-gaps
// G15): a module's own `concluded` was merged with an Ending's, and the Ending could never be reached. It is refused;
// a module's own `reached` (a name of the shared rules) is its own, apart from the one its Ending writes.
class Reserved {
  static start(body: string) {
    const kyr = `Module p "Reserved" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard. ${body} }`;
    return Tiny.start(kyr, { seed: 'rn', horizon: [] }).then(t => t.session);
  }
}
describe('the names the language writes', () => {
  it('refuses a module\'s own concluded, and keeps its own reached apart from its Ending\'s', async () => {
    await expect(Reserved.start('Relation concluded(). Ending won "Won" when watch(clock) >= 1 "It is done.".'))
      .rejects.toThrow('concluded');
    const s = await Reserved.start('Relation reached(group). Ending won "Won" when watch(clock) >= 1 "It is done.".');
    await s.leg('wait');
    expect(Endings.reached(s.campaign.world, [])?.title).toBe('Won');
  }, 60000);
});
