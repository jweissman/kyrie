import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/tailrace/journey.json';

// The Calf in the Tail-Race, played by the labels a player sees. The company comes down the loch road on the first
// morning; the Ri's gauger comes to the Ladle at noon on the second day (watch 168), his boilers begin at dawn on the
// third (276), the spring tide tops that night (372) and the grey hour comes before the dawn after it (408, 414).
describe("The Calf in the Tail-Race", () => {
  const campaign = 'data/campaigns/tailrace.campaign.json';
  const S = steps as Record<string, string[]>;
  const start = async (...parts: string[]) => {
    const j = await Journey.start(campaign, "tailrace");
    await j.play(...S.arrive);
    for (const p of parts) await j.play(...S[p]);
    return j;
  };
  const ended = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
  const gauger = ['To the hard', 'Into the Ladle', '=until gaugerOn()', 'Ask Waric why he has come'];
  // The kind way: everything learned, the calf fed, the hay carried, and Maric asked about his boat.
  const kind = ['agnel', 'mabet', 'buy', 'feed', 'ulkin', 'toBar', 'maricAsk'];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('is played from the loch road onto the hard', async () => {
    const j = await Journey.start(campaign, "tailrace");
    await j.play(...S.arrive);
    expect(j.at('party')).toBe("tailrace__hard");
  }, 60000);

  it("Mabet's trust is earned: she asks which kind you are, and the splinter comes out only for someone she trusts", async () => {
    const j = await start('agnel');
    await j.play('To the tail-race', 'Look closely');
    expect(j.holds('knows', 'party', 'scar_known')).toBe(true);
    expect(j.matches('Draw the splinter').length).toBe(0);
    await j.play('Ask Mabet what Parsnip eats', 'Speak to Mabet about the boilers', 'Say you have not decided');
    expect(j.holds('mabetTrusts', 'party')).toBe(false);
    await j.play('Wet the calf down');
    expect(j.holds('mabetTrusts', 'party')).toBe(true);
    await j.play('Draw the splinter');
    expect(j.holds('splinterDrawn', 'party')).toBe(true);
  }, 120000);

  it('the cynic must feed the calf three times before Mabet will hold its head', async () => {
    const j = await start('agnel');
    await j.play('To the tail-race');
    await j.play("To Thord's mill-yard", 'To the hard', 'Into the Ladle', 'Buy › A string of herring', 'Buy › A string of herring', 'Buy › A string of herring', 'Out to the hard', "To Thord's mill-yard", 'To the tail-race');
    await j.play('Speak to Mabet about the boilers', 'Say the boilers will have him');
    await j.play('Throw the calf a string of herring', 'Throw the calf a string of herring');
    expect(j.holds('mabetTrusts', 'party')).toBe(false);
    await j.play('Throw the calf a string of herring');
    expect(j.holds('mabetTrusts', 'party')).toBe(true);
  }, 120000);

  it('Agnel will not lend the mallet until Hobin Ulkin has been told, and says why', async () => {
    const j = await start('agnel', 'toBarFromYard');
    await j.play('To the hard', "To Thord's mill-yard", 'Ask Agnel for the drawing-mallet');
    expect(j.holds('knows', 'party', 'hay_known')).toBe(true);
    expect(j.holds('holding', 'party', 'tr_mallet')).toBe(false);
  }, 120000);

  it('Waric will not take rape-oil from someone who has not asked what a lamp is for; he takes it from someone who has', async () => {
    const j = await start('agnel');
    await j.play(...gauger, "Offer Waric the mill's rape-oil");
    expect(j.holds('stayed', 'party')).toBe(false);
    await j.play('Ask Waric about the lamps', "Offer Waric the mill's rape-oil");
    expect(j.holds('stayed', 'party')).toBe(true);
    expect(j.holds('oilDeal', 'party')).toBe(true);
  }, 120000);

  it('the sea does not lift the calf before the top of the tide, and the logs will not be drawn', async () => {
    const j = await start('agnel', 'toBarFromYard', 'maricAsk');
    await j.play('To the hard', "To Thord's mill-yard", 'To the tail-race', 'To the weir-sill');
    expect(j.matches('Draw the stop-logs').length).toBe(0);
    expect(j.holds('state', 'sill_logs', 'shut')).toBe(true);
  }, 120000);

  it('the kind way: the calf floats at the top of the tide, Maric lends the horn, the Dam answers: The Lit Water', async () => {
    const j = await start(...kind, 'maricYield', 'waric', 'mallet', 'draw', 'toBarFromSill');
    expect(j.holds('state', 'calf', 'afloat')).toBe(true);
    await j.play(...S.horn);
    expect(j.holds('damAnswered', 'party')).toBe(true);
    expect(j.holds('state', 'calf', 'gone')).toBe(true);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['tailrace__lit_water']);
    expect(j.page).toMatch(/does not look at the horn that is not there/);
    expect(j.page).toMatch(/pressing rape into a keg/);
    expect(j.page).toMatch(/It knocked/);
    expect(j.page).toMatch(/shows its left side, clean/);
    expect(j.measure('fed', 'calf')).toBeGreaterThanOrEqual(3);
  }, 240000);

  it('Maric can sound the horn himself, and the Dam answers him all the same', async () => {
    const j = await start(...kind, 'maricCalls', 'waric', 'mallet', 'draw');
    expect(j.holds('damAnswered', 'party')).toBe(true);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['tailrace__lit_water']);
    expect(j.page).toMatch(/lifts his hand/);
  }, 240000);

  it('Maric can be argued out of the harpoon by someone who knows how the Good Intent was lost, if the dice are kind', async () => {
    const j = await start('agnel', 'toBarFromYard', 'maricAsk');
    expect(j.matches('Tell Maric she was only coming').length).toBe(1);
    j.roll('fail');
    await j.play('Tell Maric she was only coming');
    expect(j.holds('maricYields', 'party')).toBe(false);
    j.roll('pass');
    await j.play('Tell Maric she was only coming');
    expect(j.holds('maricYields', 'party')).toBe(true);
  }, 120000);

  it('with Maric unmoved, the calf is freed, the Dam answers and the harpoon flies: The Line Across the Water', async () => {
    const j = await start('agnel', 'mabet', 'buy', 'feed', 'ulkin', 'toBar', 'maricAsk', 'waric', 'mallet', 'draw');
    expect(j.holds('maricYields', 'party')).toBe(false);
    expect(j.holds('harpooned', 'party')).toBe(true);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['tailrace__harpoon_night']);
  }, 240000);

  it('standing with Maric: Sixty Barrels', async () => {
    const j = await start(...kind);
    await j.play('Tell Maric you will stand with him');
    expect(j.holds('maricJoined', 'party')).toBe(true);
    await j.play('To the hard', 'Into the Ladle', '=until gaugerOn()', 'Ask Waric why he has come', 'Ask Waric about the lamps', "Offer Waric the mill's rape-oil");
    await j.play(...S.mallet, ...S.draw);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['tailrace__sixty_barrels']);
  }, 240000);

  it('Maric lends the horn and nobody sounds it: the calf goes out alone: A Calf Alone', async () => {
    const j = await start(...kind, 'maricYield', 'waric', 'mallet', 'draw');
    await j.play('=until dawnOn()');
    expect(j.holds('damAnswered', 'party')).toBe(false);
    expect(ended(j)).toEqual(['tailrace__calf_alone']);
  }, 240000);

  it('left alone, the calf is boiled at dawn on the third day: Boiling Day', async () => {
    const j = await start();
    await j.play('=until flenseOn()');
    expect(ended(j)).toEqual(['tailrace__boiled']);
  }, 120000);

  it('Waric can be told to begin', async () => {
    const j = await start('agnel');
    await j.play(...gauger, 'Tell Waric he may begin');
    expect(ended(j)).toEqual(['tailrace__boiled']);
  }, 120000);

  it('a stayed calf that is not fed dies before the tide: The Quiet Race', async () => {
    const j = await start('agnel');
    await j.play(...gauger, 'Ask Waric about the lamps', "Offer Waric the mill's rape-oil");
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['tailrace__starved']);
  }, 240000);

  it('stop-logs forced with a crowbar still float the calf, and cost Agnel her logs', async () => {
    const j = await start(...kind, 'maricYield', 'waric');
    j.give('crowbar');
    await j.play('=until tideOn()', 'Out to the hard', "To Thord's mill-yard", 'To the tail-race', 'To the weir-sill', 'Break the stop-logs');
    expect(j.holds('sillForced', 'party')).toBe(true);
    expect(j.holds('state', 'calf', 'afloat')).toBe(true);
  }, 240000);
});
