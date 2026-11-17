import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Sittings } from '../src/paintings/sittings';

// The first town's innkeeper is not one face in every world (CO-03): a generated country's people are painted by a
// hash of their world and their id, and a work's own painting (the tavernkeeper's) is one worker's in a world, the
// first by that hash; every other of the work is painted by their station. By id alone, a1's and thorn's first
// innkeepers had both been the art-dealer, and so had wren's and ember's.
const keepers = async (seed: string) => {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
    { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
  const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
  return c.module.entities.filter(e => /^region__s\d+_innkeeper$/.test(e.id)).map(e => Sittings.of(c, e.id));
};
describe('the innkeepers\' faces', () => {
  it('differ between two worlds\' first towns, and the tavernkeeper\'s painting is at most one innkeeper\'s', async () => {
    const [a1, thorn] = [await keepers('a1'), await keepers('thorn')];
    expect(a1[0]).toBeDefined();
    expect(a1[0]).not.toBe(thorn[0]);
    for (const world of [a1, thorn]) { expect(world.filter(f => f === 'tavernkeeper').length).toBeLessThanOrEqual(1); }
  }, 120000);
});
