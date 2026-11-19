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
  // Nor every remedy that would now mend one fallen, all at once (CL-10, cold play 2's last turn: 295 facts, most of
  // them what could be taught or would mend; a mage fallen alone, 19 of 29 were what would mend her).
  it('leaves out what would mend a member, and keeps the fall', () => {
    const event = { changes: ['+ dead(party)', '+ fallen(t__member_party_1)', '+ relieves(t__member_party_1, herbs)',
      '+ treatable(t__member_party_1, cure_minor)', '- assails(t__sons, party)'] } as unknown as CampaignEvent;
    expect(RunnerPayoff.changed(event, 'face_down(t__sons)'))
      .toEqual(['+ dead(party)', '+ fallen(t__member_party_1)', '- assails(t__sons, party)']);
  });
});
