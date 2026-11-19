import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { BundleSource } from '../src/campaign/bundle-source';

// `kyrie lint --world <seed>` (the maturity track's step 2, MT-02): a drawn world linted as it is played, so that the
// standing scenarios it places (data/situations), where R26 and R86 were first met, are held to the intention lint
// as the campaigns are, each finding said at its line in data/ (test/world-lint holds such worlds to no error). Its
// first run found the Gathering's riot, which asked where the mob was, and the mob was nowhere: it never broke (MT-09,
// mended 19 November; test/walk-clock sees it break). With the mistake put back it is found again, at its line.
const gathering = 'data/situations/walk/gathering.kyr';
const mistaken: BundleSource = {
  resolve(relative: string, from?: string) { return NodeBundleSource.shared.resolve(relative, from); },
  async read(path: string) {
    const text = await NodeBundleSource.shared.read(path);
    return path.endsWith(gathering) ? text.replace(/(flashpoint\(f_[bcd]\))\n/g, '$1 and at(mob, ?m)\n') : text;
  },
};
describe('kyrie lint of a drawn world', () => {
  it('lints a1 with its standing scenarios: no intention left, and no error', async () => {
    const [findings] = Object.values(await KyrLint.worlds(['a1']));
    expect(findings!.filter(f => f.check === 'untied' || f.check === 'never-there')).toEqual([]);
    expect(findings!.filter(f => f.level === 'error')).toEqual([]);
  }, 120000);
  it('finds the riot that asks where the mob is again, at its line in data/', async () => {
    const [findings] = Object.values(await KyrLint.worlds(['a1'], mistaken));
    const mob = findings!.filter(f => f.check === 'never-there' && f.message.includes('walk__mob'));
    expect(mob.length).toBeGreaterThan(0);
    // At each rule's own line (262, 264, 266), not the mob's.
    expect(mob.map(f => /^([\w/.-]+:\d+): /.exec(f.message)?.[1]).sort())
      .toEqual([262, 264, 266].map(n => `${gathering}:${n}`));
  }, 120000);
});
