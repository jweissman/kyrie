import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang';
import { PlaySession } from '../src/session/play-session';

const campaign = 'data/adventures/tallow/long-ford.campaign.json';

describe('The ford and the hill', () => {
  it('lets the same company travel from the coach to Swallet', async () => {
    const j = await Journey.start(campaign, 'long-road');
    expect(j.at('party')).toBe('sallowfield__east_road');
    await j.play('To the Swallet road');
    expect(j.at('party')).toBe('tallow__road');
    await j.play('To Swallet lane', 'To Swallet green');
    expect(j.at('party')).toBe('tallow__green');
    expect(j.holds('lcStarted', 'party')).toBe(false);
  }, 120000);

  it('carries the defended ford into the road crew timetable without sending Wyre across the country', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To the ford stones', 'To the ford meadow', 'To Sallowfield green',
      'To the green well', 'Set a bucket line from the well to the green',
      'To Sallowfield green', 'To the ford meadow', 'To the ford stones', 'To the east road, at the ford',
      'To the Swallet road', 'To Swallet lane', 'To Swallet green', '==+230');
    expect(j.holds('befell', 'sallowfield_held')).toBe(true);
    expect(j.holds('knows', 'party', 'sallowfield_held')).toBe(false);
    await j.play('==+70');
    expect(j.holds('knows', 'party', 'sallowfield_held')).toBe(true);
    expect(j.at('picks')).toBe('sallowfield__mill_yard');
    expect(j.campaign.running).toBe(true);
    await j.play('To the Brasiers\' garden', 'To the Day-Level portal', 'To the adit',
      'To the Day-Level portal', 'To the Brasiers\' garden', 'To Swallet green',
      'Into the Chandler\'s Arms', 'Ask Merren why the road matters',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', 'Into Usk\'s store',
      'Buy › A ration', 'Buy › A ration', 'Out to Swallet green', 'Into the Chandler\'s Arms',
      'Tell Merren what happened to the drawing', 'Give two days of rations to Merren\'s repair crew',
      'Tell Merren Sallowfield still stands');
    const start = j.measure('lcCrewStart', 'party');
    await j.play(`==${start + 53}`);
    expect(j.holds('lcCrewArrived', 'party')).toBe(false);
    await j.play('==+1');
    expect(j.at('lc_crew')).toBe('tallow__taproom');
  }, 120000);

  it('brings a survivor to seek food when Sallowfield burns, and carries it home', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To the Swallet road', 'To Swallet lane', 'To Swallet green', '==+205');
    expect(j.page).not.toContain('The ford has gone. You know by the sound');
    expect(j.page).not.toContain('Over the roofs, red. The green is burning');
    await j.play('==+95');
    expect(j.holds('befell', 'sallowfield_burned')).toBe(true);
    expect(j.holds('befell', 'sallowfield_held')).toBe(false);
    expect(j.at('picks')).toBe('sallowfield__mill_yard');
    expect(j.page).not.toContain('Gil Quarmby is already on the wheel');
    expect(j.page).not.toContain('Nobody was asked. The granary door was open');
    expect(j.page).not.toContain('The helpless were in their beds when the green went up');
    expect(j.at('elland')).toBe('tallow__green');
    await j.play('Ask Tib Elland what Sallowfield needs', 'Into Usk\'s store',
      'Buy › A ration', 'Buy › A ration', 'Out to Swallet green');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give Tib two rations for Sallowfield');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 2);
    expect(j.measure('quantity', 'elland', 'rations')).toBe(2);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('==+36');
    expect(resumed.at('elland')).toBe('sallowfield__green');
    expect(resumed.holds('reliefDelivered', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'elland', 'rations')).toBe(2);
    await resumed.play('To the Brasiers\' garden', 'To the Day-Level portal', 'To the adit',
      'To the Day-Level portal', 'To the Brasiers\' garden', 'To Swallet green',
      'Into the Chandler\'s Arms', 'Ask Merren why the road matters',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms',
      'Tell Merren what happened to the drawing', 'Keep the rations for the next descent');
    expect(resumed.offers('Tell Merren Sallowfield still stands')).toBe(false);
  }, 120000);

  it('ends the whole campaign if the company falls at Sallowfield', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.roll('fail');
    await j.play('==+245', 'Draw on the picked men');
    expect(j.holds('companyBroken', 'party')).toBe(true);
    expect(Endings.reached(j.campaign.world, j.campaign.installations)?.title).toBe('The Road Ends at Sallowfield');
    expect(j.campaign.running).toBe(false);
  }, 120000);
});
