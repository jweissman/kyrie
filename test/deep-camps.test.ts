import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The earlier party's camps: the first the company finds, and the same party's further down, each told as what it
// is. Found playing cov2's mine with a thief, where the store-room on the haulage level had word for word the camp
// of the old stope above it ("Someone camped here, and not so long ago...").
describe('the earlier party\'s camps', () => {
  it('are one party\'s, found first at the top and then again further down', async () => {
    const w = await WorldAssembler.assemble('cov2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'thief' }] });
    const s = await PlaySession.start(w.path, 'cov2', w.source);
    const camp = (room: string) => s.campaign.module.observations?.find(o => o.id === `region__w8_${room}_camp`)?.text;
    expect(camp('adit_stope')).toMatch(/^Someone camped here, and not so long ago/);
    expect(camp('haulage_stores')).toMatch(/^The same party camped here too, further in/);
  }, 60000);
});
