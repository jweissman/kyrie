import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import type { BundleSource } from '../src/campaign/bundle-source';

describe('a game whose modules are read while another game begins', () => {
  it('keeps its own module kinds when another campaign loads during a source read', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    let another: Promise<PlaySession> | undefined;
    const source: BundleSource = { resolve: (p, from) => w.source.resolve(p, from),
      read: async p => {
        const text = await w.source.read(p);
        another ??= PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'other',
          NodeBundleSource.shared);
        await another;
        return text;
      } };
    const s = await PlaySession.start(w.path, 'kite', source);
    expect(s.campaign.readout.creatures.some(c => c.id === 'players__the_bear_person')).toBe(true);
    expect(s.campaign.catalog.isSpecies('players__dancing_bear')).toBe(true);
  }, 180000);
});
