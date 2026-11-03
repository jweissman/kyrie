import { describe, expect, it } from 'bun:test';
import type { Journey } from '../src/session/journey';
import { City, Q } from './support/quittance';

// The Surveyor's Daughter (q_surveyor.kyr, prefix sd_). days are the clock's own: the first morning is day 1; the drill
// is the third day at ten, and the Guild's list closes at noon on the fifth.
const P = (...c: string[]) => ({ party: c.map((classId, i) => ({ name: `M${i}`, raceId: 'human', classId })) });
const begin = async (seed = 'b', ...classes: string[]) => {
  const j = await City.start(seed, P(...(classes.length ? classes : ['bard', 'warrior', 'cleric']))); await j.play(...City.honest); return j;
};
const warmth = (j: Journey) => j.measure(Q('sd_warmth'), Q('ianthe'));
const rel = (j: Journey, r: string) => City.has(j, r, 'party');
const held = (j: Journey) => j.choices().some(c => /roll extract|extract of the Surveyors/i.test(c.label));
// The Guild by day: learn she has not written it, learn of the Rider, learn of the garden wall, then tell Tobias where
// she sits.
const learn = ['=day 2 10:00', '>quittance__guild_hall', 'Ask Mr Tinniswood about the Pargeters', 'Ask whether a surveyor has ever passed',
  'Ask Mr Tinniswood about the loose brick'];
const invite = ['>quittance__pargeter_front', 'Tell Tobias where Ianthe'];
const model = ['>quittance__guild_hall', 'Press five coin', '=day 2 11:00'];
const gallery = ['>quittance__guild_hall', 'Ask Mr Tinniswood to lend', '=day 2 12:00', '>quittance__belvedere', 'Set the Guild', '=day 2 17:30'];

