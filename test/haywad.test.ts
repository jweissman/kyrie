import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/haywad/journey.json';

// The Still Hours, played by the labels a player sees: a wood that walks through a village once in thirty-one years,
// three doors on its Way, and what a person standing still in one of them can be asked.
describe("The Still Hours", () => {
  const campaign = 'data/campaigns/haywad.campaign.json';
  const start = async () => Journey.start(campaign, "haywad");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'haywad__' + ending);
  const has = (j: Journey, name: string) => j.holds(name, 'party');
  const at = (j: Journey, name: string) => j.holds('standsAt', 'haywad__' + name);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road to the green', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe('haywad__green');
  }, 60000);

  it('is a carried daughter and a lost bakehouse if nothing is done', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 2 18:00');
    expect(has(j, 'pipetHurt')).toBe(true);
    expect(has(j, 'tibylGone')).toBe(true);
    expect(at(j, 'fender_step')).toBe(false);
    expect(at(j, 'notler_step')).toBe(true);
    expect(reached(j, 'carried')).toBe(true);
  }, 120000);

  it('has Edda walk east with the wood and Tibyl, when the company stands her door', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.learn, ...steps.edda, ...steps.holdAndRelease);
    expect(has(j, 'eddaGone')).toBe(true);
    expect(j.measure('held', 'haywad__notler_step')).toBe(3);
    await j.play(...steps.walkEast, ...steps.bothEnd, '=day 2 18:00');
    expect(has(j, 'eddaWent')).toBe(true);
    expect(has(j, 'tibylGone')).toBe(true);
    expect(reached(j, 'both')).toBe(true);
  }, 120000);

  it('has Tibyl stay when she is given Edda\'s words, and a seedling go home from the Mere', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.heldDay, ...steps.heldNight);
    expect(has(j, 'tibylStays')).toBe(true);
    await j.play(...steps.mere, '=day 2 18:00');
    expect(has(j, 'seedlingPlanted')).toBe(true);
    expect(reached(j, 'held')).toBe(true);
  }, 120000);

  it('lets Pipet freeze at one word if he was taught it, and keeps the bakehouse', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.statues, '=day 2 06:00');
    expect(has(j, 'pipetStands')).toBe(true);
    expect(has(j, 'pipetSafe')).toBe(true);
    expect(has(j, 'pipetHurt')).toBe(false);
    expect(at(j, 'fender_step')).toBe(true);
  }, 120000);

  it('has the company go out among the trees for a boy who was not taught', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, 'To the bakehouse step', '=day 1 23:30', 'Go out among the trees and hold Pipet still');
    expect(has(j, 'pipetSafe')).toBe(true);
    expect(has(j, 'pipetHurt')).toBe(false);
  }, 120000);

  it('hurts a company that flinches in a doorway', async () => {
    const j = await start();
    j.roll('fail');
    await j.play(...steps.arrive, "To Notler's step", '=day 1 21:00', 'Hold still in the doorway');
    expect(j.measure('flinched', 'haywad__notler_step')).toBe(1);
    expect(j.measure('held', 'haywad__notler_step')).toBe(0);
  }, 120000);

  it('is too late for Edda if she is sent after the Leaner has come', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.learn, ...steps.edda, '=day 1 21:00', 'Hold still in the doorway', '=day 1 26:30',
      'Tell Edda to go', '=day 2 18:00');
    expect(has(j, 'eddaLate')).toBe(true);
    expect(reached(j, 'late')).toBe(true);
  }, 120000);

  it('finds a collar-bell in the Bare after the wood has gone, and Sorel is given it', async () => {
    const j = await start();
    await j.play(...steps.arrive, 'To Notler\'s step', '=day 2 07:00', 'To the Bare', 'Search here', 'Take',
      'To Notler\'s step', 'To the green', 'To the bakehouse step', 'Into Fender\'s bakehouse', 'Give Sorel the bell from the Bare');
    expect(has(j, 'sorelBell')).toBe(true);
  }, 120000);

  it('pays at dawn for the doors held', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, "To Notler's step", '=day 1 21:00', 'Hold still in the doorway', 'Hold still in the doorway',
      '=day 2 07:00', 'To the green', 'Into the Stile', 'Ask Haber about the Way-fund');
    expect(j.measure('owed', 'party')).toBe(6);
    expect(has(j, 'paid')).toBe(true);
  }, 120000);
});
