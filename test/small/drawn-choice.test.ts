import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';

// A standing scenario holds every staging's acts, and a drawn world only one staging (the Walk's green, a den's
// marvel): the others wait on a fact the draw left false and nothing makes true, which is meant, and `kyrie lint` says
// so as advice. An act that no one can ever do for another reason, or that waits on what nothing ever writes (the
// engine-written probe's gloat), stays a warning (MT-02: of 221 warnings over a1, iscoed and kite, 127 were stagings
// not drawn, and hid the rest).
const green = (rule: string) => `
  Place green_a "the first green" is room at 0, 0.
  Place green_b "the second green" is room at 1, 0.
  Passage lane "the lane" is path between green_a and green_b.
  Company party "You" of 1 at green_a.
  Relation flashpoint(place). Relation office_built().
  Initially Assert flashpoint(green_a). Initially Assert office_built().
  Action rally_b(actor: group, site: place) "Rally the crowd on the second green" {
    Requires at(actor, site) and at(actor, green_b) and flashpoint(green_b).
  }
  Action petition(actor: group, site: place) "Petition for an office" {
    Requires at(actor, site) and not office_built().
  }
  Relation defeated(group).
  Action gloat(actor: group, site: place) "Gloat" { Requires at(actor, site) and defeated(party). }
  Kind steed.
  Action feast(actor: group, site: place, mount: steed) "Ride {mount} to the feast" { Requires at(actor, site). }
  ${rule}
  Goal false.`;
const applicability = async (rule = '') => {
  const l = new CampaignLint('tiny', (await Tiny.start(green(rule), { horizon: [] })).session);
  l.applicability();
  return l.findings.filter(f => f.check === 'applicability').map(f => `${f.level}: ${f.message}`).sort();
};

describe('a staging the draw did not choose', () => {
  it('is advice, the fact said; an act no one can do for another reason stays a warning', async () => {
    expect(await applicability()).toEqual([
      'advice: action t__petition waits on not t__office_built, not so in this world, and nothing makes it so',
      'advice: action t__rally_b waits on t__flashpoint, not so in this world, and nothing makes it so',
      'warning: action t__feast has no possible target in this world',
      'warning: action t__gloat has no possible target in this world']);
  });
  it('is not said where a rule can make the fact so', async () => {
    expect(await applicability('Rule spreads when day(clock) >= 2 { Assert flashpoint(green_b). }')).toEqual([
      'advice: action t__petition waits on not t__office_built, not so in this world, and nothing makes it so',
      'warning: action t__feast has no possible target in this world',
      'warning: action t__gloat has no possible target in this world']);
  });
  // Its beasts wild, unquiet or stubborn, a den drew one; the acts of the two it did not draw wait on a fact held of
  // nothing, beside the one it did (MT-02's den smoke_out and lay_to_rest). And a life the company did not begin (the
  // herb-wife's errand, expects(mother, party)) is a choice made at creation (the fever's mother_sent).
  it('is said of an alternative the draw left false beside one it chose, and of a life not begun', async () => {
    const den = `
  Place den "the den" is room at 0, 0.
  Company party "You" of 1 at den.
  Entity beasts: group "the beasts". Entity mother: group "the mother".
  Relation wild(group). Relation unquiet(group). Relation stubborn(group). Relation driven(group).
  Initially Assert stubborn(beasts).
  Action smoke_out(actor: group, site: place) "Smoke them out" {
    Requires at(actor, site) and wild(beasts).
    On success { Assert driven(beasts). }
  }
  Action chase(actor: group, site: place) "Chase them" { Requires at(actor, site) and driven(beasts). }
  Action sent(actor: group, site: place) "Ask after the child" { Requires at(actor, site) and expects(mother, actor). }
  Goal false.`;
    const l = new CampaignLint('tiny', (await Tiny.start(den, { horizon: [] })).session);
    l.applicability();
    expect(l.findings.filter(f => f.check === 'applicability').map(f => `${f.level}: ${f.message}`).sort()).toEqual([
      'advice: action t__sent waits on expects, not so in this world, and nothing makes it so',
      'advice: action t__smoke_out waits on t__wild, not so in this world, and nothing makes it so']);
    // (chase waits on what an act makes, so it has a target; the alternatives are only those nothing changes.)
  });
});
