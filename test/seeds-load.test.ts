import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { DrawnWorld } from '../src/world/drawn-world';

// Every country a seed draws loads (the architecture review's H1, from its probes unloadable-seeds and begin-seeds):
// a scenario's site that could stand nowhere in the land was placed all the same, never written, and named in the
// region's exports, so s24 and alpha would not load, nor the game Begin drew for juvesese.
describe('a generated country', () => {
  it('loads for every seed, those that once failed among them', async () => {
    for (const seed of ['s24', 'alpha', 's0', 's7']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
      const s = await PlaySession.start(w.path, seed, w.source);
      expect(s.campaign.running).toBe(true);
      // Every site the region holds stands somewhere.
      expect(w.report.region.sites.filter(site => site.cell === undefined).map(site => site.id)).toEqual([]);
    }
  }, 300000);
  it('loads as Begin starts it', async () => {
    const s = await DrawnWorld.start('juvesese', { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never,
      origin: 'wanderer' }, NodeBundleSource.shared);
    expect(s.campaign.running).toBe(true);
  }, 120000);
});
