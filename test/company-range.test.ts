import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import ready from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';

// The Lull's F12 (LUL-09): `Company party of 1` refused a campaign of three ("Choose 1 companions"), so its tests kept
// a copy of the module with a company of its own. A company of one to three is of as many as are chosen for it
// (test/fixtures/probes/company-range).
describe('a company of one to three', () => {
  const probe = (n: string) => Journey.start(`test/fixtures/probes/company-range/${n}.campaign.json`, 'c');

  it('is of as many as are chosen, within its bounds', async () => {
    expect((await probe('one')).campaign.readout.partyIds).toHaveLength(1);
    expect((await probe('three')).campaign.readout.partyIds).toHaveLength(3);
    await expect(probe('four')).rejects.toThrow(/Choose 1 to 3 companions/);
  }, 30000);

  // The shipped lone campaigns are of one to three (doc/imbar/companies.md): each starts with its one protagonist, and
  // a company chosen at creation (a ready company of three) may come instead.
  it('starts a lone story with its one, unless a company is chosen', async () => {
    const lull = 'data/campaigns/the-lull.campaign.json';
    expect((await Journey.start(lull, 'c')).campaign.readout.partyIds).toHaveLength(1);
    const fellowship = ready.companies.find(c => c.id === 'fellowship')!.members as CreatureGenerationContext[];
    expect((await Journey.start(lull, 'c', { party: fellowship })).campaign.readout.partyIds).toHaveLength(3);
  }, 60000);

  it('is written fewest first', () => {
    expect(ModuleParser.parse('Module m "m" { Kind place. Entity g: place "G". Company party "P" of 1 to 3 at g. }')
      .company).toMatchObject({ size: 1, most: 3 });
    expect(() => ModuleParser.parse('Module m "m" { Company party "P" of 3 to 1 at g. }')).toThrow(/of 3 to 1/);
  });
});
