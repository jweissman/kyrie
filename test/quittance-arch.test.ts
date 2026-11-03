import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { City, Q, campaign } from './support/quittance';

// The Declaration Arch and the other ways in: each leaves the company recorded, and placed, differently.
describe('Quittance: the ways in', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 120000);

  it('declares truthfully: a Policy of Passage, the Roll, a cheaper licence, and the Phoenix knows', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the Declarations Hall');
    expect(j.holds(Q('inCity'), 'party')).toBe(false);
    await j.play('Declare yourselves truthfully');
    expect(j.holds(Q('entered_honest'), 'party')).toBe(true);
    expect(j.holds(Q('onTheRoll'), 'party')).toBe(true);
    expect(City.gold(j)).toBe(g0 - 3);
    expect(City.regard(j, 'phoenix')).toBe(1);
    await j.play('^Out to Gate Plaza');
    expect(j.at('party')).toBe(Q('gate_plaza'));
  }, 120000);

  it('will not let the company through the Arch undeclared', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the Declarations Hall');
    expect(j.matches('^Out to Gate Plaza')).toEqual([]);
  }, 120000);

  it('lies to the Bell and is rung for it, then pays to be truthful', async () => {
    const j = await City.start('bell-1');
    const g0 = City.gold(j);
    await j.play('^To the Declarations Hall');
    const lie = j.matches('Declare yourselves wool-factors');
    expect(lie.length).toBe(1);
    await j.play('Declare yourselves wool-factors');
    if (j.holds(Q('ringed'), 'party')) {
      expect(City.gold(j)).toBe(g0 - 5);
      expect(City.said(j)).toContain('Bell rings');
      expect(j.matches('Declare yourselves wool-factors')).toEqual([]);
      await j.play('Declare yourselves truthfully');
      expect(j.holds(Q('entered_honest'), 'party')).toBe(true);
    } else {
      expect(j.holds(Q('aliased'), 'party')).toBe(true);
      expect(j.holds(Q('onTheRoll'), 'party')).toBe(false);
    }
  }, 120000);

  it('declares by Rule Five: sufficient, and not recorded', async () => {
    let admitted = false;
    for (const seed of ['five-1', 'five-2', 'five-3', 'five-4']) {
      const j = await City.start(seed);
      const g0 = City.gold(j);
      await j.play('^To the Declarations Hall', '?Declare your goods and your purpose, .to look about., and decline');
      if (j.holds(Q('entered_plain'), 'party')) {
        admitted = true;
        expect(j.holds(Q('onTheRoll'), 'party')).toBe(false);
        expect(City.gold(j)).toBe(g0);
        break;
      }
      await j.play('?Declare your goods and your purpose, .to look about., and put it');
      if (j.holds(Q('entered_plain'), 'party')) { admitted = true; break; }
    }
    expect(admitted).toBe(true);
  }, 240000);

  it('goes up the Water-Stair, paying handling, and is in the Reach with no name on any Roll', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the Declaration Road'.replace('Declaration Road', 'river towpath'));
    await j.play("Pay Tam Ridd four coin");
    expect(j.holds(Q('entered_water'), 'party')).toBe(true);
    expect(j.at('party')).toBe(Q('lighter_stairs'));
    expect(j.holds(Q('onTheRoll'), 'party')).toBe(false);
    expect(City.gold(j)).toBe(g0 - 4);
  }, 120000);

  it('works the winch instead, and is a friend of the lightermen', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the river towpath', 'Take a turn on the lighter');
    expect(j.holds(Q('entered_water'), 'party')).toBe(true);
    expect(City.regard(j, 'lamprey')).toBe(1);
    expect(City.gold(j)).toBe(g0);
  }, 120000);

  it('rides up in the hearse, to Mortmain', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the Mortmain road', 'Ride up in the hearse');
    expect(j.holds(Q('entered_hearse'), 'party')).toBe(true);
    expect(j.at('party')).toBe(Q('mort_lodge'));
    expect(City.regard(j, 'sovereign')).toBe(1);
  }, 120000);

  it('goes through the gap in the Cinderwall, remembered by the gap boys', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the foot of the outer wall', 'Pay the gap boys a copper');
    expect(j.holds(Q('entered_gap'), 'party')).toBe(true);
    expect(j.at('party')).toBe(Q('wards_gate'));
    expect(City.regard(j, 'wardsfolk')).toBe(1);
  }, 120000);

  it('may leave by the Arch and come back without declaring again, once in', async () => {
    const j = await City.start();
    const g0 = City.gold(j);
    await j.play('^To the Declarations Hall', 'Declare yourselves truthfully', '^Out to Gate Plaza', '^Into the Declaration Arch');
    expect(j.at('party')).toBe(Q('arch_hall'));
    await j.play('^To the Declaration Road');
    await j.play('^To the Declarations Hall', '^Out to Gate Plaza');
    expect(j.at('party')).toBe(Q('gate_plaza'));
  }, 120000);
});
