import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import type { CreatureStore } from '../src/creature-store';

// What someone says is said only while they can speak (the audit's F6: a dead priest, in an action spoken by him,
// heard the company out and agreed). A topic always knew; an action marked Speaker now knows as a topic does.
describe('an action someone speaks', () => {
  const probe = 'test/fixtures/probes/speaker/probe.campaign.json';
  const blessing = (j: Journey) => j.offers('Ask Brother Anselm for a blessing');
  it('is offered while they are able and here, and not once they are dead', async () => {
    const j = await Journey.start(probe, 'speaker');
    expect(blessing(j)).toBe(true);
    expect(await j.play('Ask Brother Anselm for a blessing')).toContain('Brother Anselm blesses you');
    const lease = (j.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['p__priest_person']);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await j.play('@wait');
    expect(blessing(j)).toBe(false);
  }, 60000);
  it('is not offered once they have gone elsewhere', async () => {
    const j = await Journey.start(probe, 'speaker');
    await j.play('=2');
    expect(j.at('p__priest')).toBe('p__vestry');
    expect(blessing(j)).toBe(false);
  }, 60000);
});
