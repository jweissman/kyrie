import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The cisterns under the Drip (data/adventures/book-of-faces/cisterns.kyr): Pip and the lamp-boys, the Ninefold Drain
// to the cellar under the Urn Hall, the Aenean pump and the Flood. Played by the labels a player sees. The campaign is
// the book's own; OMBRA_CAMPAIGN names another (an author's scratch campaign with stand-ins for people in files not
// yet merged). The company arrives at eight on the first morning (watch 0); day n begins at watch (n - 1) * 144; the
// Ninth Bell is at watch 72 of the day, and `=21:00` waits for it.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const to = (room: string) => `>ombra__${room}`;
const start = (seed = 'ombra', party?: Parameters<typeof Ombra.start>[2]) => Ombra.start(campaign, seed, party);
// A company of the thirteenth level (a check is a die: its odds are the best a test can ask, and a test that needs the
// branch tries a few seeds).
const sure = (classId: string, background?: string) => [{ name: 'Rook', raceId: 'human', classId, level: 13, ...background ? { backgroundId: background } : {} } as never];
// Down to the den, food left, and the Ninth Bell waited out: Pip's talk by night.
const den = ['Leave a ration', '=21:00'];

describe('The cisterns: Pip', () => {
  it('coaxed by food and a question: he is asked what he wants, is given a candle, and tells it by degrees', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), ...den);
    expect(o.knows('ci_boys_found')).toBe(true);
    // Before he has been asked, the evidence does nothing to him: that is the point of him.
    await o.play('Ask the boy his name');
    expect(o.knows('ci_pip_named')).toBe(true);
    expect(o.holds('ci_asked', 'party')).toBe(false);
    await o.play('Ask him what he wants');
    expect(o.holds('ci_asked', 'party')).toBe(true);
    expect(o.knows('ci_pip_wish')).toBe(true);
    await o.play('Give him a candle');
    expect(o.holds('ci_candle', 'party')).toBe(true);
    await o.play('Ask what he saw', 'Ask who else came');
    expect(o.knows('pip_saw')).toBe(true);
    expect(o.knows('serene_saw')).toBe(true);
    expect(o.knows('ci_pip_clerk')).toBe(true);
    // The third thing is the name, which he will not say to somebody: he says it to a wall, to nobody, to an hour.
    expect(o.knows('lacke_unfaced')).toBe(false);
    await o.play('Sit by his candle', 'Ask about the other one');
    expect(o.knows('lacke_unfaced')).toBe(true);
    expect(o.measure('ci_trust', 'pip')).toBeGreaterThanOrEqual(3);
  }, 120000);

  it('the clerk is told that the boy lives, and the boy hears the clerk: he forgives, and ci_pip_forgave is true', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), ...den, 'Ask him what he wants', 'Give him a candle', 'Ask what he saw', 'Ask who else came');
    const clerk = o.at('pell');
    expect(clerk).toBeDefined();
    await o.play(`>${clerk}`, 'Tell Tomas Pell that the boy');
    expect(o.holds('ci_pell_message', 'party')).toBe(true);
    await o.play(to('lamp_boys_den'), 'Carry Tomas Pell');
    expect(o.holds('ci_pip_forgave', 'party')).toBe(true);
  }, 120000);

  it('he can be found by tracking (a check), and a failed track sends the boys to ground for half a day', async () => {
    const o = await start('ombra', sure('ranger'));
    await o.play(to('cistern_head'), 'light a candle', to('lamp_boys_den'));
    for (let i = 0; i < 4 && !o.knows('ci_boys_found'); i++) { await o.play('?Read the den'); if (!o.knows('ci_boys_found')) { await o.play('=+80'); } }
    expect(o.knows('ci_boys_found')).toBe(true);
    // A company that cannot read a floor frightens them: of a handful of seeds, one at least goes wrong (a d20 against
    // 13, with a modifier of minus four), and the boys are gone half a day.
    let clumsy = await start('t0', [{ name: 'Sam', raceId: 'human', classId: 'mage', level: 1, wisdom: 3 } as never]);
    for (const seed of ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']) {
      clumsy = await start(seed, [{ name: 'Sam', raceId: 'human', classId: 'mage', level: 1, wisdom: 3 } as never]);
      await clumsy.play(to('cistern_head'), 'light a candle', to('lamp_boys_den'), 'Read the den');
      if (!clumsy.knows('ci_boys_found')) { break; }
    }
    expect(clumsy.knows('ci_boys_found')).toBe(false);
    expect(clumsy.holds('ci_spooked', 'party')).toBe(true);
    await clumsy.play('=+80');
    expect(clumsy.holds('ci_spooked', 'party')).toBe(false);
  }, 120000);

  it('by day, a bare company is told one thing and nothing more; as an Owl it is spoken to as a trimmer', async () => {
    const bare = await start();
    await bare.play(to('cistern_head'), 'light a torch', to('lamp_boys_den'), 'Leave a ration', 'Speak to the boy');
    expect(bare.page).toContain('two nobodies and no business');
    const owl = await start();
    await owl.play(to('annex_counter'), 'Rent the Owl', 'Put on the Owl', to('cistern_head'), 'light a torch', to('lamp_boys_den'), 'Leave a ration', 'Ask the boy his name');
    expect(owl.knows('ci_pip_named')).toBe(true);
  }, 120000);

  it('a bribe finds him and loses him: the boys take three coin and go to the loft', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), 'Hold out three coin');
    expect(o.holds('ci_bribed', 'party')).toBe(true);
    expect(o.knows('pip_saw')).toBe(true);
    expect(o.gold()).toBe(11);
    expect(o.at('pip')).toBe('ombra__loft_roof');
  }, 120000);

  it('telling the Watch fetches him: he is at the Gatehouse and the case is quick; the Round is not done', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), 'Leave a ration', to('gate_square'), 'Tell Sergeant Vail that the lamp-boy');
    expect(o.holds('ci_pip_taken', 'party')).toBe(true);
    expect(o.knows('lacke_unfaced')).toBe(true);
    expect(o.at('pip')).toBe('ombra__gate_hall');
    expect(o.holds('roundDone', 'party', 'r_pip')).toBe(false);
  }, 120000);

  it('a stay is paid for and settles the Round; a loft is asked for and Gorrell takes the boy who says there', async () => {
    const stay = await start();
    await stay.play(to('cistern_head'), to('lamp_boys_den'), ...den, 'Ask him what he wants', 'Give him a candle', 'Ask what he saw', 'Ask who else came', 'Sit by his candle', 'Ask about the other one', 'Ask him where he would be', 'Tell him he may stay');
    expect(stay.holds('roundDone', 'party', 'r_pip')).toBe(true);
    expect(stay.holds('ci_pip_stays', 'party')).toBe(true);
    const loft = await start();
    await loft.play(to('cistern_head'), to('lamp_boys_den'), ...den, 'Ask him what he wants', 'Give him a candle', 'Ask what he saw', 'Ask who else came', 'Sit by his candle', 'Ask about the other one', 'Ask him where he would be', 'Ask him if he would come up');
    expect(loft.holds('following', 'pip', 'party')).toBe(true);
    await loft.play(to('loft_floor'), 'Present Pip');
    expect(loft.holds('ci_pip_garrity', 'party')).toBe(true);
    expect(loft.holds('roundDone', 'party', 'r_pip')).toBe(true);
    expect(loft.at('pip')).toBe('ombra__loft_floor');
  }, 120000);

  it('left alone, the Flood puts the boys on the roof of the loft on the sixth morning', async () => {
    const o = await start();
    await o.play('=day 6 07:00');
    expect(o.at('pip')).toBe('ombra__loft_roof');
    expect(o.at('ci_nell')).toBe('ombra__loft_roof');
    expect(o.holds('ci_pip_settled', 'party')).toBe(false);
  }, 120000);
});

