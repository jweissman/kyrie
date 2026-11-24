import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/weatherdrove/journey.json';

describe("The Weather Drove", () => {
  const campaign = 'data/campaigns/weatherdrove.campaign.json';
  const start = async () => Journey.start(campaign, "weatherdrove");
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);
  it('walks the warm road: letter, sister, vents', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.ridge, ...steps.camp);
    expect(j.holds('dorcasWilling', 'party')).toBe(true);
    await j.play(...steps.back);
    expect(j.holds('fidelisWilling', 'party')).toBe(true);
    expect(j.holds('state', 'weatherdrove__vents', 'weatherdrove__open')).toBe(true);
  }, 240000);
  const reached = (j: Journey, e: string) => j.holds('reached', 'weatherdrove__' + e);
  const warm = async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.ridge, ...steps.camp, ...steps.back, ...steps.salt);
    return j;
  };

  it('brings the whole rain: salt covered, the three voices, turned to the Gardens', async () => {
    const j = await warm();
    expect(j.holds('saltCovered', 'party')).toBe(true);
    expect(j.holds('state', 'weatherdrove__fires', 'weatherdrove__out')).toBe(true);
    await j.play(...steps.call);
    expect(j.holds('called', 'party')).toBe(true);
    await j.play(...steps.gardens);
    expect(reached(j, 'the_whole_rain')).toBe(true);
    expect(j.page).toContain('under black canvas');
    expect(j.page).toContain('disagree about lemons');
  }, 300000);

  it('offers the sea to one who knows she is old, and takes her over the water', async () => {
    const j = await warm();
    await j.play(...steps.call);
    await j.play(...steps.sea);
    expect(reached(j, 'over_the_water')).toBe(true);
    expect(j.page).toContain('corrects her');
  }, 300000);

  it('lets the gun fire at the third dusk, and the roof come down', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 3 18:10');
    expect(reached(j, 'cloudburst')).toBe(true);
  }, 120000);

  it('turns the gun on the flats, and the Professor claims the sky', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.gun);
    expect(j.holds('state', 'weatherdrove__gun', 'weatherdrove__swung')).toBe(true);
    await j.play('=day 3 18:10');
    expect(reached(j, 'cloudburst')).toBe(false);
    expect(j.page).toContain('avocets');
  }, 120000);

  it('lets Wickering go dry if nobody does anything', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.gun, '=day 4 06:30');
    expect(reached(j, 'the_cup')).toBe(true);
  }, 120000);
  it('will not walk the Widow through Ysolde\'s smoke: the Gardens are closed while the fires burn', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.ridge, ...steps.camp, ...steps.back, 'Take your leave', '^To the glass hall', '^Out to the lemon terrace', ...steps.call.slice(1));
    expect(j.holds('called', 'party')).toBe(true);
    expect(j.offers('Say: turn her to the Gardens')).toBe(false);
    expect(j.offers('Ask Dorcas about the Gardens road')).toBe(true);
    expect(j.offers('Say: turn her to the sea')).toBe(true);
  }, 300000);

  it('puts out the fires by hand, and Ysolde knows who did', async () => {
    const j = await start();
    await j.play(...steps.arrive, '^To the pan-house', '^To the salt heaps', '^To the east ridge', 'Kick over the pots');
    expect(j.holds('state', 'weatherdrove__fires', 'weatherdrove__out')).toBe(true);
    expect(j.holds('ysoldeDoused', 'party')).toBe(false);
  }, 120000);

  it('opens the vents for a persuasion alone, without the letter', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, '^To the lemon terrace', '^Into the Gillyflower House', '^To the gallery', 'Talk to Fidelis', 'Ask Fidelis to open the roof-vents');
    expect(j.holds('fidelisWilling', 'party')).toBe(true);
    expect(j.holds('warmWay', 'party')).toBe(false);
  }, 120000);
});
