import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/pitchpass/journey.json';

// The Pitch of the Glass, played by the labels a player sees. The company starts at dawn at Stairfoot; the Cut plays
// from ten in the morning to six at night; the mirror must be carried over it and lifted to the sun at the Saddle.
const campaign = 'data/campaigns/pitchpass.campaign.json';
const S: typeof steps & Record<string, string[]> = steps;
describe("The Pitch of the Glass", () => {
  const start = async (...parts: string[]) => {
    const j = await Journey.start(campaign, "pitchpass");
    await j.play(...S.arrive);
    for (const p of parts) { await j.play(...S[p]!); }
    return j;
  };
  const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
  const pipes = ['first', 'second', 'third', 'fourth'];
  const rightPipe = (j: Journey) => 'Unstop the ' + pipes[j.measure('pitch', 'crate') - 1] + ' pipe';

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('Gnomon blocks the fourth turn until he is given a ration', async () => {
    const j = await start('toTurns');
    expect(j.takes('To Lintern')).toBe(false);
    await j.play('give Gnomon a ration');
    expect(j.takes('To Lintern')).toBe(true);
  }, 60000);

  it('the train follows the company up the stair', async () => {
    const j = await start('toTurns', 'toCairn');
    expect(j.at('crate')).toBe('pitchpass__cairn');
    expect(j.at('marta')).toBe('pitchpass__cairn');
  }, 60000);

  it('Nesta admits the glass was ground to a tune; Lintern will not set the pipes until he knows the note', async () => {
    const j = await start('nesta', 'toTurns', 'toCairn', 'lintern');
    expect(j.matches('Unstop the').length).toBe(0);
    await j.play('Tell Lintern the glass rings like pipe');
    expect(j.holds('hobHelps', 'party')).toBe(true);
    expect(j.matches('Unstop the').length).toBe(4);
  }, 120000);

  it('a wrong pipe is sour, and loses nothing', async () => {
    const j = await start('nesta', 'toTurns', 'toCairn', 'lintern', 'note');
    const wrong = pipes.find((_, i) => i + 1 !== j.measure('pitch', 'crate'))!;
    const told = await j.play('Unstop the ' + wrong + ' pipe');
    expect(told).toMatch(/sour/);
    expect(j.holds('state', 'stops', 'plain')).toBe(true);
  }, 120000);

  it('The Chord: the pipes are set to the glass and the train crosses in the wind', async () => {
    const j = await start('nesta', 'toTurns', 'toCairn', 'lintern', 'note');
    await j.play(rightPipe(j), 'To the mouth of the Cut', 'Lead the train through the Cut under the chord', 'To the Cold Saddle', 'Make camp', ...S.sun);
    expect(reached(j).join()).toMatch(/the_chord/);
  }, 120000);

  it('A Year\'s Silence: the pipes are plugged at Lintern\'s mallet and the train crosses before the fog', async () => {
    const j = await start('nesta', 'ring', 'toTurns', 'toCairn', 'stop');
    expect(j.holds('state', 'stops', 'plugged')).toBe(true);
    await j.play('To the mouth of the Cut', 'Lead the train through the Cut', 'To the Cold Saddle', 'Make camp', ...S.sun);
    expect(reached(j).join()).toMatch(/the_quiet_year/);
  }, 120000);

  it('plugged pipes and a fog: nobody takes mules into a dumb Cut', async () => {
    const j = await start('nesta', 'ring', 'toTurns', 'toCairn', 'stop');
    await j.play('To the mouth of the Cut', '=until fogUp()');
    expect(j.matches('Lead the train through the Cut').length).toBe(0);
  }, 120000);

  it('The Wool: more fleece in the crate, and the train crosses in the wind', async () => {
    const j = await start('wool', 'toTurns', 'toCairn');
    await j.play('To the mouth of the Cut', 'Lead the train through the Cut', 'To the Cold Saddle', 'Make camp', ...S.sun);
    expect(reached(j).join()).toMatch(/the_wool/);
  }, 120000);

  it('The Wool, patiently: waiting for dusk makes the crossing safe too', async () => {
    const j = await start('toTurns', 'toCairn');
    await j.play('To the mouth of the Cut');
    expect(j.matches('Lead the train through the Cut in the wind').length).toBe(1);
    await j.play('=until fogUp()', 'Lead the train through the Cut');
    expect(j.holds('state', 'crate', 'sound')).toBe(true);
  }, 120000);

  it('The Seam: the rash crossing cracks the glass, and the mirror is still lifted', async () => {
    const j = await start('toTurns', 'toCairn');
    await j.play('To the mouth of the Cut', 'Lead the train through the Cut in the wind', 'To the Cold Saddle', 'Make camp', ...S.sun);
    expect(reached(j).join()).toMatch(/the_seam/);
  }, 120000);

  it('Forty Crowns: Lathe\'s money buys the lashing cut on the ledge', async () => {
    const j = await start('lathe', 'toTurns', 'toCairn');
    expect(j.holds('lathePaid', 'party')).toBe(true);
    await j.play('To the mouth of the Cut', '=until fogUp()', 'Lead the train through the Cut', 'Cut the crate');
    expect(reached(j).join()).toMatch(/forty_crowns/);
  }, 120000);

  it('Marta can be told where Lintern was, once Lintern has said it: it changes the chord ending\'s grey hour', async () => {
    const j = await start('nesta', 'toTurns', 'toCairn', 'lintern', 'note');
    expect(j.matches('Tell Marta the keeper').length).toBe(0);
    await j.play('Ask Marta about the crossing', 'Ask Marta why she will not', 'Ask Lintern about the winter', 'To the Seven Turns', 'Tell Marta the keeper', 'To Lintern');
    expect(j.holds('martaKnows', 'party')).toBe(true);
    await j.play(rightPipe(j), 'To the mouth of the Cut', 'Lead the train through the Cut under the chord', 'To the Cold Saddle', 'Make camp', 'Take the fleeces off the crate');
    expect(j.holds('fateTold', 'lintern')).toBe(true);
  }, 120000);

  // Mended at integration (a placed world goes on after the ending): the Cut is a way on foot once the train is over,
  // so a company on the far side can go back down the Stair, and the train waits where it was brought.
  it('once the train is over, the Cut is walked back on foot, and the train waits on the far side', async () => {
    const j = await start('wool', 'toTurns', 'toCairn');
    expect(j.matches('To the Shelf').length).toBe(0);
    await j.play('To the mouth of the Cut', 'Lead the train through the Cut');
    await j.play('To the mouth of the Cut');
    expect(j.at('party')).toBe('pitchpass__cut_mouth');
    expect(j.at('crate')).toBe('pitchpass__ledge');
    expect(j.matches('Lead the train through the Cut').length).toBe(0);
    await j.play("To Lintern's cairn", 'To the Seven Turns');
    expect(j.at('marta')).toBe('pitchpass__ledge');
    await j.play("To Lintern's cairn", 'To the mouth of the Cut', 'To the Shelf', 'To the Cold Saddle');
    expect(j.at('crate')).toBe('pitchpass__saddle');
  }, 120000);

  it('the talk that tells is kept: Lathe asked, the Shelf shows his place to a company that took nothing', async () => {
    const j = await start('latheNo', 'wool', 'toTurns', 'toCairn');
    expect(j.holds('knows', 'party', 'lathe_known')).toBe(true);
    await j.play('To the mouth of the Cut', 'Lead the train through the Cut');
    expect(j.seen()).toMatch(/Lathe would have meant/);
  }, 120000);

  it('Lathe can be refused, and nothing is cut', async () => {
    const j = await start('latheNo', 'toTurns', 'toCairn');
    expect(j.holds('lathePaid', 'party')).toBe(false);
  }, 60000);
});
