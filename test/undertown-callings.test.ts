import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';

// A calling makes a difference in the first town (Mission 19, Priority Three; journey 2): at Lowmouth in a1 a thief
// picks the corn-store padlock without asking anyone, a warrior wrenches its hasp out of the old door, and of the
// dead under the churchyard a cleric says the rite of rest over them, and a mage reads in the chalk ring what the
// raiser's book left out and tells him so; at the quarry a ranger reads in the web what the boy saw. Each is the
// town template's (data/generation/town/undertown.kyrt), so every generated town has them.
describe('a calling\'s own way in the first town', () => {
  const start = (calling: string) => PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', `human/${calling}/Wat`]))
    .then(s => s.journey);
  const crypt = ['To the landing at Lowmouth', 'To the shrine of Nodens', 'Ask Eogan about the noises',
    'To the landing at Lowmouth', 'To the churchyard', 'Down to the crypt', 'a candle: Light', 'To the ossuary'];
  it('lets a thief pick the corn-store, and a warrior wrench it, unasked', async () => {
    const thief = await start('thief');
    await thief.step('To the landing at Lowmouth');
    expect(await thief.step('pick the corn-store padlock')).toMatch(/hangs open on its hasp/);
    expect(thief.takes('To the old corn-store')).toBe(true);
    const warrior = await start('warrior');
    await warrior.step('To the landing at Lowmouth');
    expect(warrior.offers('pick the corn-store padlock')).toBe(false);
    // Torn out, not opened: the hasp hangs by one bolt, and the store's owner will know (Mission 20).
    expect(await warrior.step('Wrench the padlock')).toMatch(/hasp hangs out of the corn-store door/);
  }, 120000);
  it('lets a cleric lay the dead by the rite, and a mage end it by what the ring says', async () => {
    const cleric = await start('cleric');
    for (const step of crypt) { await cleric.step(step); }
    expect(cleric.offers('Say the rite of rest')).toBe(true);
    expect(cleric.offers('what his book left out')).toBe(false);
    const mage = await start('mage');
    for (const step of crypt.slice(0, -1)) { await mage.step(step); }
    expect(mage.latest).toMatch(/the warding line/);
    await mage.step('To the ossuary');
    expect(mage.offers('Say the rite of rest')).toBe(false);
    expect(await mage.step('what his book left out')).toMatch(/out of Lowmouth before morning/);
  }, 120000);
  it('lets a ranger read in the web at the quarry what is laying at the back', async () => {
    const adit = ['To the landing at Lowmouth', 'Into the Lucky Phoenix', 'Ask .* about the old quarry',
      'To the landing at Lowmouth', 'To the old quarry pit', '^Down to the quarry adit$', 'a candle: Light'];
    const ranger = await start('ranger'), warrior = await start('warrior');
    for (const step of adit) { await ranger.step(step); await warrior.step(step); }
    expect(ranger.latest).toMatch(/something big at the back is laying/);
    expect(warrior.latest).not.toMatch(/something big at the back is laying/);
  }, 120000);
  // Prepared at the chandler's, a lone mage can do the jobs a warrior fights through: ratsbane laid in the cellar
  // kills the rats by morning, and an oil firebomb thrown into the web burns the spiders out (Mission 19: alone, a mage
  // was reckoned "deadly" against both).
  it('lets a lone mage do the rats and the spiders by what the chandler sells', async () => {
    const mage = await start('mage'), j = mage;
    for (const step of ['To the landing at Lowmouth', 'To Ulf\'s chandlery', 'Buy › A twist of ratsbane', 'Buy › An oil firebomb',
      'To the landing at Lowmouth', 'To Mik\'s salt-house', 'Ask Mik about the rats', 'To the landing at Lowmouth',
      'To the old corn-store', 'Down to the corn-store cellar', 'a candle: Light', 'Lay ratsbane',
      'Up to the old corn-store', 'Wait › Until dark', 'Wait › An hour', 'Wait › An hour', 'Wait › An hour']) {
      await j.step(step);
    }
    expect([j.holds('able', 'region__s1_u_rats'), j.holds('region__s1_u_done', 'region__s1_u_rats_job')]).toEqual([false, true]);
    for (const step of ['To the landing at Lowmouth', 'Into the Lucky Phoenix', 'Ask .* about the old quarry',
      'To the landing at Lowmouth', 'To the old quarry pit', '^Down to the quarry adit$', '?a candle: Light',
      'Throw an oil firebomb', 'Wait › A while']) { await j.step(step); }
    expect(j.holds('region__s1_u_done', 'region__s1_u_spiders_job')).toBe(true);
  }, 180000);
});
