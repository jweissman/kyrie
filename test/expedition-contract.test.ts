import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlacedSites } from '../src/world/placed-sites';
import { ExpeditionContract } from '../src/world/expedition-contract';

// Every site a generated world sets apart for an expedition makes the expedition's links, read off the world (the
// cold review's REV-01): word of it that makes an aim, a way to it and into it, someone or something in it to answer,
// and what it changes outside. The links every site makes are held here; the rest are reported per seed, as they
// stand, so a change that loses one is seen.
describe('an expedition\'s contract', () => {
  it.each(['thorn', 'a1'])('is kept by every placed site in %s', async seed => {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const composed = (await ModuleBundle.campaign(w.path, w.source, seed)).composition;
    const s = await PlaySession.start(w.path, seed, w.source), sites = PlacedSites.of(w.report, composed);
    const contracts = ExpeditionContract.of(s.campaign, sites), tally = ExpeditionContract.tally(contracts);
    console.log(seed, contracts.length, JSON.stringify(tally));
    expect(contracts.length).toBeGreaterThan(0);
    for (const link of ['lead', 'aim', 'place', 'threshold'] as const) {
      expect([link, tally[link]]).toEqual([link, contracts.length]);
    }
  }, 240000);
});
