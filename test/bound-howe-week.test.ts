import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';
import { Howe, R, FOUR, company } from './support/howe';

// The Bound Howe's week (data/situations/bound-howe: crisis, rival, crew and town .kyr): what moves on the ridge,
// in the towns and in the howe whether or not the company comes, and what a company can do to it. The company is four
// of level four unless said. A company is set down (Placed.at) only to skip a walk; the days are the page's own waits
// (`=day 5 09:00`), taken from a green so that no band meets a company that is not there. Seed a1: the Kin sealed it.

describe('the week: four parties move on the ridge whether or not the company comes', () => {
  it('runs the licence-men, the second company, the levy, the dead and the notices by the clock with no one on the ridge (a1: the Kin sealed it)', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(company('warrior'), 'a1');
    const B = Howe.num(j, 'breachDay', 'crew'), A = Howe.num(j, 'rivalDay', 'crew');
    expect(B).toBeGreaterThanOrEqual(6); expect(B).toBeLessThanOrEqual(8);
    expect(A).toBeGreaterThanOrEqual(4); expect(A).toBeLessThanOrEqual(6);
    // Day one: a sound face, no rival, no levy, the howe shut.
    expect(Howe.face(j)).toBe('sound');
    expect(Howe.where(j, 'rcaptain')).toBeFalsy();
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    expect(Howe.fact(j, 'host_stirs')).toBe(false);
    Placed.at(j, T('green'));
    await Howe.day(j, 3);
    expect(Howe.where(j, 'levy_men')).toBe(T('green'));
    // The second company arrives on its day, and goes to the door on the next.
    await Howe.day(j, A);
    expect(Howe.where(j, 'rcaptain')).toBe(R('rival_camp'));
    expect(Howe.num(j, 'rival_step', 'rcaptain')).toBe(1);
    await Howe.day(j, A + 1, '15:00');
    expect(Howe.where(j, 'rhands')).toBe(R('forecourt'));
    // The licence-men's face goes thin two days before it breaks.
    await Howe.day(j, B - 2, '12:00');
    expect(Howe.face(j)).toBe('thin');
    // The ram goes in two days after the company's arrival: the seal is forced and the dead are stirred.
    await Howe.day(j, A + 2, '15:00');
    expect(Howe.state(j, 'seal', 'forced')).toBe(true);
    expect(Howe.fact(j, 'host_stirs')).toBe(true);
    expect(Howe.num(j, 'rival_step', 'rcaptain')).toBeGreaterThanOrEqual(3);
    // The face breaks on its day, and on the first dark the riders raid the camp: the crew goes to the town.
    await Howe.day(j, B, '12:00');
    expect(Howe.face(j)).toBe('broken');
    await Howe.day(j, B, '23:30');
    expect(Howe.fact(j, 'raid_done')).toBe(true);
    expect(Howe.where(j, 'foreman')).toBe(T('taproom'));
    expect(Howe.holds(j, 'dead', R('watchers'))).toBe(true);
    // Three days of an open howe, and the dead walk down to the town: the country shows it.
    await Howe.day(j, B + 3, '23:30');
    expect(Howe.fact(j, 'host_abroad')).toBe(true);
    expect(Howe.where(j, 'household')).toBe(T('green'));
    expect(Howe.holds(j, R('howe_overrun'), 'party')).toBe(true);
    expect(Howe.holds(j, 'dead', R('levy_men'))).toBe(true);
  }, 1500000);

  it('lets a company both breach the door and break the face: the second company by its ram, the player by a shoulder, the licence-men by the clock, the player by a pick', async () => {
    const player = await Howe.at('forecourt', FOUR, 'a1');
    expect(Howe.state(player, 'seal', 'set')).toBe(true);
    await player.play('Put your shoulders to the seal-stone');
    expect(Howe.state(player, 'seal', 'forced')).toBe(true);
    await player.play('=+1').catch(() => '');
    expect(Howe.fact(player, 'host_stirs')).toBe(true);
    // The face is broken by the player as well as by the crew.
    const dig = await Howe.at('face', FOUR, 'a1');
    dig.assert('state', R('face_wall'), R('thin'));
    expect(dig.offers('Break the last course of the face')).toBe(true);
    await dig.play('Break the last course of the face');
    expect(Howe.face(dig)).toBe('broken');
    await dig.play('=+1').catch(() => '');
    expect(Howe.fact(dig, 'host_stirs')).toBe(true);
  }, 600000);

  it('lets the second company arrive, force the door and be beaten at the gallery or on the flutes, or take the torc when it is shown the way (the player allies)', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    const A = Howe.num(j, 'rivalDay', 'crew');
    Howe.set(j, 'breachDay', 'crew', 30);
    Placed.at(j, T('green'));
    await Howe.day(j, A, '10:00');
    Placed.at(j, R('rival_camp'));
    expect(Howe.where(j, 'rcaptain')).toBe(R('rival_camp'));
    Placed.knows(j, R('king_named')); Placed.knows(j, R('stave_known'));
    expect(j.offers('Sell .+ the roll of kings')).toBe(true);
    const coin = ScreenModel.build(j.campaign).purse.coin;
    await j.play('Sell .+ the roll of kings');
    expect(ScreenModel.build(j.campaign).purse.coin).toBe(coin + 60);
    expect(Howe.holds(j, 'tolerates', R('household'), R('rcaptain'))).toBe(true);
    const kin = ['low', 'mid', 'high'].find(f => Howe.fact(j, 'kinflute', R(`flute_${f}`)))!;
    await j.play(`Tell .+ the king's flute is the ${kin === 'mid' ? 'middle' : kin} one`);
    Placed.at(j, T('green'));
    await Howe.day(j, A + 5, '20:00');
    // The ram, the gallery (the household lets them by), the right flute, the king: the rival's hands die for it.
    expect(Howe.state(j, 'seal', 'forced')).toBe(true);
    expect(Howe.num(j, 'rival_step', 'rcaptain')).toBeGreaterThanOrEqual(6);
    expect(Howe.holds(j, 'dead', R('rhands'))).toBe(true);
    expect(Howe.holds(j, 'dead', R('rscout'))).toBe(true);
    expect(Howe.state(j, 'tread', 'sprung')).toBe(true);
    expect(Howe.holds(j, 'at', R('king_torc_item'), R('rival_camp'))).toBe(true);
    // And they go, with it, two days after.
    await Howe.day(j, A + 8, '10:00');
    expect(Howe.where(j, 'rcaptain')).toBeFalsy();
    expect(Howe.holds(j, R('ridge_sacked'))).toBe(true);
    expect(Howe.fact(j, 'host_stirs')).toBe(true);
  }, 1500000);

  it('lets the player deceive the second company: the wrong flute is told, and the reader falls to it', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    const A = Howe.num(j, 'rivalDay', 'crew');
    Howe.set(j, 'breachDay', 'crew', 30);
    Placed.at(j, T('green'));
    await Howe.day(j, A, '10:00');
    Placed.at(j, R('rival_camp'));
    Placed.knows(j, R('king_named')); Placed.knows(j, R('stave_known'));
    const wrong = ['low', 'mid', 'high'].find(f => !Howe.fact(j, 'kinflute', R(`flute_${f}`)))!;
    await j.play('Sell .+ the roll of kings');
    await j.play(`Tell .+ the king's flute is the ${wrong === 'mid' ? 'middle' : wrong} one`);
    Placed.at(j, T('green'));
    await Howe.day(j, A + 5, '20:00');
    expect(Howe.holds(j, 'dead', R('rscholar'))).toBe(true);
    expect(Howe.num(j, 'rival_step', 'rcaptain')).toBe(8);
    expect(Howe.holds(j, 'dead', R('rhands'))).toBe(false);
    expect(Howe.holds(j, 'at', R('king_torc_item'), R('throne'))).toBe(true);
  }, 1500000);

  it('lets the player sabotage the second company’s ram (a thief at night; its door is two days late) and read the patron’s letter in its strongbox', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    const A = Howe.num(j, 'rivalDay', 'crew');
    Howe.set(j, 'breachDay', 'crew', 30);
    Placed.at(j, T('green'));
    await Howe.day(j, A, '10:00');
    Placed.at(j, R('rival_camp'));
    for (const who of ['rcaptain', 'rhands', 'rscout', 'rscholar']) { j.assert('tolerates', R(who), 'party'); }
    expect(j.offers('Split the iron shoe of the ram')).toBe(true);
    for (let i = 0; i < 6 && !Howe.fact(j, 'ram_spoiled'); i++) { await j.play('Split the iron shoe of the ram').catch(() => ''); Howe.retract(j, 'assails', R('rscout'), 'party'); Placed.at(j, R('rival_camp')); }
    expect(Howe.fact(j, 'ram_spoiled')).toBe(true);
    expect(Howe.num(j, 'ramDelay', 'crew')).toBe(2);
    expect(j.offers('Pick the lock of the captain')).toBe(true);
    for (let i = 0; i < 8 && !Howe.state(j, 'rival_chest', 'open'); i++) { await j.play('Pick the lock of the captain').catch(() => ''); Howe.retract(j, 'assails', R('rscout'), 'party'); Placed.at(j, R('rival_camp')); }
    expect(Howe.state(j, 'rival_chest', 'open')).toBe(true);
    Placed.at(j, T('green'));
    await Howe.day(j, A + 2, '20:00');
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    await Howe.day(j, A + 4, '20:00');
    expect(Howe.state(j, 'seal', 'forced')).toBe(true);
  }, 1500000);

  it('lets the player turn the second company: shown its patron’s seal, the captain strikes camp, and the foreman pays the forty she promised', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    const A = Howe.num(j, 'rivalDay', 'crew');
    Howe.set(j, 'breachDay', 'crew', 30);
    Placed.at(j, T('green'));
    await Howe.day(j, A, '10:00');
    Placed.at(j, R('rival_camp'));
    for (const who of ['rcaptain', 'rhands', 'rscout', 'rscholar']) { j.assert('tolerates', R(who), 'party'); }
    Placed.knows(j, R('rival_aim'));
    j.give(R('patron_letter'));
    for (let i = 0; i < 5 && !Howe.fact(j, 'turned_rival'); i++) { await j.play('Show .+ the shire-reeve.s seal').catch(() => ''); }
    expect(Howe.fact(j, 'turned_rival')).toBe(true);
    expect(Howe.num(j, 'rival_step', 'rcaptain')).toBe(9);
    await Howe.day(j, A + 3, '10:00');
    expect(Howe.where(j, 'rcaptain')).toBeFalsy();
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    // The foreman, hired to keep her off the hill, pays.
    const k = await Howe.at('lee');
    k.assert('foreman_hired', 'party');
    k.assert('turned_rival');
    expect(k.offers('Ask .+ for the forty')).toBe(true);
    const coin = ScreenModel.build(k.campaign).purse.coin;
    await k.play('Ask .+ for the forty');
    expect(ScreenModel.build(k.campaign).purse.coin).toBe(coin + 40);
  }, 1500000);
});

