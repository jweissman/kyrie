import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import type { CreatureStore } from '../src/creature-store';

// What a company comes back to a town for besides selling what it found (REV-04; the owner, 31 October: "the full
// adventuring loop should be exploration, achievement, and adding new verbs and capabilities"): a master-at-arms in
// every town who teaches techniques for coin and experience, and in a market town someone behind the scrivener's
// curtain, found by asking, who teaches spells to casters of their kind.
const start = async (classId: string) => {
  const j = Journey.of(await DrawnWorld.start('kite', { party: [{ name: 'Aud', raceId: 'human', classId }],
    origin: 'wanderer' }, NodeBundleSource.shared));
  // As if back from a delve with something to show for it, and paid for it.
  const store = (j.campaign as unknown as { creatures: CreatureStore }).creatures;
  const lease = store.acquire(j.campaign.state.partyIds);
  try {
    lease.creatures.forEach(c => { c.state.experience = 60; c.state.gold = 200; }); lease.commit(lease.creatures);
  } finally { lease.release(); }
  j.campaign.refreshProjection();
  return j;
};
const gold = (j: Journey) => j.measure('quantity', 'party', 'gold') ?? 0;

describe('the capability market of a town', () => {
  it('teaches a seasoned fighter a technique at the drill-yard, for coin', async () => {
    const j = await start('ranger');
    await j.play('^To the market-place of Newmeet', '^To the drill-yard');
    expect(j.taken.at(-1)!.page).toMatch(/teaches .+, \d+ coin a lesson/);
    const lesson = j.choices().find(c => /^Train › .+ — Aud$/.test(c.label))!;
    expect(lesson).toBeDefined();
    const before = gold(j);
    await j.play(lesson.label);
    expect(gold(j)).toBeLessThan(before);
    expect(j.choices().some(c => c.label === lesson.label)).toBe(false);
  }, 60000);
  it('opens the scrivener\'s curtain to whoever asks, and teaches spells only to a caster', async () => {
    const ranger = await start('ranger');
    await ranger.play('^To the market-place of Newmeet', '^To the scrivener', 'after the older books', '^To the room behind');
    expect(ranger.choices().some(c => /^Train › /.test(c.label))).toBe(false);
    const mage = await start('mage');
    await mage.play('^To the market-place of Newmeet', '^To the scrivener', 'after the older books', '^To the room behind');
    expect(mage.choices().some(c => /^Train › .+ — Aud$/.test(c.label))).toBe(true);
  }, 60000);
});
