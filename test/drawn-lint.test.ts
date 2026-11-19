import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';

// `kyrie lint --world <seed>` (the maturity track's step 2, MT-02): a drawn world linted as it is played, so that the
// standing scenarios it places (data/situations), where R26 and R86 were first met, are held to the intention lint
// as the campaigns are, each finding said at its line in data/ (test/world-lint holds such worlds to no error). Its
// first run found the Gathering's riot, which asks where the mob is, and the mob is nowhere: it never breaks.
describe('kyrie lint of a drawn world', () => {
  it('lints a1 with its standing scenarios, and says each intention at its line in data/', async () => {
    const [findings] = Object.values(await KyrLint.worlds(['a1']));
    const meant = findings!.filter(f => f.check === 'untied' || f.check === 'never-there');
    expect(meant.length).toBeGreaterThan(0);
    for (const f of meant) { expect(f.message).toMatch(/^data\/[\w/-]+\.kyr:\d+: /); }
    expect(findings!.filter(f => f.level === 'error')).toEqual([]);
  }, 120000);
});
