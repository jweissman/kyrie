import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Howe, R, FOUR } from './support/howe';

// The Bound Howe's week (data/situations/bound-howe: crisis, rival, crew and town .kyr): what moves on the ridge,
// in the towns and in the howe whether or not the company comes, and what a company can do to it. The company is four
// of level four unless said. A company is set down (Placed.at) only to skip a walk; the days are the page's own waits
// (`=day 5 09:00`), taken from a green so that no band meets a company that is not there. Seed a1: the Kin sealed it.

// Part of bound-howe-week.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 42 minutes there (Mission 20's landing).
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
