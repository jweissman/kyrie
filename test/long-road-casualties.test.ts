import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Placed } from './support/placed';
import { campaign, prepared } from './support/long-road';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';

describe('The road crew', () => {
  it('does not clear the fall or describe work after the crew is killed', async () => {
    const j = await prepared();
    await j.play('Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal', '==+12');
    j.assert('struckDead', 'lc_crew');
    Consequences.slay(j.campaign as unknown as TickHost);
    Placed.at(j, 'tallow__calx_portal');
    await j.play('==+24');
    expect(j.holds('able', 'lc_crew')).toBe(false);
    expect(j.holds('state', 'buried_portal', 'buried')).toBe(true);
    expect(j.holds('lcClearedByCrew', 'party')).toBe(false);
    expect(j.page).not.toContain('Merren\'s masons are shifting the scree');
  }, 10000);

  for (const person of ['lc_ferryman', 'lc_quartermaster']) {
    it(`cannot bargain when ${person} has died`, async () => {
      const j = await Journey.start(campaign, 'long-road');
      j.put('lc_ferryman', 'green');
      j.put('lc_raiders', 'bank');
      j.assert('knows', 'party', 'lc_boats_memory');
      j.assert('knows', 'party', 'lc_withdrawal_cost');
      Placed.at(j, 'tallow__taproom');
      expect(j.offers('Ask Merren to bargain with the Ferryman')).toBe(true);
      j.assert('struckDead', person);
      Consequences.slay(j.campaign as unknown as TickHost);
      j.campaign.refreshProjection();
      expect(j.holds('able', person)).toBe(false);
      expect(j.offers('Ask Merren to bargain with the Ferryman')).toBe(false);
    }, 10000);
  }

  it('cannot pay or accept terms from a dead Ferryman', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.put('lc_ferryman', 'green');
    j.put('lc_raiders', 'bank');
    j.assert('lcTermsHeard', 'party');
    j.assert('lcBargained', 'party');
    Placed.at(j, 'tallow__green');
    expect(j.offers('Accept the Ferryman\'s terms for the bank')).toBe(true);
    expect(j.offers('Give the Ferryman three rations to withdraw his men')).toBe(true);
    j.assert('struckDead', 'lc_ferryman');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    expect(j.offers('Accept the Ferryman\'s terms for the bank')).toBe(false);
    expect(j.offers('Give the Ferryman three rations to withdraw his men')).toBe(false);
  }, 10000);

  it('puts the bargained food in the Ferryman\'s stores', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.put('lc_ferryman', 'green');
    j.put('lc_raiders', 'bank');
    j.assert('lcBargained', 'party');
    Placed.at(j, 'tallow__green');
    const partyFood = j.measure('quantity', 'party', 'rations');
    const ferrymanFood = j.measure('quantity', 'lc_ferryman', 'rations');
    await j.play('Give the Ferryman three rations to withdraw his men');
    expect(j.measure('quantity', 'party', 'rations')).toBe(partyFood - 3);
    expect(j.measure('quantity', 'lc_ferryman', 'rations')).toBe(ferrymanFood + 3);
    expect(j.holds('lcTruce', 'party')).toBe(true);
  }, 10000);

  it('gives the Ferryman the ration paid for his original terms', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.put('lc_ferryman', 'green');
    j.assert('lcTermsHeard', 'party');
    Placed.at(j, 'tallow__green');
    const partyFood = j.measure('quantity', 'party', 'rations');
    const ferrymanFood = j.measure('quantity', 'lc_ferryman', 'rations');
    await j.play('Accept the Ferryman\'s terms for the bank');
    expect(j.measure('quantity', 'party', 'rations')).toBe(partyFood - 1);
    expect(j.measure('quantity', 'lc_ferryman', 'rations')).toBe(ferrymanFood + 1);
    expect(j.holds('lcAccepted', 'party')).toBe(true);
  }, 10000);

  it('can recover the set-aside food but cannot share it after Linnet dies', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('knows', 'party', 'lc_rival_need');
    Placed.at(j, 'tallow__garden');
    await j.play('Set aside a ration for a meal with Linnet');
    j.assert('struckDead', 'lc_rival');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    expect(j.offers('Cook the meal with Linnet')).toBe(false);
    expect(j.offers('Share the meal cold with Linnet')).toBe(false);
    expect(j.offers('Put the ration away for another time')).toBe(true);
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Put the ration away for another time');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food + 1);
  }, 10000);

});

