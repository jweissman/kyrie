import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Travel } from '../src/session/travel';

// A word from whoever goes with the company does not stop a journey: play 11's stopped at a shieling for "'Summer
// huts,' says Taklinn", and said why as "Summer huts,’ says Taklinn". Here a drover with the company remarks on a fold
// the way goes by.
describe('a journey past something a companion remarks on', () => {
  it('goes on, the remark told on the way', async () => {
    const s = await PlaySession.start('test/fixtures/probes/aside-way/probe.campaign.json', 'aside', NodeBundleSource.shared);
    const done = await Travel.go({ campaign: s.campaign, perform: (c: string) => s.perform(c) }, 'p__c');
    expect(done).toMatchObject({ arrived: true });
    expect(done.legs.map(l => l.command)).toEqual(['go(p__ab,p__b)', 'go(p__bc,p__c)']);
    expect((done.legs[0]!.event.perceptions ?? []).map(p => p.text)).toContain("'A fold,' says Pal. 'My father kept one like it.'");
  }, 60000);
});
