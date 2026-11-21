import { describe, expect, it } from 'bun:test';
import { CompoundKindLint } from '../../src/cli/compound-kind-lint';
import { KyrLint } from '../../src/cli/kyr-lint';

// A Deem creature table names the base kind and generation the variation (OR-158): a compound kind the catalog
// resolves to base and variation (frost_wolf to wolf/winter_variant), named where generation draws a creature, is an
// error, and the uses found when the lint was written are a baseline that only shrinks.
describe('compound kinds in the generation tables', () => {
  it('are no more than the baseline, and the baseline no more than they are', () => {
    expect(CompoundKindLint.run(KyrLint.root)).toEqual([]);
  });
  it('finds them where a creature is drawn: a deep\'s species, a den beast, a template\'s Species', () => {
    const kinds = new Set(CompoundKindLint.uses(KyrLint.root).map(u => `${u.where.split(' ')[0]} ${u.kind}`));
    for (const k of ['tables/ecology.json frost_wolf', 'deep/deep.json cave_spider', 'works/galleries.kyrt cave_spider']) {
      expect(kinds.has(k)).toBe(true);
    }
    // A table drawn as words is prose: wildSign's stag, an inn's stag's head.
    expect([...kinds].some(k => k.endsWith(' stag'))).toBe(false);
  });
  it('says a new use, and a use the baseline keeps after it is gone', () => {
    const found = CompoundKindLint.findings([{ where: 'tables/ecology.json denBeast', kind: 'frost_wolf' }],
      ['deep/deep.json dwellers: cave_spider']);
    expect(found.map(f => `${f.level} ${f.message}`)).toEqual([
      'error tables/ecology.json denBeast: frost_wolf names a compound kind: name the base kind, and let generation'
        + ' choose the variation (OR-158)',
      'error deep/deep.json dwellers: cave_spider is in doc/architecture/mission-22/compound-kinds-baseline.json but'
        + ' no longer used: take it out of the baseline']);
  });
});
