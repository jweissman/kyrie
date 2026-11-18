import { describe, expect, it } from 'bun:test';
import { RunnerPayoff } from '../../src/cli/runner-payoff';
import type { CampaignEvent } from '../../src/campaign/campaign-types';

// What an act changed, as the runner says it, is the act's doing, not the rules' bookkeeping (cold play 3, CL-15: 68
// canTrain(…) facts after one act, from breathe_fire to bleat, with no lesson offered).
describe('what an act changed, said by the runner', () => {
  it('leaves out what a member could be taught', () => {
    const event = { changes: ['+ canTrain(region__member_party_1, breathe_fire)', '+ canTrain(region__member_party_1, bleat)',
      '+ grateful(drove__bran, party)'] } as unknown as CampaignEvent;
    expect(RunnerPayoff.changed(event, 'drove__show_drowned(party,drove__customs)')).toEqual(['+ grateful(drove__bran, party)']);
  });
});
