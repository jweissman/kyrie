import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/index';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/cleave/journey.json';

// The Cradle Across the Cleave, played by the labels a player sees. The company starts at eight on the first morning;
// Linnet's labour turns at watch 144 (eight the next morning); the egg-case hatches in the dark after eight hours in
// Hesper's apron, and the spiders finish the road two hours later.
const campaign = 'data/campaigns/cleave.campaign.json';
const S: typeof steps & Record<string, string[]> = steps;
const title = (j: Journey) => Endings.reached(j.campaign.world)?.title;
const start = async (...parts: string[]) => {
  const j = await Journey.start(campaign, 'cleave');
  await j.play(...S.arrive!);
  for (const p of parts) { await j.play(...S[p]!); }
  return j;
};
const farm = ['^To the south lip', "Into the Pennards' farmhouse"];

describe('The Cradle Across the Cleave', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('Hesper will not ride the basket, and says "hub" before anyone else has', async () => {
    const j = await start();
    await j.play("^Into Hesper Lunn's cottage", 'Ask Hesper whether she will ride');
    expect(j.holds('knows', 'party', 'hub_word')).toBe(true);
    expect(j.holds('hesperBasket', 'party')).toBe(false);
  }, 60000);

  it('the hub way: the egg-case is warmed, the road is spun, and the child is born into Hesper\'s hands (The Grey Road)', async () => {
    const j = await start('cassia', 'hesperEgg', 'vigil');
    expect(j.holds('cassiaYields', 'party')).toBe(true);
    expect(j.holds('hesperAgreed', 'party')).toBe(true);
    await j.play('=until state(span, spun)');
    await j.play(...farm, 'Stand back and let Hesper work');
    expect(title(j)).toBe('The Grey Road');
  }, 120000);

  it('Cassia will not let Hesper near the egg-case until she has been told who has come', async () => {
    const j = await start('cassia');
    await j.play("^Into Hesper Lunn's cottage", "Tell Hesper the Mother's", '^Out to the bridgehead', '^To the Stub');
    await j.play('^To the hub');
    expect(j.matches('Sit Hesper down').length).toBe(0);
  }, 120000);

  it('the line way: lamps move Hesper to the basket, and the bridge never comes (Five Coin the Crossing)', async () => {
    const j = await start('ledge');
    await j.play('^To the Stub', '^To the bridgehead', "^Into Hesper Lunn's cottage", 'Tell Hesper the lamps', '^Out to the bridgehead', "^To the haulers' shed", 'Pay Ned', '^To the south anchor-post');
    await j.play(...farm, 'Stand back and let Hesper work');
    expect(title(j)).toBe('Five Coin the Crossing');
  }, 120000);

  it('Ned will not take the fare, or send the basket, in a gust', async () => {
    const j = await start();
    j.assert('state', 'wind', 'gusting');
    await j.play("^To the haulers' shed");
    expect(j.matches('Pay Ned').length).toBe(0);
    expect(j.matches('Ask Ned to send the basket').length).toBe(1);
  }, 60000);

  it('the flitter way, taught: the company alone brings the child by Hesper\'s three rules (Three Rules)', async () => {
    const j = await Journey.start(campaign, 'cleave');
    await j.play("Take Hesper's second bag", ...S.arrive!, ...S.lessons!, '^To the Stub', '^To Toop\'s ledge', 'Take the flitter off the ledge');
    await j.play(...farm, 'Bring the child yourself');
    expect(title(j)).toBe('Three Rules');
  }, 120000);

  it('the flitter way, untaught and unlucky: the child lives and Linnet is a long time getting up (Gammer\'s Kitchen)', async () => {
    const j = await start();
    j.roll('fail');
    await j.play('^To the Stub', "^To Toop's ledge", 'Take the flitter off the ledge', ...farm, 'Help Gammer Roke');
    expect(title(j)).toBe("Gammer's Kitchen");
  }, 120000);

  it('the flitter way, untaught and lucky (Hands in the Kitchen)', async () => {
    const j = await start();
    j.roll('pass');
    await j.play('^To the Stub', "^To Toop's ledge", 'Take the flitter off the ledge', ...farm, 'Help Gammer Roke');
    expect(title(j)).toBe('Hands in the Kitchen');
  }, 120000);

  it('the flitter will not carry Hesper, though it carries the company alone', async () => {
    const j = await start('ledge');
    expect(j.matches('Take the flitter').length).toBe(1);
    await j.play('^To the Stub', '^To the bridgehead', "^Into Hesper Lunn's cottage", 'Tell Hesper the lamps', '^Out to the bridgehead', '^To the Stub', "^To Toop's ledge");
    expect(j.matches('Take the flitter').length).toBe(0);
  }, 60000);

  it('a company that is late finds the child already born (The Pole of Lamps)', async () => {
    const j = await start();
    await j.play('=day 2 8:00');
    expect(title(j)).toBe('The Pole of Lamps');
  }, 120000);

  it('what Hesper is asked through the night counts toward the vigil, as the sitting does', async () => {
    const j = await start('ledge');
    await j.play('Ask Ottoline about the hens', ...S.cassia!, ...S.hesperEgg!, 'Sit Hesper down', 'Sit up with Hesper');
    expect(j.holds('keptVigil', 'party')).toBe(false);
    await j.play("Tell Hesper about Ottoline's hens");
    expect(j.holds('keptVigil', 'party')).toBe(true);
  }, 120000);

  it("Dov's story points the company down to the hen-woman who reads the lamps", async () => {
    const j = await Journey.start(campaign, 'cleave');
    await j.play('Ask Dov what has happened');
    expect(j.holds('knows', 'party', 'ledge_known')).toBe(true);
  }, 60000);
});
