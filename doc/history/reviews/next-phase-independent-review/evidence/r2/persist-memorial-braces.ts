// Probe (r2): a fallen companion's name is written into the next world's Kyr text (Memorials.remember); Kyr reads
// '{...}' in text as an entity reference. A name with braces, typed at creation, makes the country begun again fail.
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
for (const name of ['Wenna', '{Wenna}', 'Wen"na', 'Back\\slash']) {
  const memorial = { name, place: 'region__s1_green', how: 'A wolf took them.' };
  try {
    const s = await DrawnWorld.start('thorn', { party: [{ name: 'Bran', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer', memorial }, NodeBundleSource.shared);
    const text = JSON.stringify(s.campaign.module).match(/Stones are heaped[^"]{0,60}/)?.[0];
    console.log(`memorial ${JSON.stringify(name)}: starts; ${text ?? '(memorial not placed)'}`);
  } catch (e) { console.log(`memorial ${JSON.stringify(name)}: FAILS ${(e as Error).message.split('\n')[0]?.slice(0, 140)}`); }
}
