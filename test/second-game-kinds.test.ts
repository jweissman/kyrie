import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { LocalKinds } from '../src/canon/local-catalog';
import type { BundleSource } from '../src/campaign/bundle-source';

// A game begun in the same process as another (New game, in the page's engine): the other, saving and reading ahead
// after its frame, puts its own kinds back in the catalogs while this one's modules are read, and the players' old
// dancing bear, declared by their module, could not be made (Mission 20). Here every read lets another game in.
describe('a game whose modules are read while another game is about', () => {
  it('keeps the kinds its own modules declare as they are installed', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const other = {}, source: BundleSource = { resolve: (p, from) => w.source.resolve(p, from),
      read: async p => { LocalKinds.claim(other, undefined); return w.source.read(p); } };
    const s = await PlaySession.start(w.path, 'kite', source);
    expect(s.campaign.readout.creatures.some(c => c.id === 'players__the_bear_person')).toBe(true);
  }, 180000);
});
