import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// A Rule written `once` happens the first time its condition holds, and never again (the architecture review's M2:
// 262 of 731 rules asserted a fact their own condition denied, a latch each wrote by hand).
describe('a rule written once', () => {
  it('happens the first time its condition holds, and not again while it holds', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ro/site.kyr': `Module ro "Once" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Measure rung(group). Measure tolled(group).
        Rule bell when watch(clock) >= 1 once says "A bell rings once." { Increase rung(party) by 1. }
        Rule toll when watch(clock) >= 1 { Increase tolled(party) by 1. } }`,
      'ro/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ro.campaign.json': JSON.stringify({ version: 1, name: 'ro', modules: [{ id: 'p', bundle: 'ro/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('ro.campaign.json'), 'ro', source);
    const first = await s.perform('wait');
    for (let i = 0; i < 3; i++) { await s.perform('wait'); }
    const n = (name: string) => s.campaign.world.number({ kind: 'call', name, args: ['party'] });
    expect([n('p__rung'), n('p__tolled') > 1]).toEqual([1, true]);
    expect((first.perceptions ?? []).map(p => p.text)).toContain('A bell rings once.');
  }, 60000);
});
