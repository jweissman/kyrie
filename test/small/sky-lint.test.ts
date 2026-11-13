import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';

// Prose that tells the sky under the ground is for its author to look at (NP-01: daylight in old workings, "sunny"
// in a crypt): kyrie lint says so, as advice, and says nothing of the same words under the open sky.
const workings = `
  Place fell "the fellside" is room at 0, 0 outdoors.
  Place adit "the old adit" is room at 1, 0 underground.
  Passage mouth "the adit mouth" is path between fell and adit.
  Company party "You" of 1 at fell.
  Observe fell_scene at fell when true "Sunlight on the heather, and the adit's mouth below.".
  Observe adit_scene at adit when true "Daylight slants across the floor of the old working.".
  Goal false.`;

describe('the sky, under the ground', () => {
  it('is advice to look at in kyrie lint, and nothing above ground', async () => {
    const lint = new CampaignLint('tiny', (await Tiny.start(workings)).session);
    lint.skies();
    expect(lint.findings.map(f => `${f.level} ${f.check} ${f.message.split(' tells')[0]}`))
      .toEqual(['advice sky t__adit_scene']);
  });
});
