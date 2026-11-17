import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import type { CreatureStore } from '../../src/creature-store';

// Waiting mends no one, and the waits say so where they are offered (FH-14: waiting healed nothing, and nothing said
// it would not); rest is what mends (care.kyr's own Description says what).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.`;
describe('a wait', () => {
  it('says it mends no wound, and mends none', async () => {
    const t = await Tiny.start(yard, { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const waits = PlayerView.choices(t.campaign)
      .filter(r => /^wait(_hour|_watch)?$/.test(r.action.schema ?? r.action.id));
    expect(waits.length).toBe(3);
    for (const w of waits) { expect(w.action.description, w.choice.id).toMatch(/mends no wound/); }
    const store = (t.campaign as unknown as { creatures: CreatureStore }).creatures, ids = t.campaign.readout.partyIds;
    const lease = store.acquire(ids);
    try { lease.creatures[0]!.state.hp = 3; lease.commit(lease.creatures); } finally { lease.release(); }
    t.campaign.refreshProjection();
    await t.play('Wait › An hour');
    expect(t.campaign.readout.creatures.find(c => ids.includes(c.id))!.state.hp).toBe(3);
  });
});
