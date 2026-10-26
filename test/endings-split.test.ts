import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// A module whose Endings are written in two of its files loads (the architecture review's A16, from its probe
// new-endings-split: what an Ending declares for itself was declared once in each file, and the two clashed).
describe('endings in two files', () => {
  it('load, and the book closes on the first reached', async () => {
    const head = 'Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.';
    const files: Record<string, string> = {
      'en/a.kyr': `Module en "Endings" { ${head} Relation won(group). Ending one "One" when won(party) "The end, one." . Goal false. }`,
      'en/b.kyr': 'Module en "Endings" { Relation lost(group). Ending two "Two" when lost(party) "The end, two." . }',
      'en/module.json': JSON.stringify({ version: 1, source: ['a.kyr', 'b.kyr'], rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'en.campaign.json': JSON.stringify({ version: 1, name: 'en', modules: [{ id: 'p', bundle: 'en/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) };
    const source = new OverlayBundleSource(NodeBundleSource.shared, files);
    const s = await PlaySession.start(source.resolve('en.campaign.json'), 'seed', source);
    expect(s.campaign.module.relations.filter(r => r.name.endsWith('concluded')).length).toBe(1);
  }, 60000);
});
