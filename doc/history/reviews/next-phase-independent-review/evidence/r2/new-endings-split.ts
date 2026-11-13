// Probe (741240d): Endings.lower declares the 0-ary relation `concluded` once per parsed FILE (it checks only the
// module being parsed). A module whose endings are written in two of its source files then declares it twice when the
// files are merged. Does such a module load, and does each ending still close the book once?
// Usage: bun new-endings-split.ts
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';

const head = `Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.`;
const files: Record<string, string> = {
  'en/a.kyr': `Module en "Endings" { ${head} Relation won(group). Ending one "One" when won(party) "The end, one." . Goal false. }`,
  'en/b.kyr': `Module en "Endings" { Relation lost(group). Ending two "Two" when lost(party) "The end, two." . }`,
  'en/module.json': JSON.stringify({ version: 1, source: ['a.kyr', 'b.kyr'], rules: ['world'], globals: ['party'], exports: { party: 'party' } }),
  'en.campaign.json': JSON.stringify({ version: 1, name: 'en', modules: [{ id: 'p', bundle: 'en/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
};
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
try {
  const s = await PlaySession.start(overlay.resolve('en.campaign.json'), 'seed', overlay);
  console.log('loads; relations named *concluded:', s.campaign.module.relations.filter(r => r.name.endsWith('concluded')).map(r => r.name));
} catch (e) { console.log('FAILS to load:', (e as Error).message.slice(0, 300)); }
// Control: the same two endings in one file.
const one: Record<string, string> = { ...files,
  'en/a.kyr': `Module en "Endings" { ${head} Relation won(group). Relation lost(group). Ending one "One" when won(party) "The end, one." . Ending two "Two" when lost(party) "The end, two." . Goal false. }`,
  'en/module.json': JSON.stringify({ version: 1, source: ['a.kyr'], rules: ['world'], globals: ['party'], exports: { party: 'party' } }) };
const overlay1 = new OverlayBundleSource(NodeBundleSource.shared, one);
try {
  const s = await PlaySession.start(overlay1.resolve('en.campaign.json'), 'seed', overlay1);
  console.log('control (one file) loads; relations named *concluded:', s.campaign.module.relations.filter(r => r.name.endsWith('concluded')).map(r => r.name));
} catch (e) { console.log('control FAILS:', (e as Error).message.slice(0, 300)); }
