// Probe (r2): the protagonist's name, as typed on the creation page, is spliced unescaped into origin Kyr source
// (Origins.fill, '{protagonist}'), with a second template pass. What do quotes, braces and length do?
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
const seed = process.argv[2] ?? 'thorn';
const names = ['Wenna', "O'Brien", 'Wen"na', '{creditor}', '{homename}', 'Back\\slash', 'x'.repeat(60),
  'Wen". Assert owed(loan) = 0. Observe sees near creditor "hi'];
for (const origin of ['debt', 'order']) {
  for (const name of names) {
    try {
      const s = await DrawnWorld.start(seed, { party: [{ name, raceId: 'human', classId: 'warrior' }] as never, origin }, NodeBundleSource.shared);
      const src = JSON.stringify(s.campaign.module).match(/"[^"]{0,80}(says [^"]{0,30}and does not get up|be given a bed)[^"]{0,10}/)?.[0];
      const shown = s.campaign.fighters.map(f => f.name);
      console.log(`${origin} ${JSON.stringify(name).slice(0, 50)}: starts; company ${JSON.stringify(shown).slice(0, 60)}; text ${src?.slice(0, 110) ?? '(not found)'}`);
    } catch (e) { console.log(`${origin} ${JSON.stringify(name).slice(0, 50)}: FAILS ${(e as Error).message.split('\n')[0]?.slice(0, 160)}`); }
  }
}
