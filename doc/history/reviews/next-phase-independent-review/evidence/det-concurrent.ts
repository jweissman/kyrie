// Probe: two campaigns loaded concurrently (Promise.all) while LocalKinds is process-global, and one campaign's
// canonical state after interleaving with another versus played alone.
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../src/presentation/player-view';
import { Canon } from '../../../../src/canon/canon';

const files: Record<string, string> = {};
for (const [dir, worth] of [['a', 2], ['b', 99]] as const) {
  files[`det/${dir}/site.kyr`] = `Module det${dir} "Det ${dir}" { Place field "Field" is wilderness.
    Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
    Kind coin_${dir} "a coin" is treasure worth ${worth}. Kind token "a token" is treasure worth ${worth}.
    Item c "a coin" is coin_${dir} at room. Item t "a token" is token at room. }`;
  files[`det/${dir}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
    exports: { party: 'party' } });
  files[`det/${dir}.campaign.json`] = JSON.stringify({ version: 1, name: dir, modules: [{ id: 'p', bundle: `${dir}/module.json` }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
}
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const start = (d: string) => PlaySession.start(overlay.resolve(`det/${d}.campaign.json`), `seed-${d}`, overlay);
async function steps(s: PlaySession) {
  for (const prefix of ['take_item(p__c', 'take_item(p__t']) {
    const id = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(prefix))?.choice.id;
    if (id) { await s.perform(id); } else { return `missing ${prefix}`; }
  }
  return 'ok';
}
const mode = process.argv[2];
if (mode === 'alone') {
  const a = await start('a'); console.log('steps', await steps(a));
  console.log('A canonical', Bun.hash(a.canonical()).toString(16));
} else if (mode === 'interleave') {
  const a = await start('a'); const b = await start('b');
  console.log('token worth after B started (global):', Canon.items.token?.value, 'coin_a in catalog:', !!Canon.items.coin_a);
  console.log('steps A', await steps(a)); console.log('steps B', await steps(b));
  console.log('A canonical', Bun.hash(a.canonical()).toString(16));
} else {
  try {
    const [a, b] = await Promise.all([start('a'), start('b')]);
    console.log('concurrent loads ok; steps A', await steps(a), 'B', await steps(b));
    console.log('A canonical', Bun.hash(a.canonical()).toString(16));
  } catch (e) { console.log('concurrent loads FAILED:', (e as Error).message.slice(0, 300)); }
}
