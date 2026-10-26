// Review probe: start new games the way the title page's Begin does (DrawnWorld.start with a fresh seed and one
// person), and count how many fail before the first command. Seeds are deterministic so the run reproduces.
// Run from the repository root: bun doc/architecture/next-phase-independent-review/evidence/begin-seeds.ts [count]
import { DrawnWorld } from '../../../../src/world/drawn-world';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
const count = Number(process.argv[2] ?? 60), syll = (i: number) => 'bcdfghjklmnprstvwz'[i % 18]! + 'aeiou'[(i * 7) % 5]!;
let failed = 0;
for (let i = 0; i < count; i++) {
  const seed = [syll(i), syll(i * 5 + 3), syll(i * 11 + 1), syll(i * 13 + 7)].join('');
  const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never;
  try { await DrawnWorld.start(seed, { party, origin: 'wanderer' } as never, NodeBundleSource.shared); console.log(`${seed}: starts`); }
  catch (e) { failed++; console.log(`${seed}: FAILS (${(e as Error).message.split('\n')[0]})`); }
}
console.log(`${failed} of ${count} new games fail to start`);