describe('The cisterns: the Ninefold Drain', () => {
  // By torch to the weir (the rats go from a flame), the torch put out before the gallery (a light there goes off like
  // a bell), the eel's toll thrown, a candle lit in the run, the slab prodded from the stair-head with the pole.
  const toThePump = [to('cistern_head'), 'light a torch', to('cistern_hall'), 'Fill a flask', to('ci_weir'), 'rope: Take', 'Put out', to('ci_slick'),
    to('ci_eelrun'), 'Throw the Warden', 'light a candle', to('ci_aenean'), 'Prod it with the pole', to('pump_chamber')];
  it('can be walked to the cellar and the hatch on the first day, and the Urn rings hollow from below', async () => {
    const o = await start();
    await o.play(...toThePump, 'tie a rope off', to('urn_cellar'), 'Rap on the bronze plate', 'Heave the hatch', to('urn_hall'));
    expect(o.at('party')).toBe('ombra__urn_hall');
    expect(o.knows('lie_urn')).toBe(true);
    expect(o.holds('state', 'ci_hatch', 'ci_open')).toBe(true);
  }, 120000);

  it('the pump is a puzzle of three states: it is cleared, primed with the Drip\'s oil, and started; the stair drains', async () => {
    const o = await start();
    await o.play(...toThePump);
    expect(o.holds('state', 'ci_sump', 'ci_flooded')).toBe(true);
    await o.play('Clear the silt', 'Prime the bearings', 'start the wheel');
    expect(o.holds('state', 'ci_pump', 'ci_running')).toBe(true);
    expect(o.holds('state', 'ci_sump', 'ci_drained')).toBe(true);
    // Its valve throws to the lagoon, through the Heronry, until it is turned to the Row's yard; the yard dries and the
    // reeds are drawn, one or the other, after half a day.
    await o.play('Turn the valve-wheel', '=+40');
    expect(o.holds('ci_yard_dry', 'party')).toBe(true);
    expect(o.holds('ci_reeds_drawn', 'party')).toBe(false);
  }, 120000);

  it('with the valve left as the Aeneans set it, the pump draws the Heronry: the herons go', async () => {
    const o = await start();
    await o.play(...toThePump, 'Clear the silt', 'Prime the bearings', 'start the wheel', '=+40');
    expect(o.holds('ci_reeds_drawn', 'party')).toBe(true);
    expect(o.at('hr_young')).toBe('ombra__offstage');
  }, 120000);

  it('the Siphon fills from the Deepening unless the pump is running; the Flood throws out whoever is below', async () => {
    const o = await start();
    await o.play('=day 3 08:00');
    expect(o.holds('state', 'ci_water', 'ci_high')).toBe(true);
    const p = await start();
    await p.play(...toThePump, 'Clear the silt', 'Prime the bearings', 'start the wheel', '=day 3 08:00');
    expect(p.holds('state', 'ci_water', 'ci_low')).toBe(true);
    await p.play('=day 6 07:00');
    expect(p.at('party')).toBe('ombra__cistern_steps');
    expect(p.holds('state', 'ci_flood', 'ci_drowned')).toBe(true);
    expect(p.holds('state', 'ci_pump', 'ci_drowned')).toBe(true);
  }, 120000);

  it('an open hatch lets the Flood into the Urn Hall; a hatch let down on its seat does not', async () => {
    const o = await start();
    await o.play(...toThePump, 'tie a rope off', to('urn_cellar'), 'Heave the hatch', to('urn_hall'), '=day 6 08:00');
    expect(o.holds('ci_hall_wet', 'party')).toBe(true);
    const seated = await start();
    await seated.play(...toThePump, 'tie a rope off', to('urn_cellar'), 'Heave the hatch', to('urn_hall'), 'let the hatch down', '=day 6 08:00');
    expect(seated.holds('ci_hall_wet', 'party')).toBe(false);
  }, 120000);

  it('a light carried into the gallery sets off the fumes; they can be burned off from the weir, at the Drip\'s cost, or the leak stopped', async () => {
    const o = await start();
    await o.play(to('cistern_head'), 'light a torch', to('ci_weir'), to('ci_slick'));
    expect(o.holds('ci_oil_burnt', 'party')).toBe(true);
    const burn = await start();
    await burn.play(to('cistern_head'), 'light a torch', to('ci_weir'), 'Touch a flame');
    expect(burn.holds('state', 'ci_fumes', 'ci_burnt')).toBe(true);
    const sealed = await start('ombra', sure('warrior'));
    await sealed.play(to('cistern_head'), 'light a candle', to('cistern_hall'), 'Drive a wooden bung', '=+40');
    expect(sealed.holds('state', 'ci_fumes', 'ci_clear')).toBe(true);
  }, 120000);

  it('the lamp-boys\' knowledge is a different way in: the line in the dark, the eel\'s toll, the left-hand slab', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), ...den, 'Ask how the boys get under the Drain');
    expect(o.knows('ci_oil_line')).toBe(true);
    expect(o.knows('ci_eel_toll')).toBe(true);
    expect(o.knows('ci_plate_step')).toBe(true);
    await o.play(to('ci_weir'));
    expect(o.holds('ci_slipped', 'party')).toBe(false);
  }, 120000);

  it('the eel is a fair fight: the warrior of the third level wins more often than not, the thief of the first mostly loses', async () => {
    // Through the dark (no light carried into the gallery), to the eel's room (the slip in the oil is a die of its
    // own).
    const results = async (classId: string, level: number) => {
      let won = 0;
      for (let i = 0; i < 4; i++) {
        const o = await start(`eel${i}`, [{ name: 'Sam', raceId: 'human', classId, level } as never]);
        await o.play(to('cistern_head'), to('ci_weir'), to('ci_slick'), to('ci_eelrun'), 'light a candle');
        try { await o.j.step('Attack'); } catch { continue; }
        if (/The fight is won/.test(o.j.taken[o.j.taken.length - 1]?.page ?? '')) { won++; }
      }
      return won;
    };
    expect(await results('warrior', 3)).toBeGreaterThanOrEqual(3);
    expect(await results('thief', 1)).toBeLessThanOrEqual(3);
  }, 240000);
});

