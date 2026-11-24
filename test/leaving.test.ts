import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/leaving/journey.json';

// The Leaving Supper, by the labels a player sees: the right pot and the Captain's four answers, and each other ending.
describe("The Leaving Supper", () => {
  const campaign = 'data/campaigns/leaving.campaign.json';
  const start = async () => Journey.start(campaign, "leaving");
  const reached = (j: Journey, e: string) => j.holds('reached', 'leaving__' + e);
  const run = async (...parts: string[][]) => { const j = await start(); await j.play(...parts.flat()); return j; };

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road into the square', async () => {
    const j = await run(steps.arrive);
    expect(j.at('party')).toBe("leaving__square");
  }, 60000);

  it('gathers every right thing by the net, the mill, the weir and the step, and cooks it grey', async () => {
    const j = await run(steps.arrive, steps.gather, steps.cook);
    expect(j.measure('goodness', 'party')).toBe(5);
    expect(j.holds('potReady', 'party')).toBe(true);
  }, 240000);

  it('gives the pot to Imke before the table, and brings her to it: Skellet Grey, and a spoon', async () => {
    const j = await run(steps.arrive, steps.gather, steps.cook, steps.imke, steps.serve, ['Ask for nothing, and ask her what Skellet tasted like', 'Stay at the table until the lamps burn down']);
    expect(j.holds('imkeComes', 'party')).toBe(true);
    expect(reached(j, 'skellet_grey')).toBe(true);
  }, 240000);

  it('serves a right pot without Imke: That Will Do, and Nat sent home', async () => {
    const j = await run(steps.arrive, steps.gather, steps.cook, steps.serve, ['Ask the Captain to let Nat Tuck go home to the weir', 'Stay at the table until the lamps burn down']);
    expect(j.holds('boonNat', 'party')).toBe(true);
    expect(reached(j, 'that_will_do')).toBe(true);
  }, 240000);

  it('leaves out the ash and is told the pot is the wrong colour: Near Enough', async () => {
    const j = await run(steps.arrive, steps.gather, steps.cookNoAsh, ['To the market square', 'To the Company\'s camp on the glebe', 'Let the sergeant taste the pot']);
    expect(j.measure('goodness', 'party')).toBe(4);
    await j.play(...steps.serve, 'Stay at the table until the lamps burn down');
    expect(reached(j, 'near_enough')).toBe(true);
  }, 240000);

  it('cooks the larder kit alone, is told it is floury, and serves it: The Swan', async () => {
    const j = await run(steps.arrive, ['To the Company\'s camp on the glebe', 'Ask the sergeant what the Captain wants', 'To the market square', 'Into the Bell and Barrow', 'Ask Meggy what the larder holds'], steps.kit,
      ['To the market square', 'To the Company\'s camp on the glebe', 'Let the sergeant taste the pot'], steps.serve, ['Stay at the table until the lamps burn down']);
    expect(j.measure('goodness', 'party')).toBe(0);
    expect(reached(j, 'the_swan')).toBe(true);
  }, 240000);

  it('carries Josiah\'s word to Nat and back for the eels, and buys the salt', async () => {
    const j = await run(steps.arrive, ["To the Company's camp on the glebe", "Buy a twist of the fen-salt from the quartermaster", "To the market square", "To Nettlefold's mill", "To the eel-weir", "Ask Josiah about his son", "To Nettlefold's mill", "To the market square", "To the Company's camp on the glebe", "Give Nat his father's message", "To the market square", "To Nettlefold's mill", "To the eel-weir", "Tell Josiah what Nat said"]);
    expect(j.holds('saltBought', 'party')).toBe(true);
    expect(j.holds('eelGot', 'party')).toBe(true);
  }, 240000);

  it('ends with No Supper if nothing is brought by ten', async () => {
    const j = await run(steps.arrive, ['=day 1 22:00']);
    expect(reached(j, 'no_supper')).toBe(true);
  }, 120000);
});
