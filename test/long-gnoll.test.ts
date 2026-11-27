import { describe, expect, it } from 'bun:test';
import { CombatProjection } from '../src/combat-projection';
import { Effects } from '../src/effects';
import { ItemCatalog } from '../src/item-catalog';
import { Advancement } from '../src/rules/advancement';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const reunited = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  Placed.at(j, 'tallow__lc_gnoll_shelter');
  await j.play('Ask Rill why she stays by the field', 'Share a ration with Rill',
    'Ask Rill at the shield shelter to join the company');
  j.put('lc_ferryman', 'green');
  j.put('lc_vanguard', 'calx_portal');
  j.assert('lcVanguardArrived', 'party');
  j.assert('lcRoadTold', 'party');
  j.assert('lcCellOrdered', 'party');
  j.assert('lcConvoyOrdered', 'party');
  Placed.at(j, 'tallow__tally_room');
  await j.play('Wait a while');
  await j.play(`==${j.measure('lcFactorDue', 'party')}`);
  return j;
};

describe('the shelter of the returning', () => {
  it('lets Rill join after the company shares actual food', async () => {
    const j = await Journey.start(campaign, 'rill-shelter');
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('Ask Rill why she stays by the field');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Share a ration with Rill');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    expect(j.measure('quantity', 'lc_gnoll_guide', 'rations')).toBe(1);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Ask Rill at the shield shelter to join the company');
    expect(resumed.holds('travelsWith', 'lc_gnoll_guide', 'party')).toBe(true);
    const rill = resumed.campaign.state.creatures.find(c => resumed.campaign.readout.partyIds.includes(c.id)
      && c.raceId === 'gnoll');
    expect(rill?.classId).toBe('warrior');
    expect(rill?.traits).toContain('tough');
    expect(rill?.traits).toContain('resilient');
    const defense = Effects.modifiers(CombatProjection.fighter(ItemCatalog.canon, rill!, 'fighters'));
    expect(defense.resistances?.necrotic).toBe(0.1);
    expect(defense.saves?.death).toBe(10);
    const tough = structuredClone(rill!);
    const ordinary = structuredClone(rill!);
    ordinary.traits = ordinary.traits!.filter(t => t !== 'tough');
    tough.state.experience = ordinary.state.experience = Advancement.threshold(4);
    Advancement.train(tough, 'rill-training');
    Advancement.train(ordinary, 'rill-training');
    expect(tough.base.maxHp - ordinary.base.maxHp).toBe(2);
    expect(resumed.offers('Share a ration with Rill')).toBe(false);
    await resumed.fight('To the field of the returning');
    const initiative = resumed.taken.at(-1)!.event.combat.find(e => e.type === 'initiative');
    expect(initiative?.type === 'initiative' && initiative.order.some(e => e.id === rill!.id)).toBe(true);
  }, 10000);

  it('lets the sisters stop the real food order before the purchase', async () => {
    const j = await reunited('rill-tavi-before');
    await j.play('Let Rill speak with Tavi');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Ask Tavi not to buy food for the road guard');
    expect(resumed.holds('lcFactorRefused', 'party')).toBe(true);
    expect(resumed.holds('lcFactorBought', 'party')).toBe(false);
    expect(resumed.measure('quantity', 'joss', 'rations')).toBe(2);
    expect(resumed.measure('quantity', 'lc_factor', 'gold')).toBe(3);
    await resumed.play(`==${resumed.measure('lcFactorDue', 'party')}`);
    expect(resumed.at('lc_factor')).toBe('tallow__green');
    expect(resumed.measure('quantity', 'lc_ferryman', 'gold')).toBe(3);
  }, 10000);

  it('honours Tavi’s refusal when the request finishes at the purchase deadline', async () => {
    const j = await reunited('rill-tavi-deadline');
    await j.play('Let Rill speak with Tavi', `==${j.measure('lcFactorDecisionDue', 'party') - 1}`);
    await j.play('Ask Tavi not to buy food for the road guard');
    expect(j.holds('lcFactorRefused', 'party')).toBe(true);
    expect(j.holds('lcFactorBought', 'party')).toBe(false);
    expect(j.holds('lcFactorReturning', 'party')).toBe(true);
    expect(j.measure('quantity', 'joss', 'rations')).toBe(2);
    expect(j.measure('quantity', 'lc_factor', 'gold')).toBe(3);
  }, 10000);

  it('does not undo a delivery when the sisters meet afterward', async () => {
    const j = await reunited('rill-tavi-after');
    const food = j.measure('quantity', 'lc_vanguard', 'rations');
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.holds('lcFactorDelivered', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(food + 2);
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    Placed.at(j, 'tallow__green');
    await j.play('Let Rill speak with Tavi');
    expect(j.holds('lcKinMet', 'party')).toBe(true);
    expect(j.offers('Ask Tavi not to buy food for the road guard')).toBe(false);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(food + 2);
  }, 10000);

  it('lets the reunited sisters’ actual sword strike before a fight', async () => {
    const j = await reunited('sisters-sword-glimmer');
    expect(j.holds('carries', 'party', 'lc_sisters_sword')).toBe(true);
    await j.play("the sisters' sword: Equip");
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('To the hall of angles');
    expect(j.offers("Raise the sisters' sword")).toBe(false);
    Placed.at(j, 'tallow__tally_room');
    await j.play('Let Rill speak with Tavi');
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('To the hall of angles');
    expect(j.offers("Raise the sisters' sword")).toBe(true);
    const spared = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    spared.assert('peaceable', 'lc_minotaur');
    expect(spared.offers("Raise the sisters' sword")).toBe(false);
    const before = j.watch();
    await j.fight("Raise the sisters' sword");
    const combat = j.taken.at(-1)!.event.combat;
    const strike = combat.findIndex(e => e.type === 'damage' && e.actor === 'tallow__lc_sword_glimmer'
      && e.amount >= 1 && e.amount <= 4);
    expect(strike).toBeGreaterThanOrEqual(0);
    expect(combat.findIndex(e => e.type === 'initiative')).toBeGreaterThan(strike);
    expect(j.measure('lcSwordReady', 'lc_sisters_sword')).toBe(before + 144);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(resumed.measure('lcSwordReady', 'lc_sisters_sword')).toBe(before + 144);
  }, 10000);

  it('awakens that same sword at the pointer and keeps its greater strike on resume', async () => {
    const j = await reunited('sisters-sword-radiance');
    await j.play('Let Rill speak with Tavi', "the sisters' sword: Equip");
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('To the hall of angles', 'Give the keeper two rations for passage',
      'To the room of reverse measures', 'Turn the brass pointer away from the seam',
      "Lay the sisters' sword across the brass pointer");
    expect(j.holds('lcSwordAwakened', 'lc_sisters_sword')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(resumed.holds('carries', 'party', 'lc_sisters_sword')).toBe(true);
    expect(resumed.holds('lcSwordAwakened', 'lc_sisters_sword')).toBe(true);
    await resumed.play("the sisters' sword: Give to Bran");
    Placed.at(resumed, 'tallow__lc_ring');
    resumed.assert('lcMeasuresSolved', 'party');
    await resumed.play('Wait a while', 'To the scorched walk');
    expect(resumed.offers("Raise the sisters' sword")).toBe(false);
    await resumed.play("the sisters' sword: Equip");
    await resumed.fight("Raise the sisters' sword");
    const combat = resumed.taken.at(-1)!.event.combat;
    const strike = combat.findIndex(e => e.type === 'damage' && e.actor === 'tallow__lc_sword_radiance'
      && e.amount >= 2 && e.amount <= 12);
    expect(strike).toBeGreaterThanOrEqual(0);
    expect(combat.findIndex(e => e.type === 'initiative')).toBeGreaterThan(strike);
  }, 10000);
});
