import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { HoweAlone } from './support/howe-alone';
import { ScreenModel } from '../src/ui/screen-model';
import { HoweReading as Howe, R, FOUR, company } from './support/howe-reading';

// The Bound Howe's week (data/situations/bound-howe: crisis, rival, crew and town .kyr): what moves on the ridge,
// in the towns and in the howe whether or not the company comes, and what a company can do to it. The company is four
// of level four unless said. A company is set down (Placed.at) only to skip a walk; the days are the page's own waits
// (`=day 5 09:00`), taken from a green so that no band meets a company that is not there. The situation alone (see
// HoweAlone: its own module on a host of a few lines, about 0.2 s a start where each case drew a1's country), on a
// seed whose draw sealed the howe from within, as a1's did; the town is the host's (`T`).

describe('the week: four parties move on the ridge whether or not the company comes', () => {
  it('runs the licence-men, the second company, the levy, the dead and the notices by the clock with no one on the ridge (a1: the Kin sealed it)', async () => {
    const T = HoweAlone.town;
    const j = await HoweAlone.start(company('warrior'));
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
    const player = await HoweAlone.at('forecourt', FOUR);
    expect(Howe.state(player, 'seal', 'set')).toBe(true);
    await player.play('Put your shoulders to the seal-stone');
    expect(Howe.state(player, 'seal', 'forced')).toBe(true);
    await player.play('=+1').catch(() => '');
    expect(Howe.fact(player, 'host_stirs')).toBe(true);
    // The face is broken by the player as well as by the crew.
    const dig = await HoweAlone.at('face', FOUR);
    dig.assert('state', R('face_wall'), R('thin'));
    expect(dig.offers('Break the last course of the face')).toBe(true);
    await dig.play('Break the last course of the face');
    expect(Howe.face(dig)).toBe('broken');
    await dig.play('=+1').catch(() => '');
    expect(Howe.fact(dig, 'host_stirs')).toBe(true);
  }, 600000);

  it('lets the second company arrive, force the door and be beaten at the gallery or on the flutes, or take the torc when it is shown the way (the player allies)', async () => {
    const T = HoweAlone.town;
    const j = await HoweAlone.start(FOUR);
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
    const T = HoweAlone.town;
    const j = await HoweAlone.start(FOUR);
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
    const T = HoweAlone.town;
    const j = await HoweAlone.start(FOUR);
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
    const T = HoweAlone.town;
    const j = await HoweAlone.start(FOUR);
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
    const k = await HoweAlone.at('lee');
    k.assert('foreman_hired', 'party');
    k.assert('turned_rival');
    expect(k.offers('Ask .+ for the forty')).toBe(true);
    const coin = ScreenModel.build(k.campaign).purse.coin;
    await k.play('Ask .+ for the forty');
    expect(ScreenModel.build(k.campaign).purse.coin).toBe(coin + 40);
  }, 1500000);
});
