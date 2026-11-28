import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';

// A Rule written `once` happens the first time its condition holds, and never again (the architecture review's M2:
// 262 of 731 rules asserted a fact their own condition denied, a latch each wrote by hand).
describe('a rule written once', () => {
  it('happens the first time its condition holds, and not again while it holds', async () => {
    const kyr = `Module p "Once" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Measure rung(group). Measure tolled(group).
        Rule bell when watch(clock) >= 1 once says "A bell rings once." { Increase rung(party) by 1. }
        Rule toll when watch(clock) >= 1 { Increase tolled(party) by 1. } }`;
    const s = (await Tiny.start(kyr, { seed: 'ro', horizon: [] })).session;
    const first = await s.leg('wait');
    for (let i = 0; i < 3; i++) { await s.leg('wait'); }
    const n = (name: string) => s.campaign.world.number({ kind: 'call', name, args: ['party'] });
    expect([n('p__rung'), n('p__tolled') > 1]).toEqual([1, true]);
    expect((first.perceptions ?? []).map(p => p.text)).toContain('A bell rings once.');
  }, 60000);
});
