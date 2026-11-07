import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { Endings } from '../src/lang/endings';
import { PlaySession } from '../src/session/play-session';
import steps from './fixtures/skerrow/journey.json';

// The Light on Skerrow Holm, played from the road end by the labels a player sees: no teleports. Each journey is a
// different night, and each ends in a different place (doc/adventures/anthology/skerrow.md).
describe('The Light on Skerrow Holm', () => {
  const campaign = 'data/campaigns/skerrow.campaign.json';
  const start = () => Journey.start(campaign, 'skerrow');
  const reached = (j: Journey) => Endings.reached(j.campaign.world)?.title;

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('keeps its sands: the causeway is shut in the morning, and a party crossing at eleven in fog without a line is lost in it', async () => {
    const j = await start();
    expect(j.find('To the middle of the causeway')).toBeUndefined();
    await j.play('=11:00', 'To the middle of the causeway');
    expect(j.holds('lostTold', 'party')).toBe(true);
  }, 120000);

  it('ends in Everyone Out: the lovers speak, the keeper comes, the boy knows the posts', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, '=06:30');
    expect(j.holds('orrinDeclared', 'party')).toBe(true);
    expect(j.holds('hettieKept', 'party')).toBe(true);
    expect(j.holds('dibTaken', 'party')).toBe(false);
    expect(j.holds('gaffTaken', 'party')).toBe(false);
    await j.play(...steps.morning_comes, ...steps.cross_out);
    expect(j.holds('crossed', 'party')).toBe(true);
    expect(reached(j)).toBe('Everyone Out');
  }, 290000);

  it('ends with The Light Going On: the lovers stay, and the company crosses alone', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, '=06:30', ...steps.morning_stays, ...steps.cross_out);
    expect(j.holds('crossed', 'party')).toBe(true);
    expect(j.holds('orrinComes', 'party')).toBe(false);
    expect(reached(j)).toBe('The Light Goes On');
  }, 290000);

  it('ends Alive, and Apart: Hettie is held through the night by a hand, and Seddon never says it', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, '=23:30');
    j.roll('pass');
    await j.play(...steps.hold_hettie, '=06:30', ...steps.morning_stays, ...steps.cross_out);
    expect(j.holds('hettieKept', 'party')).toBe(true);
    expect(j.holds('orrinDeclared', 'party')).toBe(false);
    expect(reached(j)).toBe('Alive, and Apart');
  }, 290000);

  it('ends in The Keeper\'s Light: nobody stops Hettie, and the keeper keeps his post', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, '=06:30');
    expect(j.holds('hettieTaken', 'party')).toBe(true);
    expect(j.holds('orrinTaken', 'party')).toBe(false);
    await j.play(...steps.morning_stays, ...steps.cross_out);
    expect(reached(j)).toBe("The Keeper's Light");
  }, 290000);

  it('ends Down to the Water: he has said it, and it was not enough to hold her', async () => {
    const j = await start();
    await j.play(...steps.cross_in, 'Answer Seddon\'s question about the night', 'We can. Say what we\'re to do',
      'Hear what Hettie asks you over the tea', 'No. They are gone', 'Ask Hettie why she comes to this rock',
      'Take Gaff\'s question', 'Tell him she was right, and mean it',
      'Let Dib show you what he found', 'I\'d want to. Stay by me tonight, and we\'ll listen together');
    j.roll('pass');
    await j.play(...steps.declare_in_kitchen, '=06:30');
    expect(j.holds('orrinTaken', 'party')).toBe(true);
    expect(j.holds('hettieTaken', 'party')).toBe(true);
  }, 290000);

  it('survives two nights at the lamp, and sees the second dawn', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, '=06:30', '=20:00', '=06:30');
    expect(j.holds('crossed', 'party')).toBe(false);
    expect(reached(j)).toBe('The Second Dawn');
  }, 290000);

  it('lets the rope-seller carry the news: Corrie tells it, and the keeper can be handed the notice', async () => {
    const j = await start();
    await j.play(...steps.cross_in, 'Ask Corrie Fenwether what else she carries besides cord');
    expect(j.holds('corrieTold', 'party')).toBe(true);
    expect(j.find("Put the Board's notice into Seddon's hand, and stay while he reads it")).toBeDefined();
  }, 120000);

  it('is kept across a save', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('hettieSecret', 'party')).toBe(true);
    expect(reached(j)).toBeUndefined();
  }, 120000);
});
