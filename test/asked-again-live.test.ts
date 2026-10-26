import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Operator, Predicate } from '../src/lang/module';

// Every question that can be asked again can be: none of the copies waits on its own fact being unknown (the
// architecture review's A19, from its probe new-topic-again: 10 of What Tessary Owes' and 12 of a generated country's
// could never be offered), and none repeats more than teaching.
class Copies {
  static key(c: { name: string; args: string[] }) { return `${c.name}(${c.args.join(',')})`; }
  static negated(p: Predicate | undefined, out = new Set<string>()): Set<string> {
    if (!p) { return out; }
    if (p.kind === 'not' && p.value.kind === 'call') { out.add(this.key(p.value)); }
    if (p.kind === 'and' || p.kind === 'or') { this.negated(p.left, out); this.negated(p.right, out); }
    return out;
  }
  static dead(c: Campaign): string[] {
    const actions = c.module.actions as Operator[], byId = new Map(actions.map(a => [a.id, a]));
    return actions.filter(a => a.id.endsWith('_again') && byId.has(a.id.slice(0, -6))).filter(a => {
      const asked = byId.get(a.id.slice(0, -6))!, barred = this.negated(a.requires);
      return asked.success.some(e => e.kind === 'assert' && barred.has(this.key(e.call)));
    }).map(a => a.id);
  }
}
describe('a question that can be asked again', () => {
  it('can be, in an authored adventure and in a generated country', async () => {
    expect(Copies.dead(await Campaign.load('data/campaigns/what-tessary-owes.campaign.json', 'ossel', NodeBundleSource.shared)))
      .toEqual([]);
    const w = await WorldAssembler.assemble('s0', NodeBundleSource.shared);
    const generated = await Campaign.load(w.path, 's0', w.source);
    expect(Copies.dead(generated)).toEqual([]);
    expect(generated.module.actions.filter(a => a.id.endsWith('_again')).length).toBeGreaterThan(20);
  }, 240000);
});
