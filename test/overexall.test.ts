import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/overexall/journey.json';

// Over Exall, played by the labels a player sees: a drift-whale hung on a steeple, three ways to lift it, a whaler with
// a gun, and an old woman who has been taken up before.
describe("Over Exall", () => {
  const campaign = 'data/campaigns/overexall.campaign.json';
  const start = async () => Journey.start(campaign, "overexall");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'overexall__' + ending);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road to the Cross, under the whale', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe('overexall__cross');
  }, 60000);

  it('is a fall if nothing is done, and Saley fires first at dusk on the third day', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 4 07:00');
    expect(j.holds('struck', 'party')).toBe(true);
    expect(reached(j, 'arithmetic')).toBe(true);
  }, 60000);

  it('keeps the steeple shut against someone who has not heard the Lodger answer', async () => {
    const j = await start();
    await j.play(...steps.arrive, "Into St Ebba's by the lych-gate");
    await j.play('Into the steeple by the steeple door').catch(() => undefined);
    expect(j.at('party')).toBe('overexall__foot');
  }, 60000);

  it('learns, climbs, finds the iron, borrows her bar, quiets the beast, and cuts it out', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.learn, ...steps.look);
    expect(j.holds('knows', 'party', 'overexall__iron_known')).toBe(true);
    await j.play(...steps.saley, ...steps.cut);
    expect(j.holds('unburdened', 'party')).toBe(true);
    expect(j.holds('saleyHeld', 'party')).toBe(true);
  }, 120000);

  it('lets the Lodger leave when it is warmed, fed and unburdened, and Saley keeps her gun down', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.learn, ...steps.look, ...steps.saley, ...steps.cut, ...steps.feed, '=day 2 07:00');
    expect(j.measure('lifted')).toBe(3);
    expect(reached(j, 'leaves')).toBe(true);
    expect(j.page).toContain('clapper bare');
  }, 120000);

  it('settles gently on the town if only one thing is done and Saley is ashamed of her iron', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.learn, ...steps.look, ...steps.saley, ...steps.fedOnly, '=day 4 07:00');
    expect(j.measure('lifted')).toBe(1);
    expect(reached(j, 'stays')).toBe(true);
  }, 120000);

  it('falls on the town if nothing is done once Saley is ashamed of her iron', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.learn, ...steps.look, ...steps.saley, '=day 4 07:00');
    expect(j.holds('struck', 'party')).toBe(false);
    expect(reached(j, 'fall')).toBe(true);
  }, 120000);

  it('goes over the roofs from the pigeon loft, once Sab has said how', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.roofs);
    expect(j.at('party')).toBe('overexall__ledge');
  }, 120000);

  it('takes Dorcas up, and Candlemas is the ending', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.learn, ...steps.dorcas, '=day 2 07:00');
    expect(j.holds('aboard', 'party')).toBe(true);
    expect(reached(j, 'candlemas')).toBe(true);
  }, 120000);
});
