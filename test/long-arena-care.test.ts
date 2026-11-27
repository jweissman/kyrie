import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the keeper of the ring', () => {
  it('takes payment and treats an actual wound', async () => {
    const j = await Journey.start(campaign, 'long-road');
    Placed.at(j, 'tallow__lc_ring');
    const host = j.campaign as unknown as TickHost;
    const member = host.tickState.definition.actors.find(a => a.id === j.campaign.playerActor)!.members[0]!;
    const lease = host.tickState.creatures.acquire([member]);
    try {
      lease.creatures[0]!.state.hp = 1;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    j.campaign.refreshProjection();
    const before = j.measure('quantity', 'party', 'gold');
    await j.play('Ask for clean bandages');
    expect(host.tickState.creatures.get(member)!.state.hp).toBeGreaterThan(1);
    expect(j.measure('quantity', 'party', 'gold')).toBe(before - 2);
  }, 10000);
});
