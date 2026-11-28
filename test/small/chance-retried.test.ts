import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A chance tried again draws again (AGENTS.md: random draws are keyed by stable identity; RandomStreams.command keys a
// command's draw by its occurrence among the same acts done before): the lettered flag under Porthalen, levered "an
// even chance", had failed three times running on the reference journey and come up on the fourth, which is luck,
// not a key that never moves (a key without the attempt in it would have failed every time, and the row's odds would
// have lied). Twenty tries of one even-chance act come out both ways, and the same seed plays them the same again.
const kyr = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
  Measure heaved(group).
  Action heave(actor: group, site: place) "Heave at the stone" {
    Requires able(actor) and at(actor, site).
    Time 1. Resolve check(actor, brawn, dc_hard).
    On success { Increase heaved(actor) by 1. }
  }`;
const tries = async (seed: string): Promise<boolean[]> => {
  const t = await Tiny.start(kyr, { seed, horizon: [] }), out: boolean[] = [];
  for (let n = 0; n < 20; n++) {
    const before = t.journey.measure('heaved', 'party');
    await t.journey.step('Heave at the stone');
    out.push(t.journey.measure('heaved', 'party') > before);
  }
  return out;
};
describe('a chance tried again', () => {
  it('draws again each time, and the same seed draws the same again', async () => {
    const once = await tries('retried');
    expect(once.filter(Boolean).length).toBeGreaterThan(0);
    expect(once.filter(x => !x).length).toBeGreaterThan(0);
    expect(await tries('retried')).toEqual(once);
  });
});