describe('the levy, the clerk, the warden and the priest', () => {
  it('turns the levy against the diggers when the clerk is shown the reeve’s seal: it marches with salt, buries the face and sends the crew to the taproom', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    Placed.at(j, T('green'));
    j.give(R('patron_letter'));
    expect(j.offers('Show .+ the patron')).toBe(true);
    await j.play('Show .+ the patron');
    expect(Howe.fact(j, 'levy_against')).toBe(true);
    const B = Howe.num(j, 'breachDay', 'crew');
    await Howe.day(j, B - 1, '12:00');
    expect(Howe.fact(j, 'levy_marched')).toBe(true);
    expect(Howe.where(j, 'levy_men')).toBe(R('trench'));
    expect(Howe.face(j)).toBe('buried');
    expect(Howe.where(j, 'foreman')).toBe(T('taproom'));
    await Howe.day(j, B + 1, '23:30');
    expect(Howe.fact(j, 'raid_done')).toBe(false);
  }, 1500000);

  it('lets the priest be told what the cutting will let out, and the warden be asked to walk down to the town, and costs her hearth', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    Placed.at(j, T('shrine'));
    Placed.knows(j, R('face_thin')); Placed.knows(j, R('torc_price'));
    await j.play('what the cutting will let out');
    expect(Howe.fact(j, 'levy_against')).toBe(true);
    const k = await Howe.at('hearth', FOUR, 'a1');
    Placed.knows(k, R('warden_lore'));
    k.assert(R('trusted'), R('warden'), 'party');
    await k.play('come down and speak for the howe');
    expect(Howe.fact(k, 'levy_against')).toBe(true);
    expect(Howe.where(k, 'warden')).toBe(T('shrine'));
    expect(Howe.holds(k, 'restful', R('hearth'))).toBe(false);
  }, 600000);
});

