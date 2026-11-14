import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';

// An aim Follow this can lead nowhere by is an author's to mend: one about a fact the company knows, with no `toward`,
// names nowhere and no one the page could lead to (The Lull's first aim, its inn and stone in words alone: M21's
// playability list, PL-14). The lint warns of it (failing recommended content); given a place, or someone who
// stands in one, it is quiet.
const village = `
  Place vale "the vale" is settlement.
  Place green "the green" is room within vale at 0, 0 outdoors.
  Place inn "the Waiting Woman" is room within vale at 1, 0 indoors.
  Company party "You" of 1 at green.
  Person keeper "Mag" at inn { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Entity plan: fact "The valley opens on the seventh day.".
  Initially Assert established(plan). Initially Assert knows(party, plan).
  Objective wait when knows(party, plan) "Ask at the inn what it is like inside, then wait by the stone.".
  Relation asked(entity).
  Objective ask when knows(party, plan) and not asked(keeper) "Ask Mag what it is like inside.".
  Objective go when knows(party, plan) toward inn "Go to the inn.".
  Goal false.`;

describe('an aim the page can lead by', () => {
  it('is advised where it is about a fact alone, and not where it names someone or somewhere', async () => {
    const t = await Tiny.start(village);
    const lint = new CampaignLint('tiny', t.session);
    lint.targets();
    const said = lint.findings.map(f => f.message);
    expect(said).toEqual([expect.stringMatching(/^t__wait is about t__plan, which is neither/)]);
  });
});
