import { afterEach, describe, expect, it } from 'bun:test';
import { CreatureStore } from '../../src/creature-store';
import { QuietWatches } from '../../src/campaign/quiet-watches';
import { Tiny } from '../support/tiny';

// A torch held unlit through a quiet hour (OR-721): on a lit green the company's own torch does not burn down
// (FieldUse.advance), and a watch in which nothing on the clock would tick leases no one's record to run it down and
// write it back. In the dark it burns, watch by watch. What the hour leaves is the same as every watch run whole
// (QuietWatches.afresh) leaves; the journeys are held to that by test/quiet-watches.
const green = (unlit: boolean) => `
  Place green "the green" is room at 0, 0.
  Company party "You" of 1 at green.
  ${unlit ? 'Initially Assert unlit(green).' : ''}
  Goal false.`;
const hour = async (unlit: boolean, afresh: boolean) => {
  QuietWatches.afresh = afresh;
  const t = await Tiny.start(green(unlit));
  await t.perform('light_item(t__party_1__torch)');
  const store = CreatureStore.prototype as unknown as { acquire: (ids: string[]) => unknown };
  const acquire = store.acquire;
  let leased = 0;
  store.acquire = function (this: unknown, ids: string[]) { leased++; return acquire.call(this, ids); };
  try { await t.perform('wait_hour'); } finally { store.acquire = acquire; }
  const torch = t.campaign.readout.creatures.flatMap(c => c.state.conditions).map(s => `${s.id}:${s.remaining}`);
  return { leased, torch, facts: t.world.view.relations.map(f => `${f.name}(${f.args.join(',')})`).sort() };
};
describe('a torch held unlit through a quiet hour', () => {
  afterEach(() => { QuietWatches.afresh = false; });
  it('leases no record in a watch where nothing would tick, and leaves what a whole watch leaves', async () => {
    const quiet = await hour(false, false), whole = await hour(false, true);
    expect(quiet.leased).toBe(0);
    expect(whole.leased).toBeGreaterThanOrEqual(6);
    expect({ torch: quiet.torch, facts: quiet.facts }).toEqual({ torch: whole.torch, facts: whole.facts });
    const dark = await hour(true, false), darkWhole = await hour(true, true);
    expect(dark.leased).toBeGreaterThanOrEqual(6);
    expect({ torch: dark.torch, facts: dark.facts }).toEqual({ torch: darkWhole.torch, facts: darkWhole.facts });
    expect(dark.torch).not.toEqual(quiet.torch);
  });
});