describe("The Surveyor's Daughter", () => {
  it('is found from the Slate, the Guild board, the study and the clerk', async () => {
    const j = await begin();
    expect(City.knows(j, 'sd_claim')).toBe(false);
    await j.play('=day 2 09:00', '>quittance__slip_room');
    expect(City.knows(j, 'sd_claim')).toBe(true);
    const k = await begin();
    await k.play('>quittance__guild_hall');
    expect(City.knows(k, 'sd_unwritten')).toBe(true);
    const m = await begin();
    await m.play('>quittance__corbett_study');
    expect(City.knows(m, 'sd_unwritten')).toBe(true);
    expect(City.knows(m, 'd_ianthe_met')).toBe(true);
  }, 120000);

  it('keeps hours: the Guild by day, the lantern gallery at dusk, the study by night', async () => {
    const j = await begin();
    await j.play('=day 2 10:00');
    expect(j.at(Q('ianthe'))).toBe(Q('guild_hall'));
    await j.play('=day 2 17:30');
    expect(j.at(Q('ianthe'))).toBe(Q('sd_lantern'));
    await j.play('=day 2 21:00');
    expect(j.at(Q('ianthe'))).toBe(Q('corbett_study'));
  }, 120000);

  it('honest: the model by coin, the gallery by ladder, the Rider, the flue by brawn; the Roll, the stand and the hearth follow', async () => {
    const j = await begin();
    await j.play(...learn, ...invite, ...model);
    expect(warmth(j)).toBe(1);
    expect(rel(j, 'sd_beat2')).toBe(true);
    await j.play(...gallery);
    expect(warmth(j)).toBe(2);
    expect(rel(j, 'sd_beat1')).toBe(true);
    expect(j.at(Q('tobias'))).toBe(Q('sd_lantern'));
    // The Rider is shown to a woman who has by now some reason to hear it.
    await j.play('=day 2 21:00', '>quittance__corbett_study', 'Ask Ianthe about the Pargeters', 'Show Ianthe the Hargreave Rider');
    expect(rel(j, 'sd_rider_offered')).toBe(true);
    expect(City.arc(j, 'ianthe')).toBe(0);
    // She will not sign it for a flue that is cracked.
    expect(j.choices().some(c => /Tell Ianthe the flue is rebuilt/.test(c.label))).toBe(false);
    await j.play('>quittance__dyers_alley', 'Take down the cracked course', '>quittance__corbett_study', 'Tell Ianthe the flue is rebuilt');
    expect(City.arc(j, 'ianthe')).toBe(1);
    expect(City.state(j, 'sd_survey', 'rider')).toBe(true);
    expect(City.state(j, 'sd_flue', 'mended')).toBe(true);
    expect(rel(j, 'sd_end_honest')).toBe(true);
    expect(rel(j, 'tobiasWilling')).toBe(true);
    expect(City.regard(j, 'brigades')).toBe(1);
    // What she then gives: the page of the Roll, her word, and the hearth of the house.
    await j.play('Ask Ianthe, who has the Roll');
    expect(City.knows(j, 'd_decline_roll')).toBe(true);
    expect(held(j)).toBe(true);
    await j.play('Ask whether Ianthe would stand');
    expect(j.holds(Q('witness'), Q('ianthe'))).toBe(true);
    await j.play('Ask Mrs Corbett whether the study');
    expect(j.holds(Q('keeper'), Q('hill'))).toBe(true);
    // And it lasts: the study is told differently, and so is the Pargeters' room.
    await j.play('>quittance__hill_street', '>quittance__corbett_study');
    expect(City.page(j)).toContain('PASSED, subject to repair');
    await j.play('>quittance__pargeter_front');
    expect(City.page(j)).toContain('Rider, framed');
    // A fresh page: Ianthe does not repeat the first greeting.
    await j.play('=day 4 10:00', '>quittance__guild_hall');
    expect(j.at(Q('ianthe'))).toBe(Q('guild_hall'));
  }, 300000);

  it('without the clerk bribed, a fireman is turned away from the model', async () => {
    const j = await begin();
    await j.play(...learn, ...invite, '=day 2 11:00', '>quittance__hill_street');
    expect(j.at(Q('tobias'))).toBe(Q('hill_street'));
    expect(warmth(j)).toBe(0);
    await j.play('=day 2 14:00');
    expect(rel(j, 'sd_beat2')).toBe(false);
    expect(City.pages(j, 0)).toContain('are not admitted to the model');
  }, 120000);

  it('a climber does without the ladder, and a licence does without the coin', async () => {
    const j = await begin('b', 'bard', 'monk', 'thief');
    await j.play(...City.slip.slice(3), ...learn, ...invite, '>quittance__guild_hall', 'Show Mr Tinniswood your adjuster', '=day 2 11:00');
    expect(rel(j, 'sd_beat2')).toBe(true);
    expect(City.gold(j)).toBeGreaterThanOrEqual(12);
    await j.play('>quittance__belvedere', '=day 2 16:30');
    expect(j.choices().some(c => /Set the Guild/.test(c.label))).toBe(false);
    await j.play('Go up the drainpipe', '=day 2 17:30');
    expect(rel(j, 'sd_beat1')).toBe(true);
    expect(warmth(j)).toBe(2);
    // The gallery is only for those who can reach it: the party can follow, and is told of the view.
    await j.play('^To the lantern gallery');
    expect(j.at('party')).toBe(Q('sd_lantern'));
  }, 200000);

  it('persuading the clerk is a try, and its failure shuts that door but not the others', async () => {
    let failed = false;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const j = await begin(seed, 'warrior', 'cleric', 'ranger');
      await j.play(...learn, '>quittance__guild_hall');
      await j.play('Put it to Mr Tinniswood');
      if (!rel(j, 'sd_cleared')) {
        failed = true;
        expect(rel(j, 'sd_caught')).toBe(true);
        expect(j.choices().some(c => /Press five coin/.test(c.label))).toBe(true);
        await j.play('Press five coin');
        expect(rel(j, 'sd_cleared')).toBe(true);
        break;
      }
    }
    expect(failed).toBe(true);
  }, 300000);

  it('a cold Rider: shown to her before she has any reason to listen, it moves nothing', async () => {
    const j = await begin();
    await j.play(...learn, '>quittance__guild_hall', '=day 2 21:00', '>quittance__corbett_study', 'Show Ianthe the Hargreave Rider');
    expect(City.arc(j, 'ianthe')).toBe(0);
    expect(rel(j, 'sd_rider_offered')).toBe(false);
    expect(City.pages(j, j.taken.length - 1)).toContain('Hargreave is dead');
  }, 200000);
});

