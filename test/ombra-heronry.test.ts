import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The Heronry and the Post's loft (data/adventures/book-of-faces/heronry.kyr): the Writ, the old heron, Mr Halloran's
// survey and the Ninth Bell on the eighth day; Old Gorrell's pigeons and the falcon on his roof. The Writ is tried at
// the Ninth Bell on the eighth day (watch 1080); a company that did nothing sees the first Weight sunk.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const to = (room: string) => `>ombra__${room}`;
const start = (seed = 'ombra', party?: Parameters<typeof Ombra.start>[2]) => Ombra.start(campaign, seed, party);
const sure = (classId: string, extra: Record<string, unknown> = {}) => [{ name: 'Rook', raceId: 'human', classId, level: 13, ...extra } as never];
// The warden's trust, then the heron freed by her and fed: no skill and no charm, a ration and some hours.
const nurse = [to('heronry_edge'), 'Ask Mistress Withy what the notice', 'Ask where the old heron is', 'Tell Mistress Withy you mean', to('reed_path'),
  'Fetch Mistress Withy', 'Offer the heron'];
const ninthBell = '=day 8 20:30';

describe('The Heronry Writ', () => {
  it('nursed: the warden frees her and a ration feeds her; the old heron stands at the Ninth Bell and the Writ holds', async () => {
    const o = await start();
    await o.play(...nurse, ninthBell);
    expect(o.holds('state', 'heron', 'hr_standing')).toBe(true);
    expect(o.at('heron')).toBe('ombra__heron_pool');
    expect(o.holds('hr_writ_held', 'party')).toBe(true);
    expect(o.holds('hr_reeds_kept', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
    expect(o.measure('marks', 'party')).toBeGreaterThanOrEqual(1);
  }, 180000);

  it('a company that does nothing sees the first Weight sunk, and the Round is not done', async () => {
    const o = await start();
    await o.play(ninthBell);
    expect(o.holds('hr_weights_sunk', 'party')).toBe(true);
    expect(o.holds('hr_reeds_sunk', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(false);
  }, 180000);

  it('a company that tried and could not do it sees the Weight sunk, and the matter is decided all the same', async () => {
    const o = await start();
    await o.play(to('heronry_edge'), 'Ask Mistress Withy what the notice', ninthBell);
    expect(o.holds('hr_weights_sunk', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
  }, 180000);

  it('read from the stone: a heron, not the heron; put to Mr Halloran at night in his hall, it lets a young bird hold the Writ, if the check comes off', async () => {
    const o = await start('ombra', sure('mage'));
    await o.play(to('heron_pool'), 'Look closely');
    expect(o.knows('hr_writ_wording')).toBe(true);
    // He is at the Exchange till the eighth morning: a bare company is answered there at night, by a man with his cowl
    // off.
    expect(o.at('halloran')).toBe('ombra__exchange_floor');
    await o.play('=day 6 21:00', to('exchange_floor'), '?Put the stone.s wording to Mr Halloran: a heron, not the heron');
    const pressed = o.holds('hr_wording_pressed', 'party');
    await o.play('=day 8 20:30');
    // A young bird holds the Writ if it was pressed; if not, the Weight is sunk: the matter is decided with the
    // company's hand in it.
    expect(o.holds('hr_writ_held', 'party')).toBe(pressed);
    expect(o.holds('hr_weights_sunk', 'party')).toBe(!pressed);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
  }, 300000);

  it('the same reading, put to him by day as one of the Heron, is a colleague\'s and costs less: it cannot fail', async () => {
    const o = await start('ombra', sure('mage'));
    await o.play(to('heron_pool'), 'Look closely', '=day 7 09:00', to('annex_counter'), 'Rent the Heron', 'Put on the Heron', to('exchange_floor'),
      'Put the stone.s wording to Mr Halloran, as one of the Heron');
    expect(o.holds('hr_wording_pressed', 'party')).toBe(true);
    expect(o.measure('goodwill', 'face_heron')).toBe(1);
    await o.play('=day 8 20:30');
    expect(o.holds('hr_writ_held', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
  }, 300000);

  it('by the pump: with the valve turned to the Row, the Weighhouse Yard dries and Halloran, told of it at his hall, takes the better site', async () => {
    const o = await start('ombra', sure('warrior'));
    await o.play(to('cistern_head'), 'light a torch', to('cistern_hall'), 'Fill a flask', to('ci_weir'), 'rope: Take', 'Put out', to('ci_slick'), to('ci_eelrun'),
      'Throw the Warden', 'light a candle', to('ci_aenean'), 'Prod it with the pole', to('pump_chamber'), 'Clear the silt', 'Prime the bearings', 'start the wheel',
      'Turn the valve-wheel', '=+40');
    expect(o.holds('ci_yard_dry', 'party')).toBe(true);
    expect(o.holds('ci_reeds_drawn', 'party')).toBe(false);
    await o.play('=day 4 21:00', to('exchange_floor'), 'Tell Mr Halloran what the Aenean pump');
    expect(o.holds('hr_bargain_struck', 'party')).toBe(true);
    await o.play('=day 8 20:30');
    expect(o.holds('hr_reeds_kept', 'party')).toBe(true);
    expect(o.holds('hr_weights_sunk', 'party')).toBe(false);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
  }, 300000);

  it('consent: after the Flood the warden asks a Bare to choose; told to let the Writ go, she does, and the Weight is sunk with her leave', async () => {
    const o = await start();
    // Halloran at night, at his hall, takes his cowl off and says what the survey is; the Heronry is ready by day.
    await o.play('=day 7 21:00', to('exchange_floor'), 'Ask Mr Halloran why he does it');
    expect(o.knows('hr_survey_known')).toBe(true);
    await o.play('=day 8 09:00', to('heronry_edge'), 'Ask Mistress Withy what the notice', 'Ask Mistress Withy about the people camped');
    expect(o.knows('hr_six_hundred')).toBe(true);
    await o.play('Tell Mistress Withy what you think the Heronry is for');
    await o.play('Tell her the Writ may go');
    expect(o.holds('hr_consent', 'party')).toBe(true);
    await o.play(ninthBell);
    expect(o.holds('hr_weights_sunk', 'party')).toBe(true);
    expect(o.holds('hr_garden_deal', 'party')).toBe(false);
    expect(o.holds('roundDone', 'party', 'r_heronry')).toBe(true);
    await o.play('=day 9 23:30');
    expect(o.page).toContain('Of the Heronry: the first Weight went in');
  }, 300000);
});

describe('The pigeon strike', () => {
  it('the falcon is seen at dawn from the loft roof, and the birds are flown at her hours: no check, no charm', async () => {
    const o = await start();
    await o.play(to('loft_roof'), '=day 2 07:00');
    expect(o.knows('hr_hawk_known')).toBe(true);
    await o.play(to('loft_floor'), '=day 2 21:00', 'Ask Old Gorrell why the birds', 'Tell Gorrell what is on his roof');
    expect(o.holds('hr_birds_fly', 'party')).toBe(true);
    expect(o.holds('hr_flight_timed', 'party')).toBe(true);
    expect(o.at('hr_hawk')).toBe('ombra__loft_roof');
  }, 180000);

  it('driven off the chimney by one who can climb: she goes to the reeds', async () => {
    const o = await start('ombra', sure('monk'));
    await o.play(to('loft_roof'), '=day 2 05:30');
    expect(o.knows('hr_hawk_known')).toBe(true);
    await o.play('Climb the ridge');
    expect(o.holds('hr_hawk_driven', 'party')).toBe(true);
    expect(o.at('hr_hawk')).toBe('ombra__offstage');
    expect(o.holds('state', 'hr_nest', 'hr_gone')).toBe(true);
  }, 180000);

  it('netted by one who knows traps: twelve coin from the falconer, and she is not wild again', async () => {
    // A check is a die; a test that wants the branch takes the first of a few seeds on which it comes off (a thief of
    // the thirteenth level, trapwork against a fair difficulty: four in five).
    let o = await start('a', sure('thief'));
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      o = await start(seed, sure('thief'));
      await o.play(to('loft_roof'), '=day 2 05:30');
      const before = o.gold();
      await o.play('Lay a noose-carpet');
      if (o.holds('hr_hawk_sold', 'party')) { expect(o.gold()).toBe(before + 12); break; }
      expect(o.at('hr_hawk')).toBe('ombra__loft_roof');
    }
    expect(o.holds('hr_hawk_sold', 'party')).toBe(true);
    expect(o.at('hr_hawk')).toBe('ombra__offstage');
  }, 240000);

  it('left alone, Gorrell sits with his pigeons through the Novena', async () => {
    const o = await start();
    await o.play('=day 9 23:30');
    expect(o.holds('hr_birds_fly', 'party')).toBe(false);
    expect(o.page).toContain('Of Old Gorrell: his pigeons did not fly');
  }, 180000);

  it('by day a bare company is turned away by the good ear; at the loft by night he talks of the boy who came at dawn', async () => {
    const o = await start();
    await o.play(to('loft_floor'), 'Speak to Old Gorrell');
    expect(o.page).toMatch(/Can.t hear a thing/);
    const night = await start();
    await night.play(to('loft_floor'), '=day 1 21:00', 'Ask Old Gorrell why the birds', 'Ask Old Gorrell if a boy came');
    expect(night.knows('pip_saw')).toBe(true);
  }, 180000);
});

describe('The Heronry: invariants', () => {
  it('walking what is offered, two hundred times, never leaves the herons or Halloran in two places', async () => {
    const o = await start('explore');
    await o.play(...nurse);
    for (let i = 0; i < 200 && o.running; i++) {
      const choices = o.j.choices().filter(c => !/^(Wait|Make camp|Take your face off|Rest|Try to rest)/.test(c.label)
        && !/Attack|Let go|Tell her the Writ|Rent/.test(c.label));
      if (!choices.length) { break; }
      const pick = choices[i % choices.length]!;
      try { await o.j.step(`^${pick.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`); } catch { continue; }
      for (const who of ['heron', 'hr_young', 'halloran', 'withy', 'garrity', 'hr_hawk']) {
        expect(o.j.campaign.world.related('at', `ombra__${who}`).length).toBeLessThanOrEqual(1);
      }
      if (o.holds('hr_writ_held', 'party')) { expect(o.holds('hr_decided', 'party')).toBe(true); }
    }
  }, 240000);

  it('the Writ, once decided, stays decided across the rest of the Novena', async () => {
    const o = await start();
    await o.play(...nurse, ninthBell);
    await o.play('=day 9 23:30');
    expect(o.holds('hr_writ_held', 'party')).toBe(true);
    expect(o.page).toContain('Of the old heron of the Heronry');
  }, 240000);
});
