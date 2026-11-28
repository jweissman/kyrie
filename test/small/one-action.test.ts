import { afterEach, describe, expect, it } from 'bun:test';
import { CampaignGrounding } from '../../src/campaign/campaign-grounding';
import { Tiny } from '../support/tiny';

// An act is checked by its own schema alone (OR-725): one offered is done, one whose precondition fails or that names
// what is not there is refused, as the whole list of what is offered would have it (test/one-action holds the walks).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place barn "the barn" is room at 1, 0.
  Passage door "the barn door" is door between yard and barn taking 1 minutes.
  Company party "You" of 1 at yard.
  Goal false.`;
describe('an act asked for by its id', () => {
  afterEach(() => { CampaignGrounding.checking = false; });
  it('is done where offered and refused where not, as the whole list has it', async () => {
    // Its id read off another game's list: a list worked out for this world would be read instead.
    const go = (await Tiny.start(yard, { horizon: [] })).campaign.offered().find(a => a.id.startsWith('go('))!;
    const t = await Tiny.start(yard, { horizon: [] });
    CampaignGrounding.checking = true;
    CampaignGrounding.checked.asked = 0; CampaignGrounding.checked.differ.length = 0;
    expect(() => t.campaign.execute('go(party,t__nowhere)')).toThrow();
    expect(() => t.campaign.execute('rest_nowhere')).toThrow();
    t.campaign.execute(go.id);
    expect(t.where()).not.toBe('t__yard');
    expect(() => t.campaign.execute(go.id)).toThrow();
    expect(CampaignGrounding.checked).toEqual({ asked: 4, differ: [] });
  });
});