describe('the cutting, the breach, the flood, and the reset', () => {
  it('lets the face be wedged, which the diggers undo in three days, or brought down on itself, which they cannot', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.at('lee', FOUR, 'a1');
    j.coin(40);
    await j.play('for the freedom of the camp');
    await Howe.buy(j, 'Iron spikes');
    Placed.at(j, R('face'));
    j.assert('state', R('face_wall'), R('thin'));
    Howe.set(j, 'breachDay', 'crew', 30);
    expect(j.offers('Wedge the face')).toBe(true);
    await j.play('Wedge the face');
    expect(Howe.face(j)).toBe('shored');
    Placed.at(j, T('green'));
    const d = Howe.num(j, 'rivalDay', 'crew') + 4;
    await Howe.day(j, d, '09:00');
    expect(Howe.face(j)).toBe('thin');
    const k = await Howe.at('face', FOUR, 'a1');
    k.assert('state', R('face_wall'), R('thin'));
    expect(k.offers('Pull down the props')).toBe(true);
    await k.play('Pull down the props');
    expect(Howe.face(k)).toBe('buried');
  }, 900000);

  it('lights the horse-hall by the breach by day, floods the second way in on the third day after it, and lets the weir’s stopcock drain it again', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.start(FOUR, 'a1');
    j.assert('state', R('face_wall'), R('broken'));
    Placed.at(j, T('green'));
    await Howe.day(j, 3, '09:00');
    const B = Howe.num(j, 'breachDay', 'crew');
    Howe.set(j, 'stirDay', 'crew', 3);
    await Howe.day(j, 4, '09:00');
    expect(Howe.state(j, 'lower', 'wet')).toBe(true);
    await Howe.day(j, 6, '09:00');
    expect(Howe.state(j, 'lower', 'flooded')).toBe(true);
    expect(Howe.holds(j, 'unlit', R('horses'))).toBe(false);
    Placed.at(j, R('weir'));
    await Howe.torch(j);
    expect(j.offers('Wind the stopcock shut')).toBe(true);
    await j.play('Wind the stopcock shut');
    await j.play('=+1').catch(() => '');
    expect(Howe.state(j, 'lower', 'dry')).toBe(true);
    expect(B).toBeGreaterThan(0);
  }, 1500000);

  it('resets the tread when the seal is heaved home behind a company that sprang it', async () => {
    const j = await Howe.at('forecourt', FOUR, 'a1');
    j.assert('state', R('tread'), R('sprung'));
    j.assert('state', R('seal'), R('forced'));
    await j.play('Heave the seal-stone back into its groove');
    await j.play('=+1').catch(() => '');
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    expect(Howe.state(j, 'tread', 'armed')).toBe(true);
    // And the ground is sealed again: the dead settle.
    expect(Howe.holds(j, R('ridge_sealed'))).toBe(true);
    expect(Howe.fact(j, 'host_stirs')).toBe(false);
  }, 600000);

  it('raids the camp on the first dark after the breach, with the company in it', async () => {
    const T = await Howe.town('a1');
    const j = await Howe.at('lee', FOUR, 'a1');
    j.coin(40);
    await j.play('for the freedom of the camp');
    j.assert('state', R('face_wall'), R('broken'));
    await j.play('Wait › Until dark');
    expect(Howe.fact(j, 'raid_done')).toBe(true);
    expect(Howe.where(j, 'riders')).toBe(R('lee'));
    expect(Howe.where(j, 'foreman')).toBe(T('taproom'));
    // The riders came to the camp the company was in, and it met them (they are down, or it is hurt).
    const met = Howe.holds(j, 'dead', R('riders')) || Howe.holds(j, 'assails', R('riders'), 'party') || Howe.downed(j) > 0
      || Howe.hp(j) < Howe.party(j).reduce((n, f) => n + f.maxHp, 0);
    expect(met).toBe(true);
  }, 600000);
});

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

