import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlacedSites } from '../src/world/placed-sites';
import { ExpeditionContract, type Contract } from '../src/world/expedition-contract';
import { WorkPlans } from '../src/world/history/work-plans';

// A site that makes every link but those given, declining these.
function site(made: Partial<Contract['links']>, declines?: Record<string, string>): Contract {
  const links = Object.fromEntries(ExpeditionContract.links.map(l => [l, true])) as Contract['links'];
  return { subject: 'w1', place: 'w1', links: { ...links, ...made }, ...declines ? { declines } : {} };
}

// Every site a generated world sets apart for an expedition makes the expedition's links, read off the world (the
// cold review's REV-01): word of it that makes an aim, a way to it and into it, someone or something in it to answer,
// and what it changes outside. A link a site does not make, its placement declines with why (a kit's `declines`, a
// work plan's @declines); a link neither made nor declined fails the contract. The tally is logged per seed so a
// change that loses one is seen.
describe('an expedition\'s contract', () => {
  it.each(['thorn', 'a1', 'b2'])('is kept by every placed site in %s', async seed => {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const composed = (await ModuleBundle.campaign(w.path, w.source, seed)).composition;
    const s = await PlaySession.start(w.path, seed, w.source), sites = PlacedSites.of(w.report, composed);
    const contracts = ExpeditionContract.of(s.campaign, sites), tally = ExpeditionContract.tally(contracts);
    console.log(seed, contracts.length, JSON.stringify(tally));
    expect(contracts.length).toBeGreaterThan(0);
    expect(ExpeditionContract.undeclared(contracts)).toEqual([]);
    for (const link of ['lead', 'aim', 'place', 'threshold', 'inside', 'answers'] as const) {
      expect([link, tally[link]]).toEqual([link, contracts.length]);
    }
  }, 240000);

  it('asks a reason of every decline, and lets no site decline being found or entered', () => {
    expect(ExpeditionContract.undeclared([site({ successor: false })])).toEqual(['w1: successor']);
    expect(ExpeditionContract.undeclared([site({ successor: false }, { successor: 'it leads nowhere' })])).toEqual([]);
    expect(ExpeditionContract.undeclared([site({ successor: false }, { successor: ' ' })]))
      .toEqual(['w1: declines successor']);
    expect(ExpeditionContract.undeclared([site({ aim: false }, { aim: 'nobody wants it' })]))
      .toEqual(['w1: aim', 'w1: declines aim']);
    expect(ExpeditionContract.undeclared([site({}, { wonder: 'no such link' })])).toEqual(['w1: declines wonder']);
  });

  it('reads a work plan\'s declines, reason and all', () => {
    const plan = WorkPlans.parse(['# hut: a hut.', '@art sky', '@kind ruin', '@seen a hut',
      '@declines successor: it leads nowhere: not yet', '@declines yield: bare'].join('\n'));
    expect(plan.declines).toEqual({ successor: 'it leads nowhere: not yet', yield: 'bare' });
  });
});
