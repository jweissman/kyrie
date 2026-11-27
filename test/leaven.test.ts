import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/leaven/journey.json';

// The Mild Intention, played by the labels a player sees. The company meets a baker and a sloop at the Maing quay,
// is berthed for fifteen coin or a pair of good ears, and crosses forty miles of the Pan in four legs (miles 0, 10, 20
// and 30). Each leg has one thin place in the crust, drawn when the module is installed by a Deem roll (1d3): the
// seed 'journey' draws 1, 3, 2, 'c' draws 1, 3, 1, 'k' draws 3, 1, 1 (side 1 is port, where Ysmay Dreel is deaf).
const campaign = 'data/campaigns/leaven.campaign.json';
const S: typeof steps & Record<string, string[]> = steps;
describe('The Mild Intention', () => {
  const start = async (seed: string, ...parts: string[]) => {
    const j = await Journey.start(campaign, seed);
    await j.play(...S.arrive!);
    for (const p of parts) { await j.play(...S[p]!); }
    return j;
  };
  const ended = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
  // Everything a careful crew does before the first mile: hire, supply, board, learn of the ear, bank the stove.
  const crew = ['hire', 'supplies', 'board', 'ear', 'stove'];
  // The whole crossing as the kind company sails it: ears on every leg, the Mother fed in the dead air, a share given.
  const kind = [...crew, 'legOne', 'legTwo', 'feed', 'furl', 'share', 'ears', 'hoist', 'legThree', 'run'];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('draws a different crust for a different seed', async () => {
    const thin = async (seed: string) => { const j = await Journey.start(campaign, seed); return [1, 2, 3].map(n => j.measure('thin' + n)); };
    expect(await thin('journey')).toEqual([1, 3, 2]);
    expect(await thin('k')).toEqual([3, 1, 1]);
  }, 120000);

  it('Ysmay will not carry anyone the baker has not vouched for, and says so', async () => {
    const j = await start('journey');
    await j.play('To the deck of the Mild Intention');
    expect(j.matches('Sail on').length).toBe(0);
    expect(j.matches('Pay Ysmay').length).toBe(0);
    await j.play('Ask Ysmay for a berth');
    expect(j.holds('berthed', 'party')).toBe(false);
    expect(j.page).toMatch(/Ask him/);
  }, 120000);

  it('a good ear earns the berth, if the dice allow, and a miss costs only the fare', async () => {
    const j = await start('journey', 'hire');
    await j.play('To the deck of the Mild Intention');
    j.roll('fail');
    await j.play('Lay your ear to the quay');
    expect(j.holds('berthed', 'party')).toBe(false);
    j.roll('pass');
    await j.play('Lay your ear to the quay');
    expect(j.holds('berthed', 'party')).toBe(true);
    expect(j.at('avert')).toMatch(/deck/);
  }, 120000);

  it('the ear is learned three ways before the Pan, and Ysmay yields only to someone who knows', async () => {
    const j = await start('journey', 'hire', 'board');
    expect(j.matches('Tell Ysmay you will be her left ear').length).toBe(0);
    await j.play('Ask Rabin why Ysmay sits sideways');
    expect(j.holds('knows', 'party', 'ear_known')).toBe(true);
    await j.play('Tell Ysmay you will be her left ear');
    expect(j.holds('ysmayYields', 'party')).toBe(true);
    const g = await start('journey');
    await g.play('Ask Gert about Ysmay Dreel');
    expect(g.holds('knows', 'party', 'ear_known')).toBe(true);
  }, 120000);

  it('sailing as Ysmay calls it, over thin crust to port, holes the hull; a patch mends it', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board');
    await j.play('Sail on as Ysmay calls it');
    expect(j.holds('state', 'hull', 'holed')).toBe(true);
    expect(j.measure('mile')).toBe(10);
    await j.play('Patch the hull');
    expect(j.holds('state', 'hull', 'sound')).toBe(true);
  }, 120000);

  it('Ysmay says quiet where the crust is thin, and a pilot should know that a quiet Pan lies', async () => {
    const j = await start('journey', 'hire', 'board', 'ear');
    await j.play('Ask Ysmay what she hears');
    expect(j.page).toMatch(/Quiet/);
    await j.play('Ask Rabin whether the Pan is ever quiet');
    expect(j.page).toMatch(/lying Pan/);
  }, 120000);

  it('told bluntly she is deaf, Ysmay may close up, and then only the Weatherwife can bring her round', async () => {
    const j = await start('journey', 'hire', 'board');
    j.roll('fail');
    await j.play('Tell Ysmay she is deaf on the port side');
    expect(j.holds('ysmayCold', 'party')).toBe(true);
    expect(j.matches('Tell Ysmay you will be her left ear').length).toBe(0);
  }, 120000);

  it('listening twice at one place tells nothing new, and each leg wants its own listening', async () => {
    const j = await start('journey', 'hire', 'board', 'ear');
    await j.play('Lie flat on the deck');
    expect(j.matches('Lie flat').length).toBe(0);
    await j.play('Take the sloop out along the hollow');
    expect(j.matches('Lie flat').length).toBe(1);
  }, 120000);

  it('the kind crossing: ears, a fed Mother, a share and Holin as the second ear: Two Pots', async () => {
    const j = await start('journey', ...kind);
    expect(ended(j)).toEqual(['leaven__two_pots']);
    expect(j.page).toMatch(/You are still in my wind/);
    expect(j.page).toMatch(/thief/);
    expect(j.holds('holinAboard', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'mi_heel')).toBe(true);
  }, 240000);

  it('Holin will not take the share until she has been told whose bread the Mother is, or has been pressed, if the dice allow', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board', 'ear', 'stove', 'legOne', 'legTwo', 'feed', 'furl');
    await j.play('Ask Avert how Corsey', 'Ask Holin what she wants', 'Ask Avert to cut a share');
    expect(j.matches('Offer the Weatherwife a share').length).toBe(0);
    j.roll('fail');
    await j.play('Press the share on Holin');
    expect(j.holds('holinWilling', 'party')).toBe(false);
    j.roll('pass');
    await j.play('Press the share on Holin', 'Offer the Weatherwife a share');
    expect(j.holds('cutGiven', 'party')).toBe(true);
  }, 240000);

  it('Avert gives a share unasked-for only to someone who knows what Corsey did; the unknowing must argue', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board', 'ear', 'stove', 'legOne', 'legTwo', 'feed', 'furl');
    await j.play('Ask Holin what she wants');
    expect(j.matches('Ask Avert to cut a share').length).toBe(1);
    j.roll('fail');
    await j.play('Ask Avert to cut a share');
    expect(j.holds('avertYields', 'party')).toBe(false);
    j.roll('pass');
    await j.play('Ask Avert to cut a share');
    expect(j.holds('avertYields', 'party')).toBe(true);
  }, 240000);

  it('the toll road: thirty coin and Holin goes, and the Mother reaches Corsey without a pot to follow: Corsey Rises', async () => {
    const j = await start('journey', ...crew, 'legOne', 'legTwo', 'feed', 'furl');
    j.coin(60);
    await j.play('Pay the Weatherwife thirty coin', ...S.hoist!, ...S.legThree!, ...S.run!);
    expect(j.holds('tolled', 'party')).toBe(true);
    expect(ended(j)).toEqual(['leaven__corsey_rises']);
  }, 240000);

  it('the wager pays thirty-two on landing a living Mother, forty from the baker, and the heel of a loaf: Corsey Rises', async () => {
    const j = await start('d', 'hire');
    j.coin(100);
    await j.play('Into the Dry Mooring', 'Lay ten coin on the Mild Intention', 'Out to the');
    expect(j.holds('wagered', 'party')).toBe(true);
    await j.play(...S.supplies!, ...S.board!, ...S.stove!, 'Sail on as Ysmay calls it', 'Sail on as Ysmay calls it', ...S.feed!, ...S.furl!, 'Pay the Weatherwife thirty coin', ...S.hoist!, 'Sail on as Ysmay calls it', ...S.run!);
    expect(ended(j)).toEqual(['leaven__corsey_rises']);
    expect(j.page).toMatch(/I have rubbed out the nine/);
    expect(j.page).toMatch(/forty coin/);
    expect(j.holds('holding', 'party', 'mi_heel')).toBe(true);
  }, 240000);

  it('without the stove, the Pan cools in the dead air and the Mother sulks instead of rising', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board', 'ear', 'legOne', 'legTwo', 'feed', 'furl');
    expect(j.holds('state', 'mother', 'sluggish')).toBe(true);
    expect(j.page).not.toMatch(/rising to it/);
  }, 240000);

  it('with the stove lit she rises to the song, and the company may hum it back: the ear is heard too', async () => {
    const j = await start('d', 'hire', 'supplies', 'board', 'stove');
    await j.play('Sail on as Ysmay calls it', 'Sail on as Ysmay calls it', ...S.feed!, ...S.furl!);
    expect(j.page).toMatch(/rising to it/);
    expect(j.holds('knows', 'party', 'ear_known')).toBe(false);
    await j.play('Hum the Pan');
    expect(j.holds('state', 'song', 'answered')).toBe(true);
    expect(j.holds('knows', 'party', 'ear_known')).toBe(true);
  }, 240000);

  it('an unfed Mother is dead by the time she is carried across: with a share given, the thief\'s pot is the one that is baked: The Thief\'s Pot', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board', 'ear', 'stove');
    await j.play('=270');
    expect(j.holds('state', 'mother', 'spoiled')).toBe(true);
    await j.play(...S.legOne!, ...S.legTwo!, ...S.furl!, ...S.share!, ...S.hoist!, ...S.legThree!, ...S.run!);
    expect(ended(j)).toEqual(['leaven__sister_pot']);
    expect(j.page).toMatch(/It is the first thing he has said to a thief/);
  }, 240000);

  it('an unfed Mother and no share: Flat Cakes', async () => {
    const j = await start('journey', 'hire', 'supplies', 'board', 'ear', 'stove');
    j.coin(60);
    await j.play('=270', ...S.legOne!, ...S.legTwo!, ...S.furl!, 'Pay the Weatherwife thirty coin', ...S.hoist!, ...S.legThree!, ...S.run!);
    expect(ended(j)).toEqual(['leaven__flat_cakes']);
  }, 240000);

  it('two bad legs in a row without a patch wreck her: Into the Eye', async () => {
    const j = await start('k', 'hire', 'supplies', 'board');
    j.coin(60);
    await j.play('Sail on as Ysmay calls it', 'Sail on as Ysmay calls it', ...S.furl!, 'Pay the Weatherwife thirty coin', ...S.hoist!);
    expect(j.holds('state', 'hull', 'holed')).toBe(true);
    await j.play('Sail on as Ysmay calls it');
    expect(ended(j)).toEqual(['leaven__into_the_eye']);
  }, 240000);

  it('a patch between two bad legs saves the hull', async () => {
    const j = await start('c', 'hire', 'supplies', 'board');
    j.coin(60);
    await j.play('Sail on as Ysmay calls it', 'Patch the hull', 'Sail on as Ysmay calls it', ...S.furl!, 'Pay the Weatherwife thirty coin', ...S.hoist!);
    expect(j.holds('state', 'hull', 'sound')).toBe(true);
    await j.play('Sail on as Ysmay calls it');
    expect(j.holds('state', 'hull', 'holed')).toBe(true);
    expect(ended(j)).toEqual([]);
  }, 240000);

  it('drawing steel on the Weatherwife brings her hand over the rail, and a lone company may win it, if the dice allow: Corsey Rises', async () => {
    const j = await start('journey', ...crew, 'legOne', 'legTwo', 'feed', 'furl');
    await j.fight('Draw steel on the Weatherwife');
    expect(j.holds('holinFought', 'party')).toBe(true);
    expect(j.holds('holinSettled', 'party')).toBe(true);
    expect(j.holds('dead', 'reavers')).toBe(true);
    await j.play(...S.hoist!, ...S.legThree!, ...S.run!);
    expect(ended(j)).toEqual(['leaven__corsey_rises']);
    expect(j.page).toMatch(/no smoke on it/);
  }, 240000);
});
