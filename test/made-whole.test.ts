import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Lull's F1 (LUL-01): no effect restored a creature, so its law that hired harm heals at sunset could not be
// written. `Restore x.` makes whoever it names whole again, risen if they had died (test/fixtures/probes/made-whole).
describe('made whole', () => {
  it('heals at sunset what the bramble did', async () => {
    const j = await Journey.start('test/fixtures/probes/made-whole/probe.campaign.json', 'w');
    const body = () => j.campaign.readout.creatures.find(c => j.campaign.readout.partyIds.includes(c.id))!;
    await j.play('Push through the bramble');
    expect(body().state.hp).toBeLessThan(body().base.maxHp);
    expect(j.holds('torn', 'party')).toBe(true);
    const told = await j.play('=18:10');
    expect(told).toMatch(/what the bramble did is undone/);
    expect(body().state.hp).toBe(body().base.maxHp);
    expect(body().state.conditions).toEqual([]);
    expect(j.holds('madeWhole', 'party')).toBe(false);
  }, 30000);
});
