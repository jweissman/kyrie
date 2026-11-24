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
  // Where the sky changes, the weather is the sky's to tell (OR-250: "The sun is warm on the wall" on a rainy morning):
  // a line or a thing's state that tells it without asking the sky is advice; asking the sky, or the sky's own line,
  // is not.
  it('is advice where the weather is told without asking a sky that changes', async () => {
    const green = `Place green "the green" is room at 0, 0 outdoors. Company party "You" of 1 at green.
      Thing sky "the sky" at green is scenery { State weather_fair "Fair.". State weather_rainy "Rain.". }
      Thing dog "the old dog" at green { State lying "An old dog lies in the sun by the wall.". }
      Observe warm at green when state(sky, weather_fair) "The sun is warm on the wall.".
      Observe wet at green as weather when state(sky, weather_rainy) "It is raining.".
      Goal false.`;
    const lint = new CampaignLint('tiny', (await Tiny.start(green)).session);
    lint.weathers();
    expect(lint.findings.map(f => `${f.level} ${f.check} ${f.message.split(' tells')[0]}`))
      .toEqual(['advice weather t__dog__lying']);
  });
});
