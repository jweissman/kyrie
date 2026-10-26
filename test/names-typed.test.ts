import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// A name the player types goes into the world as a name, never as Kyr (the architecture review's A12, from its probe
// persist-name-injection: Wen"na and Back\slash broke Begin, {creditor} named an entity, and {homename} was filled in
// as a place's name).
describe('a name typed at Begin', () => {
  it('is refused, said plainly, if it cannot stand in the text as a name', async () => {
    for (const name of ['{creditor}', 'Wen"na', 'Back\\slash']) {
      expect(DrawnWorld.start('thorn', { party: [{ name, raceId: 'human', classId: 'warrior' }] as never, origin: 'order' },
        NodeBundleSource.shared)).rejects.toThrow('may not have braces, quotes or a backslash');
    }
    const s = await DrawnWorld.start('thorn', { party: [{ name: "O'Brien", raceId: 'human', classId: 'warrior' }] as never,
      origin: 'order' }, NodeBundleSource.shared);
    expect(s.campaign.fighters.map(f => f.name)).toContain("O'Brien");
  }, 120000);
  it('given by another way than the page, is written into the world as a name, and refused there', async () => {
    for (const name of ['Wen"na', '{homename}']) {
      const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { origin: 'order',
        party: [{ name, raceId: 'human', classId: 'warrior' }] });
      const origin = await w.source.read(w.source.resolve('world-thorn/origin/origin.kyr'));
      expect(origin).not.toContain('{homename}');
      expect(origin).not.toContain('Wen"na');
      expect(PlaySession.start(w.path, 'thorn', w.source)).rejects.toThrow('may not have braces, quotes or a backslash');
    }
  }, 120000);
});
