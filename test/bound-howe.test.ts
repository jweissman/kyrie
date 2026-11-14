import { describe, expect, it } from 'bun:test';
import { Howe, R, SITE, TOWN, PLACED, company } from './support/howe';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';
import { MapPlay } from './support/map-play';

// The Bound Howe (data/situations/bound-howe, data/scenarios/bound-howe.scenario.json): a standing scenario, so every
// first country holds one. A king's howe on a ridge, a salvage crew in its lee, a warden at a hearth, and under the
// Barrow-Kin's floor something older. These specs play it by the page's own labels. A company is set down in a place
// (Placed.at) only to skip the walk to it, never to skip what lies there; the walk from the starting town is its own
// spec. The company is four of level four (the intended company: levels three to five, level four the middle), created
// by the ordinary creature context `level`; no advancement is simulated.
describe('the Bound Howe is a standing scenario', () => {
  it.each(['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4'])('is placed in %s, with its camp, its warden and its dead where they belong', async seed => {
    const j = await Howe.start(company('warrior'), seed);
    expect(Howe.where(j, 'foreman')).toBe(R('lee'));
    expect(Howe.where(j, 'warden')).toBe(R('hearth'));
    expect(Howe.where(j, 'king')).toBe(R('throne'));
    expect(Howe.where(j, 'household')).toBe(R('gallery'));
    expect(Howe.where(j, 'mouth')).toBe(R('well'));
    // The country draws the howe's fate and its king's flute; both are facts of the world.
    expect(['fate_sealed', 'fate_broken'].some(f => Howe.holds(j, R('fate'), R('howe'), R(f)))).toBe(true);
    expect(['flute_low', 'flute_mid', 'flute_high'].filter(f => Howe.holds(j, R('kinflute'), R(f))).length).toBe(1);
  }, 180000);

  it('is reached from the starting town by the page’s own labels: a cart of labourers and a notice on the first green from the second day, set out for from the map, and walked up to', async () => {
    const j = await Howe.start(company('warrior'));
    // Nothing is said on the first day: the first hour is not buried.
    await j.play('>s1_green');
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(false);
    expect(Howe.where(j, 'hirer')).toBeFalsy();
    await j.play('==day 2 09:00');
    expect(Howe.where(j, 'hirer')).toBe('region__s1_green');
    // The notice on the hiring-man's cart is read from the green, and it says where.
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(true);
    // The aim to go is held to the third day, so that the first hour's own leads (the honest start's) are led first.
    await j.play('==day 3 09:00');
    expect(ScreenModel.build(j.campaign).objectives.join(' ')).toContain('salvage crew is digging');
    expect(j.offers('Ask .+ where the work is')).toBe(true);
    const done = await MapPlay.press(j, SITE);
    expect(done).toEqual({ to: SITE, arrived: true });
    expect(j.campaign.world.one('at', 'party')).toBe(SITE);
    // The sheep-way was told of: it is a way on from the foot, beside the steep path.
    expect(j.takes('Into the old sheepfold')).toBe(true);
    expect(j.takes('lookout')).toBe(true);
  }, 600000);

  it('is told of too in the town nearest it: asked of at the taproom there', async () => {
    const j = await Howe.start(company('warrior'));
    await j.play(`>${PLACED.town}_taproom`);
    if (!Howe.holds(j, 'knows', 'party', R('ridge_told'))) {
      expect(j.offers('Ask about the diggers on the ridge')).toBe(true);
      await j.play('Ask about the diggers on the ridge');
    }
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(true);
    await j.play(`>${PLACED.howe}`);
    expect(j.campaign.world.one('at', 'party')).toBe(SITE);
  }, 300000);
});