describe("The Surveyor's Daughter, continued", () => {
  it('an unwritten Decline written by time alone: the lovers apart, the Pargeters uncovered', async () => {
    const j = await begin();
    await j.play('=day 5 11:00');
    expect(City.arc(j, 'ianthe')).toBe(0);
    await j.play('=day 5 13:00');
    expect(City.arc(j, 'ianthe')).toBe(1);
    expect(rel(j, 'sd_end_apart')).toBe(true);
    expect(rel(j, 'sd_pargeters_uncovered')).toBe(true);
    expect(rel(j, 'tobiasWilling')).toBe(false);
    expect(City.state(j, 'sd_survey', 'declined')).toBe(true);
    expect(rel(j, 'sd_end_honest')).toBe(false);
    await j.play('>quittance__pargeter_front');
    expect(City.page(j)).toContain('gilt bird has been taken down');
  }, 200000);

  it('the drill by the pin: Tobias told the truth, a ladder fallen, and a roof on which he says write it', async () => {
    const j = await begin('b', 'thief', 'bard', 'cleric');
    await j.play(...learn, '>quittance__pargeter_front', 'Tell Tobias that Ianthe has measured', '=day 3 08:00', '>quittance__hill_street', 'Draw the pin');
    expect(City.state(j, 'sd_pin', 'slipped')).toBe(true);
    expect(rel(j, 'sd_tobias_knows')).toBe(true);
    const from = j.taken.length;
    await j.play('=day 3 11:00');
    expect(rel(j, 'sd_stranded')).toBe(true);
    expect(City.said(j, from)).toContain("It's not a thing I want to be loved for");
    expect(City.arc(j, 'ianthe')).toBe(1);
    expect(rel(j, 'sd_end_declined')).toBe(true);
    expect(rel(j, 'sd_roof_honest')).toBe(true);
    expect(rel(j, 'sd_pargeters_uncovered')).toBe(true);
    expect(rel(j, 'tobiasWilling')).toBe(true);
    expect(City.state(j, 'sd_survey', 'declined')).toBe(true);
    expect(warmth(j)).toBe(1);
    // Her Roll, as a gift; but her word at the Hall is not hers to give on one warm afternoon.
    await j.play('=day 3 21:00', '>quittance__corbett_study', 'Ask Ianthe, who has the Roll');
    expect(City.knows(j, 'd_decline_roll')).toBe(true);
    expect(held(j)).toBe(true);
    expect(j.choices().some(c => /stand in the Hall of the Five/.test(c.label))).toBe(false);
    expect(City.regard(j, 'brigades')).toBe(0);
    await j.play('>quittance__pargeter_front');
    expect(City.page(j)).toContain('gilt bird has been taken down');
  }, 300000);

  it('the drill by the pump: a brawny company, no truth told: the roof is only a roof', async () => {
    const j = await begin('b', 'warrior', 'cleric', 'bard');
    await j.play('=day 3 08:00', '>quittance__hill_street', 'Throw your weight on the pump-handle');
    expect(City.state(j, 'sd_pump', 'burst')).toBe(true);
    await j.play('=day 3 11:00');
    expect(rel(j, 'sd_stranded')).toBe(true);
    expect(rel(j, 'sd_beat3')).toBe(true);
    expect(warmth(j)).toBe(1);
    expect(City.arc(j, 'ianthe')).toBe(0);
    expect(rel(j, 'sd_end_declined')).toBe(false);
    await j.play('=day 3 13:00');
    expect(City.state(j, 'sd_pump', 'steady')).toBe(true);
  }, 200000);

  it('the drill left alone goes right, in public, and nobody is warmed in private', async () => {
    const j = await begin();
    await j.play('=day 3 09:30', '>quittance__hill_street');
    const from = j.taken.length;
    await j.play('=day 3 11:30');
    expect(rel(j, 'sd_public')).toBe(true);
    expect(City.said(j, from)).toContain('perfectly regulation carry');
    expect(warmth(j)).toBe(0);
    expect(rel(j, 'sd_stranded')).toBe(false);
  }, 200000);

  it('the Pargeters say plainly what they know of the wall', async () => {
    const j = await begin();
    await j.play(...learn, '=day 3 10:30', '>quittance__hill_street', 'Ask Nathaniel Pargeter about the Guild', 'Ask Mrs Pargeter about the house');
    expect(City.pages(j, j.taken.length - 2)).toContain('put my thumb in it');
  }, 200000);

  it('elopement: two evenings warmed, a plan, a lighter; the lovers are gone, the career with them, and she leaves a page', async () => {
    const j = await begin();
    await j.play(...learn, ...invite, ...model, ...gallery);
    expect(warmth(j)).toBe(2);
    await j.play('=day 2 21:00', '>quittance__corbett_study', 'Offer, quietly, to help Ianthe and Tobias leave');
    expect(rel(j, 'sd_elope_plan')).toBe(true);
    expect(City.arc(j, 'ianthe')).toBe(0);
    await j.play('=day 3 16:30', '>quittance__lighter_stairs');
    await j.play('=day 3 17:00', 'Hire a lighterman');
    expect(rel(j, 'sd_gone')).toBe(true);
    expect(rel(j, 'sd_end_exiled')).toBe(true);
    expect(City.arc(j, 'ianthe')).toBe(1);
    expect(held(j)).toBe(true);
    expect(j.at(Q('ianthe'))).toBe(Q('nowhere'));
    expect(j.at(Q('tobias'))).toBe(Q('nowhere'));
    expect(rel(j, 'tobiasWilling')).toBe(false);
    await j.play('=day 5 13:00');
    expect(rel(j, 'sd_end_apart')).toBe(false);
    expect(j.at(Q('ianthe'))).toBe(Q('nowhere'));
    await j.play('>quittance__corbett_study');
    expect(City.page(j)).toContain('SOME ROOFS');
  }, 400000);

  it('forging the survey saves the house, and costs her; a caught forger costs the evening', async () => {
    const j = await begin('b', 'thief', 'bard', 'cleric');
    await j.play('>quittance__corbett_study', 'Add one word');
    expect(City.state(j, 'sd_survey', 'forged')).toBe(true);
    await j.play('=day 3 09:00');
    expect(rel(j, 'sd_end_forged')).toBe(true);
    expect(rel(j, 'tobiasWilling')).toBe(true);
    expect(rel(j, 'sd_slighted_guild')).toBe(true);
    expect(City.arc(j, 'ianthe')).toBe(0);
    expect(rel(j, 'sd_pargeters_uncovered')).toBe(false);
    await j.play('=day 3 17:30');
    expect(j.at(Q('ianthe'))).not.toBe(Q('sd_lantern'));
    await j.play('=day 5 13:00');
    expect(City.arc(j, 'ianthe')).toBe(0);
    expect(rel(j, 'sd_end_apart')).toBe(false);
    const k = await begin('a', 'thief', 'bard', 'cleric');
    await k.play('>quittance__corbett_study', 'Add one word');
    expect(City.state(k, 'sd_survey', 'forged')).toBe(false);
    expect(rel(k, 'sd_caught')).toBe(true);
    expect(rel(k, 'sd_slighted_guild')).toBe(true);
    expect(k.choices().some(c => /Add one word/.test(c.label))).toBe(false);
  }, 400000);
});