describe('The drawing and the crew', () => {
  it('takes the drawing price from the buyer rather than creating money', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('knows', 'party', 'lc_drawing_risk');
    Placed.at(j, 'tallow__green');
    const gold = j.measure('quantity', 'party', 'gold');
    expect(j.measure('quantity', 'lc_buyer', 'gold')).toBe(4);
    await j.play('Sell the buyer a drawing of the entrances');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 4);
    expect(j.measure('quantity', 'lc_buyer', 'gold')).toBe(0);
    expect(j.at('lc_buyer')).not.toBe('tallow__green');
  }, 10000);

  it('sends the buyer away when the company keeps the drawing', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('knows', 'party', 'lc_drawing_risk');
    Placed.at(j, 'tallow__green');
    await j.play('Keep the drawing and send the buyer away');
    expect(j.at('lc_buyer')).not.toBe('tallow__green');
    expect(j.holds('lcKept', 'party')).toBe(true);
    expect(j.holds('lcCrewSummoned', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party') - j.measure('lcStart', 'party')).toBe(120);
  }, 10000);

  it('starts the raid at the sale but summons the crew only after Merren hears of it', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('knows', 'party', 'lc_drawing_risk');
    j.assert('knows', 'party', 'lc_warden_news');
    Placed.at(j, 'tallow__green');
    await j.play('Sell the buyer a drawing of the entrances', '==+24');
    expect(j.holds('lcScoutArrived', 'party')).toBe(true);
    expect(j.holds('lcCrewSummoned', 'party')).toBe(false);
    expect(j.holds('lcCrewArrived', 'party')).toBe(false);
    const raid = j.measure('lcRaidAt', 'party');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Into the Chandler\'s Arms');
    expect(resumed.offers('Give two days of rations to Merren\'s repair crew')).toBe(false);
    const stored = resumed.measure('quantity', 'lc_quartermaster', 'rations');
    const carried = resumed.measure('quantity', 'lc_crew', 'rations');
    await resumed.play('Tell Merren what happened to the drawing', 'Give two days of rations to Merren\'s repair crew');
    expect(resumed.measure('quantity', 'lc_quartermaster', 'rations')).toBe(stored + 2);
    const start = resumed.measure('lcCrewStart', 'party');
    expect(resumed.measure('lcRaidAt', 'party')).toBe(raid);
    expect(start).toBeGreaterThan(resumed.measure('lcStart', 'party'));
    await resumed.play(`==${start + 59}`);
    expect(resumed.holds('lcCrewArrived', 'party')).toBe(false);
    expect(resumed.holds('lcRaidArrived', 'party')).toBe(true);
    await resumed.play('==+1');
    expect(resumed.at('lc_crew')).toBe('tallow__taproom');
    expect(resumed.measure('quantity', 'lc_quartermaster', 'rations')).toBe(stored);
    expect(resumed.measure('quantity', 'lc_crew', 'rations')).toBe(carried + 2);
    expect(resumed.holds('lcCrewProvisions', 'party')).toBe(true);
  }, 10000);

  it('does not give the crew food that is no longer in Merren\'s keeping', async () => {
    const j = await Journey.start(campaign, 'missing-crew-food');
    j.assert('knows', 'party', 'lc_drawing_risk');
    j.assert('knows', 'party', 'lc_warden_news');
    j.assert('lcTruce', 'party');
    Placed.at(j, 'tallow__green');
    await j.play('Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms',
      'Tell Merren what happened to the drawing', 'Give two days of rations to Merren\'s repair crew');
    const start = j.measure('lcCrewStart', 'party');
    const call = ModuleWriter.call('quantity', 'tallow__lc_quartermaster', 'rations');
    j.campaign.commitWorld(j.campaign.world.apply([{ kind: 'set', call, value: ModuleWriter.number(0) }]));
    await j.play(`==${start + 131}`);
    expect(j.holds('lcCrewArrived', 'party')).toBe(false);
    await j.play('==+1');
    expect(j.at('lc_crew')).toBe('tallow__taproom');
    expect(j.holds('lcCrewProvisions', 'party')).toBe(false);
    expect(j.measure('quantity', 'lc_crew', 'rations')).toBe(0);
    expect(j.seen()).not.toContain('The road crew has the bags of food');
  }, 10000);

  it('can tell Merren to send for the crew when the buyer has died', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('knows', 'party', 'lc_drawing_risk');
    Placed.at(j, 'tallow__green');
    j.assert('struckDead', 'lc_buyer');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    expect(j.offers('Sell the buyer a drawing of the entrances')).toBe(false);
    expect(j.offers('Keep the drawing and send the buyer away')).toBe(false);
    await j.play('Into the Chandler\'s Arms', 'Keep the drawing and ask Merren to send for the crew');
    expect(j.holds('lcKept', 'party')).toBe(true);
    expect(j.holds('lcStarted', 'party')).toBe(true);
    expect(j.holds('lcCrewSummoned', 'party')).toBe(true);
    expect(j.measure('lcCrewStart', 'party')).toBe(j.measure('lcStart', 'party'));
  }, 10000);
});
