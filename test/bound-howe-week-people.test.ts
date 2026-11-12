import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';
import { Howe, R, FOUR, company } from './support/howe';

// The Bound Howe's week (data/situations/bound-howe: crisis, rival, crew and town .kyr): what moves on the ridge,
// in the towns and in the howe whether or not the company comes, and what a company can do to it. The company is four
// of level four unless said. A company is set down (Placed.at) only to skip a walk; the days are the page's own waits
// (`=day 5 09:00`), taken from a green so that no band meets a company that is not there. Seed a1: the Kin sealed it.

// Part of bound-howe-week.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 42 minutes there (Mission 20's landing).
describe('the people of the camp and the first town', () => {
  it('lets the company sign on at the cart on the green, and the foreman then lets it be', async () => {
    const j = await Howe.start(FOUR, 'a1');
    Placed.at(j, 'region__s1_green');
    await Howe.day(j, 2);
    expect(j.offers('Sign on with')).toBe(true);
    await j.play('Sign on with');
    expect(Howe.fact(j, 'foreman_hired', 'party')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('foreman'), 'party')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('sentry'), 'party')).toBe(true);
  }, 900000);

  it('has a frightened labourer who will give the pay-chest key for his wages, a thief who can pick it, and a foreman who turns on a company that carries off the torc', async () => {
    const j = await Howe.at('lee');
    j.coin(20);
    await j.play('Ask .+ what is wrong');
    expect(Howe.holds(j, 'knows', 'party', R('face_thin'))).toBe(true);
    await j.play('Pay .+ his wages');
    expect(Howe.fact(j, 'tam_paid')).toBe(true);
    expect(j.offers('Open the foreman.s pay-chest with the boy.s key')).toBe(true);
    const gold = ScreenModel.build(j.campaign).purse.coin;
    for (let i = 0; i < 4 && !Howe.state(j, 'pay_chest', 'open'); i++) { await j.play('Open the foreman.s pay-chest with the boy.s key').catch(() => ''); }
    expect(Howe.state(j, 'pay_chest', 'open')).toBe(true);
    expect(ScreenModel.build(j.campaign).purse.coin).toBeGreaterThan(gold);
    const thief = await Howe.at('lee');
    expect(thief.offers('Pick the lock of the foreman')).toBe(true);
    const k = await Howe.at('lee');
    k.assert('tolerates', R('foreman'), 'party');
    k.give(R('king_torc_item'));
    await k.play('=+1').catch(() => '');
    expect(Howe.holds(k, 'tolerates', R('foreman'), 'party')).toBe(false);
  }, 900000);

  it('shows the first town the end: a hurdle on the green after the raid, the ridge road closed after three days of dead, the keeper’s three answers', async () => {
    const j = await Howe.start(FOUR, 'a1');
    Placed.at(j, 'region__s1_green');
    Howe.set(j, 'breachDay', 'crew', 5);
    await Howe.day(j, 12, '09:00');
    expect(Howe.fact(j, 'raid_done')).toBe(true);
    expect(Howe.where(j, 'wounded')).toBe('region__s1_green');
    expect(Howe.holds(j, R('howe_overrun'), 'party')).toBe(true);
    Placed.knows(j, R('ridge_told'));
    Placed.at(j, 'region__s1_taproom');
    expect(j.offers('about the ridge road')).toBe(true);
  }, 1500000);
});

describe('what each calling sees on the ridge', () => {
  it('shows a ranger the crews’ tracks, a scholar the greeting on the lintel, a cleric the unfinished rite of the household', async () => {
    const wood = await Howe.at('ring', company('ranger'), 'a1');
    Howe.set(wood, 'rival_step', 'rcaptain', 1);
    const page = await wood.play('Wait › A while');
    expect(page).toContain('shod ponies came up the steep path');
    const lore = await Howe.at('forecourt', company('mage'), 'a1');
    await lore.play('Wait › A while').catch(() => '');
    expect(Howe.holds(lore, 'knows', 'party', R('kin_greeting'))).toBe(true);
    const priest = await Howe.at('gallery', company('cleric'), 'a1');
    priest.assert('tolerates', R('household'), 'party');
    await priest.play('Wait › A while').catch(() => '');
    expect(Howe.holds(priest, 'knows', 'party', R('closing_known'))).toBe(true);
    expect(priest.offers('Say the closing rite')).toBe(true);
  }, 900000);

  it('lets a cleric give the household the closing rite and the robbers the committal', async () => {
    const j = await Howe.at('gallery', company('cleric'), 'a1');
    j.assert('tolerates', R('household'), 'party');
    Placed.knows(j, R('closing_known'));
    for (let i = 0; i < 6 && !Howe.fact(j, 'household_laid'); i++) { await j.play('Say the closing rite').catch(() => ''); Howe.retract(j, 'assails', R('household'), 'party'); }
    expect(Howe.fact(j, 'household_laid')).toBe(true);
    expect(Howe.holds(j, 'dead', R('household'))).toBe(true);
    const k = await Howe.at('forecourt', company('cleric'), 'a1');
    expect(k.offers('Say the committal')).toBe(true);
  }, 900000);
});