describe('The cisterns: invariants', () => {
  it('walking what is offered, two hundred times, never puts a person in two places or a fact where it cannot be', async () => {
    const o = await start('explore');
    await o.play(to('cistern_head'), to('lamp_boys_den'), ...den);
    const people = ['pip', 'ci_nell', 'ci_tobit', 'ci_eel', 'ci_rats'];
    for (let i = 0; i < 200 && o.running; i++) {
      const choices = o.j.choices().filter(c => !/^(Wait|Make camp|Take your face off|Rest|Try to rest)/.test(c.label)
        && !/Attack|Hold out three coin|Tell Sergeant Vail|Touch a flame|Rent/.test(c.label));
      if (!choices.length) { break; }
      const pick = choices[i % choices.length]!;
      try { await o.j.step(`^${pick.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`); } catch { continue; }
      for (const who of people) { expect(o.j.campaign.world.related('at', `ombra__${who}`).length).toBeLessThanOrEqual(1); }
      if (o.holds('ci_may_tell', 'party')) { expect(o.holds('ci_told_others', 'party')).toBe(true); }
      if (o.holds('ci_pip_settled', 'party')) { expect(o.holds('roundDone', 'party', 'r_pip')).toBe(true); }
      if (o.knows('lacke_unfaced') && !o.holds('ci_pip_taken', 'party')) { expect(o.holds('ci_told_warden', 'party')).toBe(true); }
      if (o.knows('lie_urn')) { expect(o.measure('ci_trust', 'pip') >= 0).toBe(true); }
    }
  }, 240000);

  it('what has been done stays done across a night: the candle is given, the pump runs, the boys keep their place', async () => {
    const o = await start();
    await o.play(to('cistern_head'), to('lamp_boys_den'), ...den, 'Ask him what he wants', 'Give him a candle');
    const trust = o.measure('ci_trust', 'pip');
    await o.play('=day 2 09:00');
    expect(o.holds('ci_candle', 'party')).toBe(true);
    expect(o.measure('ci_trust', 'pip')).toBe(trust);
    expect(o.at('pip')).toBe('ombra__lamp_boys_den');
  }, 120000);
});
