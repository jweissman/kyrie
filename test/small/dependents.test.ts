import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/session/journey';
import { SingleModule } from '../../src/campaign/single-module';
import { WhySources } from '../../src/cli/why-sources';
import { WhyDependents } from '../../src/cli/why-dependents';

// `kyrie inspect --dependents <symbol>` (the maturity track's step 4, the study's §7.1, its fourth question): what
// depends on a symbol, each at its declaration, read from the campaign as loaded. Its proving slice is the Gathering's
// mob (`--dependents --world a1 mob`: the three riot rules that loose it, at gathering.kyr:262, 264, 266) and the
// drove's altered tally (`--world iscoed altered`: the gate imports it as its forged, seven read it, the ink read
// teaches it). Here on a world of one module, so that no reader or changer is missed or misplaced.
class Deps {
  static readonly yard = `Module yard "A yard and a shop" {
  Place yard "the yard" is room.
  Place shop "the shop" is room.
  Company party "You" of 1 at yard.
  Person halm "Teodor Halm" at shop { Role "a scholar". Peaceable. Pronouns he. }
  Relation rung(entity).
  Action ring(actor: group, site: place) "Ring the bell" { Requires at(actor, site). On success { Assert rung(site). }
    Result "The bell rings.". }
  Rule halm_comes when rung(yard) and at(halm, shop) says "Halm comes out of the shop." {
    Retract at(halm, shop). Assert at(halm, yard). }
  Objective see_halm when not rung(yard) "Ring for Halm.".
  Goal false.
}`;
  static async of(symbol: string): Promise<string[]> {
    const one = SingleModule.source(this.yard), j = await Journey.start(one.campaign, 'deps', { source: one.source });
    return WhyDependents.report(j.campaign.module, new WhySources(one.campaign, one.source, 'deps'), symbol);
  }
}
describe('what depends on a symbol', () => {
  it('a relation: the act that changes it, the rule and the aim that read it, each at its line', async () => {
    const lines = await Deps.of('rung');
    expect(lines[0]).toMatch(/^yard__rung: .*:6: Relation rung\(entity\)\.$/);
    expect(lines).toContain('  read by 2:');
    expect(lines.some(l => /^ {4}rule yard__halm_comes at .*:9: Rule halm_comes/.test(l))).toBe(true);
    expect(lines.some(l => /^ {4}aim yard__see_halm at .*:11: Objective see_halm/.test(l))).toBe(true);
    expect(lines).toContain('  changed by 1:');
    expect(lines.some(l => /^ {4}act yard__ring at .*:7: Action ring/.test(l))).toBe(true);
  });
  it('a person: moved by the rule, and nothing that only names someone else', async () => {
    const lines = await Deps.of('halm');
    expect(lines[0]).toMatch(/^yard__halm: .*:5: Person halm "Teodor Halm" at shop/);
    expect(lines.filter(l => l.startsWith('    '))).toEqual([expect.stringMatching(/^ {4}rule yard__halm_comes at /)]);
    expect(lines).toContain('  changed by 1:');
  });
  it('says so of a symbol nothing is called', async () => {
    expect(await Deps.of('bell')).toEqual(['Nothing in the campaign is called bell.']);
  });
});
