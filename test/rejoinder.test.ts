import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/rejoinder/journey.json';

// Rejoinder, played by the labels a player sees: the night the Reply gives back the year.
describe("Rejoinder", () => {
  const campaign = 'data/campaigns/rejoinder.campaign.json';
  const start = async () => Journey.start(campaign, "rejoinder");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'rejoinder__' + ending);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road into the square', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe("rejoinder__square");
  }, 60000);

  it('goes the whole good way: every voice lands where someone is standing, and the Warden is answered', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.gossip, ...steps.courtship, ...steps.orla, ...steps.amos, ...steps.gate, ...steps.walkWat, ...steps.toThree);
    expect(j.latest).toContain('good riddance');
    await j.play(...steps.hold);
    await j.play(...steps.toFourteen);
    expect(j.holds('orlaHeard', 'party')).toBe(true);
    expect(j.holds('reunited', 'party')).toBe(true);
    expect(j.holds('answeredAloud', 'party')).toBe(true);
    await j.play(...steps.toForty, ...steps.dawn, ...steps.own, '=day 2 08:00');
    expect(j.holds('inesSent', 'party')).toBe(true);
    expect(reached(j, 'sixty_one')).toBe(true);
  }, 240000);

  it('hangs the wool when Orla is brought it, and both of her voices are lost in it', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.orlaWool, '=91');
    expect(j.holds('woolHung', 'party')).toBe(true);
    expect(j.holds('orlaMuffled', 'party')).toBe(true);
    expect(j.holds('orlaHeard', 'party')).toBe(false);
    await j.play('=day 2 08:00');
    expect(reached(j, 'wool_night')).toBe(true);
  }, 240000);

  it('lets Orla walk away from the second voice if nobody is there, and her kitchen can be told it after', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.wait3);
    expect(j.holds('orlaGone', 'party')).toBe(true);
    expect(j.holds('orlaHeard', 'party')).toBe(false);
    expect(j.offers('Tell Orla what Jory said')).toBe(false);
  }, 240000);

  it('sends the proposal to a crowd when Thessaly is never told, and she hears of it at dawn', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.thessLost, '=99');
    expect(j.holds('proposalLost', 'party')).toBe(true);
    expect(j.holds('answeredAloud', 'party')).toBe(false);
  }, 240000);

  it('lets a night on the floor of the Reply teach what Orla missed, and she can be told it at her kitchen', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.orla.slice(0, 4), 'Out to the square', ...steps.wait3);
    await j.play(...steps.floor, '=93');
    expect(j.holds('knows', 'party', 'rejoinder__jory_words')).toBe(true);
    await j.play('=day 2 06:00', 'Into the Rim by the Wool Stair', 'To the square', "Into the Pendles' house");
    await j.play('Tell Orla what Jory said');
    expect(j.holds('orlaToldLate', 'party')).toBe(true);
    expect(j.holds('forestalled', 'party')).toBe(true);
  }, 240000);

  it('lets Tobe tell Thessaly himself, at the price of his bell', async () => {
    const j = await start();
    await j.play(...steps.arrive, 'Ask Thessaly what she is waiting for', 'Into the Last Word', 'Buy Tobe a small beer', 'Ask the sleeper what he does', 'Ask Tobe to show you his cord', 'Put it to Tobe', 'Let Tobe go and tell Thessaly himself');
    expect(j.holds('tobeTells', 'party')).toBe(true);
    expect(j.holds('thessTold', 'party')).toBe(true);
  }, 120000);

  it('lets Wat leave on the road when nobody brings him to the list, and can be called back with its meaning', async () => {
    const j = await start();
    await j.play(...steps.arrive, 'To the Rim gate', 'To cairn three', 'To cairn nine', 'To cairn fourteen', '=93');
    expect(j.holds('listLanded', 'party')).toBe(true);
    expect(j.holds('reunited', 'party')).toBe(false);
    expect(j.holds('knows', 'party', 'rejoinder__amos_list')).toBe(true);
    await j.play('=105', '>rejoinder__road', 'Tell Wat what the list meant');
    expect(j.holds('watTurns', 'party')).toBe(true);
    await j.play('=day 2 08:00');
    expect(j.holds('reunited', 'party')).toBe(false);
  }, 240000);

  it('turns the Ash away from the Rim with a twist of wool, when the count has begun', async () => {
    const j = await start();
    j.assert('befell', 'ash_count_begun');
    await j.play(...steps.arrive, 'Into the Last Word', 'Buy › A twist of grey wool', 'Out to the square', 'To the Rim gate', '=60');
    expect(j.holds('at', 'rejoinder__edric', 'rejoinder__gate')).toBe(true);
    await j.play('Hang a twist of grey wool on the tally-board');
    expect(j.holds('ashTurned', 'party')).toBe(true);
  }, 120000);

  it('has Ines say the word herself to a company that missed it', async () => {
    const j = await start();
    await j.play(...steps.arrive, 'To the Rim gate', 'Take cairn twenty from Ines', 'To cairn three', 'To cairn nine', 'To cairn fourteen', 'To cairn twenty');
    await j.play('=day 2 05:30', 'To cairn forty');
    await j.play('Ask Ines why she is not shouting', 'Ask Ines what the word is', 'Offer to shout the word for her', "Shout Ines's word");
    expect(j.holds('inesSent', 'party')).toBe(true);
  }, 240000);
});