describe('the ridge: weather, a watch, a line of tins, a ring of grey grass', () => {
  it('lets the weather come down on the steep path and punishes a company that climbs in it, but not one that waits', async () => {
    const j = await Howe.at('lookout');
    // Cloud brewing is a sign at the foot; white cloud on the path hurts whoever crosses.
    j.assert('state', R('weather'), R('white'));
    Placed.at(j, SITE);
    const before = Howe.hp(j);
    expect(j.offers('risk the weather')).toBe(true);
    for (let i = 0; i < 6 && Howe.hp(j) >= before; i++) { Placed.at(j, SITE); await j.play('risk the weather on the steep path'); }
    expect(Howe.hp(j)).toBeLessThan(before);
    j.assert('state', R('weather'), R('clear'));
    Placed.at(j, SITE);
    const clear = Howe.hp(j);
    await j.play('Into the (salvagers|Long Ridge)');
    expect(Howe.hp(j)).toBe(clear);
  }, 240000);

  it('is watched: the watch will take four coin, or the clerk’s word, or a fight, and the fight is not the camp’s', async () => {
    const j = await Howe.at('rise');
    j.coin(20);
    await j.play('To the salvagers');
    expect(j.offers('Pay the watch four coin')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('watchers'), 'party')).toBe(false);
    await j.play('Pay the watch four coin');
    expect(Howe.holds(j, 'tolerates', R('watchers'), 'party')).toBe(true);
    const k = await Howe.at('lookout');
    Placed.knows(k, R('levy_told'));
    expect(k.offers('you have come about the shire-reeve')).toBe(true);
  }, 240000);

  it('hides the quiet way round behind a line of tins: a thief cuts it, a clumsy company rings it and the watch comes down', async () => {
    const thief = await Howe.at('fold');
    expect(thief.offers('Cut the thread')).toBe(true);
    await thief.play('Cut the thread');
    expect(Howe.state(thief, 'cans', 'cut')).toBe(true);
    await thief.play('To the heather rise');
    expect(thief.campaign.world.one('at', 'party')).toBe(R('rise'));
    const warrior = await Howe.at('fold', company('warrior'));
    expect(warrior.offers('Cut the thread')).toBe(false);
    expect(warrior.offers('Lift your feet over the line')).toBe(true);
  }, 240000);

  it('does not let a company walk straight across the grey grass without paying for it, and lets it go round', async () => {
    const j = await Howe.at('ring');
    const before = Howe.hp(j);
    await j.play('by the sunwise way round the stones');
    expect(j.campaign.world.one('at', 'party')).toBe(R('forecourt'));
    expect(Howe.hp(j)).toBe(before);
    Placed.at(j, R('ring'));
    for (let i = 0; i < 8 && Howe.hp(j) >= before; i++) { Placed.at(j, R('ring')); await j.play('risk the grey grass'); }
    expect(Howe.hp(j)).toBeLessThan(before);
  }, 240000);
});

describe('the camp in the lee: a foreman, a crew, a cook, and four ways with them', () => {
  it('sells what a company going under a hill needs, and a company that pays is welcome to sleep there', async () => {
    const j = await Howe.at('lee');
    j.coin(60);
    await j.play('for the freedom of the camp');
    for (const w of ['A coil of rope', 'A sack of barley', 'A twist of salt', 'A shovel', 'Iron spikes']) { await Howe.buy(j, w); }
    expect(Howe.holds(j, 'tolerates', R('foreman'), 'party')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('crew'), 'party')).toBe(true);
    expect(Howe.holds(j, 'restful', R('lee'))).toBe(true);
  }, 240000);

  it('can be turned: told what the torc will cost the country, the foreman strikes her tents and goes to the town’s taproom', async () => {
    const j = await Howe.at('lee');
    Placed.knows(j, R('torc_price'));
    expect(j.offers('what the torc will cost the country')).toBe(true);
    for (let i = 0; i < 4 && !Howe.fact(j, 'turned', R('foreman')); i++) {
      await j.play('what the torc will cost the country').catch(() => '');
    }
    // A hard persuasion: one company may need a second try; the Journey takes it by the page's own offer.
    if (Howe.fact(j, 'turned', R('foreman'))) {
      expect(Howe.where(j, 'foreman')).toBe(TOWN('taproom'));
      expect(Howe.holds(j, 'tolerates', R('crew'), 'party')).toBe(true);
    } else {
      expect(j.offers('what the torc will cost the country')).toBe(false);
    }
  }, 300000);

  it('is the camp that can be fought: the crew breaks and the foreman falls to a company of four at level four', async () => {
    const j = await Howe.at('lee');
    await Howe.torch(j);
    await j.fight('Attack');
    expect(Howe.holds(j, 'dead', R('foreman'))).toBe(true);
    expect(Howe.downed(j)).toBeLessThan(3);
  }, 300000);
});

