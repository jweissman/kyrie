import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';

// The Wrong Boat, played by the labels a player sees. Each journey is a different way for it to end: nobody is
// asked to prove anything to anybody. A distance is closed or kept open by time, and time is spent by waiting.
describe('The Wrong Boat', () => {
  const campaign = 'data/campaigns/wrongboat.campaign.json';
  const start = ['To the Staithe quay', 'Say which barge you paid for', 'The Mary, I think', 'Look under the cloth in the hamper',
    'To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each'];
  const toMill = ['=+155', 'To the head of the mill-race', 'To the mill yard'];
  const toGap = ['To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves',
    'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills'];
  const ended = (told: string, title: string) => expect(told).toContain(title);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('ends in the Lowther kitchen if the box is put in her hands at the fen landing', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, '=+40', 'To the fen landing', '=+25');
    expect(j.holds('confronted', 'party')).toBe(true);
    const told = await j.play('Hear what Bess has to say', 'Put the box in her hands');
    ended(told, 'as if it might spill');
  }, 200000);

  it('ends clean, for the weir, if the lads are left to the relief sluice and the ferrywoman is paid', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...toMill, 'To the sluice hut', 'Spin the wheel and open the relief', 'To the mill yard', 'To the weir');
    expect(j.holds('ladsSwept', 'party')).toBe(true);
    const told = await j.play(...toGap);
    ended(told, 'clean, mean little victory');
  }, 250000);

  it('ends with the box sold and fifty coin if it is carried to the horse lines and no further', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, '=+90', 'To Pelham quay', 'To Pelham fairground', 'To the horse lines',
      'Sell the music box to the horse-dealer for fifty coin, no questions');
    expect(j.holds('soldHonest', 'party')).toBe(true);
    await j.play('To the mill yard', 'To the sluice hut', 'Spin the wheel and open the relief', 'To the mill yard', 'To the weir');
    const told = await j.play(...toGap);
    ended(told, 'fifty coin and nobody behind you');
  }, 250000);

  it('ends in a bad bargain at the fair if a gentleman in flight is offered the box for his horse', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in flight',
      'Ask Mr Peregrine Dally to join the company', 'To the deck of the Mary', '=+90', 'To Pelham quay', 'To Pelham fairground',
      'To the horse lines', 'Trade the music box to Mr Dally for his horse, Parnassus');
    ended(j.taken.at(-1)!.told, 'long-faced bay');
  }, 250000);

  it('ends without a friend if Shim, who was told to go to the one wronged, will not go on', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'Ask Shim whose side he is on', 'Tell him you\'d go to the one wronged',
      'Ask Shim Garrod to join the company', ...toMill, 'To the sluice hut', 'Spin the wheel and open the relief',
      'To the mill yard', 'To the weir', ...toGap.slice(0, -1));
    const told = await j.play('To the gap in the hills');
    ended(told, 'the boy who shouted the news');
  }, 250000);

  it('ends taken at the stage if the box is given to the lads rather than fought for', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...toMill, 'To the weir');
    const told = await j.play('Give the box up to the lads');
    ended(told, 'wet patch on the stone');
  }, 250000);

  it('ends in the Last Pint if the box is sold to the man who was to have bought it', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...toMill, 'To the sluice hut', 'Spin the wheel and open the relief', 'To the mill yard', 'To the weir',
      ...toGap.slice(0, -1).filter(s => s !== 'To the foot of the hill road'), 'To the foot of the hill road', 'Into the Last Pint',
      'Ask Mr Fosse what he wants with a music box', 'Say you are the seller and want forty');
    ended(j.taken.at(-1)!.told, 'shelf of stopped clocks');
  }, 250000);

  it('lets Bess walk with the company to the gap, and keeps that across a save', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, '=+40', 'To the fen landing', '=+25', 'Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
    expect(j.holds('bessAlly', 'party')).toBe(true);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('bessAlly', 'party')).toBe(true);
  }, 250000);
});
