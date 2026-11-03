import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { Superseded } from '../src/lang/superseded';

// Quittance's ms 4 (QTC-A25): the bakehouse said the oven was 'banked and breathing', and once the coal was dead the
// line that said so was told below it. A line written `instead of` another is told in its place while it holds, from
// another of the module's files as well (test/fixtures/probes/instead).
describe('a line told instead of another', () => {
  it('replaces the scene while it holds, and not before', async () => {
    const j = await Journey.start('test/fixtures/probes/instead/probe.campaign.json', 'i');
    const seen = () => j.screen().observed.map(o => o.text).join(' ');
    expect(seen()).toMatch(/banked and breathing/);
    await j.play('Rake out the coals');
    expect(seen()).toMatch(/red light under the ash is gone/);
    expect(seen()).not.toMatch(/banked and breathing/);
  }, 30000);

  it('names a line there is', () => {
    const m = ModuleParser.parse(`Module m "m" { Kind place. Entity p: place "P".
      Observe a at p instead of b when true "A.". }`);
    expect(() => Superseded.lower(m)).toThrow(/instead of b, which is no observation/);
  });
});
