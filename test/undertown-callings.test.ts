import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';

// A calling makes a difference in the first town (Mission 19, Priority Three; journey 2): at Lowmouth in a1 a thief
// picks the corn-store padlock without asking anyone, a warrior wrenches its hasp out of the old door, and of the
// dead under the churchyard a cleric says the rite of rest over them, and a mage reads in the chalk ring what the
// raiser's book left out and tells him so. Each is the town template's (data/generation/town/undertown.kyrt), so
// every generated town has them.
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
    expect(await warrior.step('Wrench the padlock')).toMatch(/hangs open on its hasp/);
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
});
