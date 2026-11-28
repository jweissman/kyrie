import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';
import { AuthorLint } from '../../src/cli/author-lint';
import { LintSource } from '../../src/cli/lint-source';
import { KyrLint } from '../../src/cli/kyr-lint';

// What an author meant and the module does not say, told by kyrie lint before play finds it (the maturity track's
// MT-02, from the Kyr requests R26, R86 and R42): an act offered in every room because its site is never tied to the
// thing it acts on, a rule that asks where someone is of one who is nowhere and never comes, and a module's own name
// beside a shared one, said with the name it became. Advice (R42's a warning, as it was): none fails a lint.
const house = (tie: string, move: string) => `
  Place hall "the hall" is room at 0, 0 indoors.
  Place landing "the landing" is room at 1, 0 indoors.
  Passage arch "the arch" is path between hall and landing.
  Company party "You" of 1 at landing.
  Person ghost "the ghost" nowhere { Role "a ghost". }
  Person heir "the heir" nowhere { Role "an heir". Arrives at hall when state(drawer, open). }
  Thing drawer "the drawer" at hall {
    State locked "A locked drawer.".
    State open "An open drawer.".
  }
  Measure notch(thing).
  Relation settled(thing).
  Relation quiet(place).
  Action turn_ring(actor: group, site: place) "Turn the ring one notch" {
    Requires at(actor, site)${tie} and state(drawer, locked).
    On success { Increase notch(drawer) by 1. }
  }
  Action hearken(actor: group, site: place) "Hearken" {
    Requires at(actor, site) and quiet(site) and state(drawer, locked).
  }
  Rule ghost_goes when ${move} and state(drawer, open) { Assert at(ghost, hall). }
  Rule heir_goes when at(heir, ?p) and state(drawer, open) { Assert at(heir, landing). }
  Goal false.`;
const lint = async (tie: string, move: string) => {
  const l = new CampaignLint('tiny', (await Tiny.start(house(tie, move))).session);
  l.shadows(); AuthorLint.untied(l); AuthorLint.neverThere(l);
  return l.findings.map(f => `${f.level} ${f.check}: ${f.message}`);
};

describe('the intention lint', () => {
  it('says an act whose site is never tied to the thing it acts on is offered in every room (R26)', async () => {
    const found = (await lint('', 'not at(ghost, ?p)')).filter(f => f.includes('untied'));
    expect(found).toEqual(['advice untied: Action t__turn_ring asks the state of t__drawer and where the one who acts '
      + 'stands, but never that t__drawer is at site: it is offered in every room; ask at(t__drawer, site) too']);
    expect((await lint(' and at(drawer, site)', 'not at(ghost, ?p)')).filter(f => f.includes('untied'))).toEqual([]);
  });
  it('says a rule asking where one is who is nowhere and never comes never happens (R86)', async () => {
    const found = (await lint(' and at(drawer, site)', 'at(ghost, ?p)')).filter(f => f.includes('never-there'));
    expect(found.map(f => f.split(', but')[0])).toEqual(['advice never-there: t__ghost_goes asks at(t__ghost, ?…)']);
    expect((await lint(' and at(drawer, site)', 'not at(ghost, ?p)')).filter(f => f.includes('never-there')))
      .toEqual([]);
  });
  it('says a module\'s own name beside a shared one with the name it became (R42)', async () => {
    expect((await lint('', 'not at(ghost, ?p)')).filter(f => f.includes('shadow'))).toEqual(['warning shadow: t: '
      + 'settled is a name of the shared rules too; in this module it is the module\'s own, t__own_settled to a spec '
      + 'or a save']);
    const t = await Tiny.start(house('', 'not at(ghost, ?p)'));
    expect(t.world.test({ kind: 'call', name: 't__own_settled', args: ['t__drawer'] }, {})).toBe(false);
    const probe = await KyrLint.campaign('test/fixtures/probes/shadow/probe.campaign.json');
    expect(probe.filter(f => f.check === 'shadow').map(f => f.message.replace(/ is .*own, /, ' → '))).toEqual([
      'p: confided → p__own_confided to a spec or a save (test/fixtures/probes/shadow/site.kyr:10)',
      'p: fellow → p__own_fellow to a spec or a save (test/fixtures/probes/shadow/site.kyr:10)',
      'p: action light_lamp → p__own_light_lamp to a spec or a save (test/fixtures/probes/shadow/site.kyr:12)']);
  });
  it('locates a declaration in its author\'s files', () => {
    const quittance = 'data/campaigns/quittance.campaign.json';
    expect(LintSource.at(quittance, 'quittance__slip_the_stair', 'Action')).toBe('data/adventures/quittance/arch.kyr:108: ');
    expect(LintSource.at(quittance, 'arcology__turn_ring', 'Action')).toBe('data/situations/arcology/halls.kyr:105: ');
    expect(LintSource.at('tiny', 'arcology__turn_ring', 'Action')).toBe('');
  });
});
