import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const meeting = async (seed = 2) => {
  const j = await Journey.start(campaign, `cell-approach-${seed}`);
  j.assert('lcRoadTold', 'party');
  j.assert('lcVanguardArrived', 'party');
  j.assert('knows', 'party', 'lc_cell_route');
  j.put('lc_vanguard', 'calx_portal');
  Placed.at(j, 'tallow__west_end');
  await j.play('==+7');
  expect(j.holds('lc_cell_kind', 'lc_cult')).toBe(true);
  expect(j.at('lc_cell')).toBe('tallow__west_end');
  expect(j.taken.at(-1)?.page).toContain('Nella one');
  return j;
};

describe('the counting circle ledger', () => {
  it('can reach the circle from the green after learning about its delivery', async () => {
    const j = await Journey.start(campaign, 'cell-approach-2');
    Placed.at(j, 'tallow__green');
    j.put('lc_ferryman', 'tallow__green');
    j.assert('lcTermsHeard', 'party');
    j.assert('been', 'party', 'calx_way');
    j.assert('knows', 'party', 'lc_enemy_news');
    await j.play('Tell the Ferryman the road runs through the hill', 'Into the Chandler\'s Arms',
      'Ask Merren who feeds the road guard', 'Out to Swallet green', 'To Swallet lane', 'To the west road\'s end');
    expect(j.at('lc_cell')).toBe('tallow__west_end');
    expect(j.offers('Question Nella\'s entry in the book')).toBe(true);
    await j.play('Question Nella\'s entry in the book', 'To Nella\'s croft', 'Ask Nella what she knows of the hill');
    expect(j.holds('lcNellaRepaid', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_ring_known')).toBe(true);
  }, 10000);

  it('lets a reader identify the duplicated receipt and divert the food', async () => {
    const j = await meeting();
    const food = j.measure('quantity', 'lc_cell', 'rations');
    await j.play('Question Nella\'s entry in the book');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('To Nella\'s croft');
    expect(resumed.holds('lcCellDiverted', 'party')).toBe(true);
    expect(resumed.holds('lcCellDelivered', 'party')).toBe(false);
    expect(resumed.holds('lcNellaRepaid', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'lc_cell', 'rations')).toBe(food - 1);
    expect(resumed.measure('quantity', 'lc_nella', 'rations')).toBe(1);
    expect(resumed.offers('Challenge the counting circle\'s account')).toBe(false);
    await resumed.play('Ask Nella what she knows of the hill');
    expect(resumed.holds('knows', 'party', 'lc_ring_known')).toBe(true);
  }, 10000);

  it('lets a cleric actually cure Nella after the sack cuts her hand', async () => {
    const j = await meeting(6);
    await j.play('Question Nella\'s entry in the book', 'To Nella\'s croft');
    const nella = () => j.campaign.readout.creatures.find(c => c.id.startsWith('tallow__lc_nella_person'))!;
    const dori = () => j.campaign.readout.creatures.find(c => c.id === 'tallow__party_3')!;
    const hp = nella().state.hp, slots = JSON.stringify(dori().state.ready);
    expect(hp).toBeLessThan(nella().base.maxHp);
    await j.play('Have Dori cast Cure on Nella');
    expect(nella().state.hp).toBeGreaterThan(hp);
    expect(JSON.stringify(dori().state.ready)).not.toBe(slots);
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'heal' && e.target === nella().id)).toBe(true);
    const saved = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(saved.campaign.readout.creatures.find(c => c.id === nella().id)!.state.hp).toBe(nella().state.hp);
  }, 10000);

  it('offers the lesser healing cantrip when Cure is not ready', async () => {
    const j = await meeting();
    await j.play('Question Nella\'s entry in the book', 'To Nella\'s croft');
    expect(j.holds('lcNellaCut', 'party')).toBe(true);
    expect(j.offers('Have Dori cast Cure on Nella')).toBe(false);
    expect(j.offers('Ask Nella what she knows of the hill')).toBe(true);
    const nella = () => j.campaign.readout.creatures.find(c => c.id.startsWith('tallow__lc_nella_person'))!;
    const before = nella().state.hp;
    await j.play('Have Dori cast Cure Minor Wounds on Nella');
    expect(nella().state.hp).toBe(before + 1);
    expect(j.offers('Have Dori cast Cure Minor Wounds on Nella')).toBe(false);
  }, 10000);

  it('does not deliver food to Nella if she cannot receive it', async () => {
    const j = await meeting();
    const food = j.measure('quantity', 'lc_cell', 'rations');
    j.assert('struckDead', 'lc_nella');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    await j.play('Question Nella\'s entry in the book', '==+4');
    expect(j.holds('lcNellaRepaid', 'party')).toBe(false);
    expect(j.measure('quantity', 'lc_nella', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(food);
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
  }, 10000);

  it('does not return the food if the circle falls on the way', async () => {
    const j = await meeting();
    const food = j.measure('quantity', 'lc_cell', 'rations');
    await j.play('Question Nella\'s entry in the book');
    j.assert('struckDead', 'lc_cell');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('==+4');
    expect(j.holds('lcNellaRepaid', 'party')).toBe(false);
    expect(j.measure('quantity', 'lc_nella', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(food);
    expect(j.at('lc_cell')).not.toBe('tallow__lc_nella_croft');
  }, 10000);

  for (const name of ['Dym', 'Teal']) {
    it(`lets a wrong accusation against ${name} stand while the food reaches the guard`, async () => {
      const j = await meeting();
      const before = j.measure('quantity', 'lc_vanguard', 'rations');
      const food = j.measure('quantity', 'lc_cell', 'rations');
      await j.play(`Question ${name}'s entry in the book`, '==+4');
      expect(j.offers('Question Nella\'s entry in the book')).toBe(false);
      expect(j.holds('lcCellDiverted', 'party')).toBe(false);
      expect(j.holds('lcCellDelivered', 'party')).toBe(true);
      expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(before + food);
    }, 10000);
  }
});
