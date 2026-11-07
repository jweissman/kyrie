import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';
import steps from './fixtures/skerrow/journey.json';

// The Light on Skerrow Holm, played from the road end by the labels a player sees: no teleports. Each journey is a
// different night, and each ends in a different place (doc/adventures/anthology/skerrow.md).
describe('The Light on Skerrow Holm', () => {
  const campaign = 'data/campaigns/skerrow.campaign.json';
  const start = () => Journey.start(campaign, 'skerrow');
  const reached = (j: Journey) => Endings.reached(j.campaign.world)?.title;
  const fill = 'Fill the lamp from a flask out of the store';
  // The lamp goes out at three. One flask then keeps it from the dark rooms and still lets the calls come; the second is for the dawn.
  const night = ['=03:20', fill, '=05:10', fill, '=06:30'];
  const nightFromKitchen = ['=03:10', ...steps.to_lamp, fill, '=05:10', fill, '=06:30'];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('keeps its sands: the causeway is shut in the morning, and a party crossing at eleven in fog without a line is lost in it', async () => {
    const j = await start();
    expect(j.find('To the middle of the causeway')).toBeUndefined();
    await j.play('=11:00', 'To the middle of the causeway');
    expect(j.holds('lostTold', 'party')).toBe(true);
  }, 120000);

  it('is a hunt, not a button: the thing cannot be fought, only knocks while the lamp is bright, and answers to the lamp when it sinks', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    expect(j.find('Answer the voice by your own name')).toBeUndefined();
    expect(j.find('Throw holy water where the hands are opening')).toBeUndefined();
    await j.play(...steps.to_lamp, '=22:00');
    expect(j.holds('state', 'lamp', 'bright')).toBe(true);
    expect(j.measure('callN', 'tide')).toBe(0);
    await j.play('=02:00', '=until at(caller, keeper_room)');
    expect(j.holds('state', 'lamp', 'low')).toBe(true);
    expect(j.measure('callN', 'tide')).toBeGreaterThan(0);
    await j.play(fill, fill);
    expect(j.holds('state', 'lamp', 'bright')).toBe(true);
    await j.play('=until at(caller, cistern)');
  }, 200000);

  it('lets a dark lamp kill: a party that leaves the lamp out loses one of its own', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, ...steps.to_lamp, '=08:00');
    expect(j.campaign.fighters.filter(f => f.hp > 0).length).toBeLessThan(3);
  }, 200000);

  it('ends in Everyone Out: the lovers speak, the keeper comes, the boy knows the posts', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, ...night);
    expect(j.holds('orrinDeclared', 'party')).toBe(true);
    expect(j.holds('hettieKept', 'party')).toBe(true);
    expect(j.holds('dibTaken', 'party')).toBe(false);
    expect(j.holds('gaffTaken', 'party')).toBe(false);
    expect(j.holds('corrieLost', 'party')).toBe(false);
    await j.play(...steps.morning_comes, ...steps.cross_out);
    expect(j.holds('crossed', 'party')).toBe(true);
    expect(reached(j)).toBe('Everyone Out');
  }, 290000);

  it('ends Together, and the Rest Lost: Gaff is encouraged to be loud, and answers the first call', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk_loud);
    j.roll('pass');
    await j.play(...steps.lovers, ...night);
    expect(j.holds('gaffTaken', 'party')).toBe(true);
    await j.play(...steps.morning_comes, ...steps.cross_out);
    expect(reached(j)).toBe('Together, and the Rest Lost');
  }, 290000);

  it('ends with The Light Going On: the lovers stay, and the company crosses alone', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, ...night, ...steps.morning_stays, ...steps.cross_out);
    expect(j.holds('crossed', 'party')).toBe(true);
    expect(j.holds('orrinComes', 'party')).toBe(false);
    expect(reached(j)).toBe('The Light Goes On');
  }, 290000);

  it('ends Alive, and Apart: Hettie is held through the night by a hand, and Seddon never says it', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, '=00:30');
    j.roll('pass');
    await j.play(...steps.hold_hettie, ...nightFromKitchen, ...steps.morning_stays, ...steps.cross_out);
    expect(j.holds('hettieKept', 'party')).toBe(true);
    expect(j.holds('orrinDeclared', 'party')).toBe(false);
    expect(reached(j)).toBe('Alive, and Apart');
  }, 290000);

  it('fails honestly: a failed ask is not asked again, and the night is Alive, and Apart', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play('Watch Seddon\'s hands while Mrs Marram talks of Tam', 'Take Hettie up the iron stair to the lamp room',
      ...steps.to_lamp, '=19:30');
    j.roll('fail');
    await j.play('Ask Seddon whether there is a thing he has never said to Mrs Marram');
    expect(j.holds('orrinDeclared', 'party')).toBe(false);
    expect(j.find('Ask Seddon whether there is a thing he has never said to Mrs Marram')).toBeUndefined();
    await j.play('=00:30');
    j.roll('pass');
    await j.play(...steps.hold_hettie, ...night, ...steps.morning_stays, ...steps.cross_out);
    expect(reached(j)).toBe('Alive, and Apart');
  }, 290000);

  it('ends in The Keeper\'s Light: nobody stops Hettie, and the keeper keeps his post', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, ...nightFromKitchen);
    expect(j.holds('hettieTaken', 'party')).toBe(true);
    expect(j.holds('orrinTaken', 'party')).toBe(false);
    await j.play(...steps.morning_stays, ...steps.cross_out);
    expect(reached(j)).toBe("The Keeper's Light");
  }, 290000);

  it('ends Down to the Water: he has said it, and it was not enough to hold her', async () => {
    const j = await start();
    await j.play(...steps.cross_in, 'Answer Seddon\'s question about the night', 'We can. Say what we\'re to do',
      'Hear what Hettie asks you over the tea', 'No. They are gone', 'Ask Hettie why she comes to this rock',
      'Take Gaff\'s question', 'Tell him to keep his voice down tonight, and mean it',
      'Let Dib show you what he found', 'I\'d want to. Stay by me tonight, and we\'ll listen together',
      'Buy a coil of Corrie\'s line');
    j.roll('pass');
    await j.play(...steps.declare_in_kitchen, ...nightFromKitchen);
    expect(j.holds('orrinTaken', 'party')).toBe(true);
    expect(j.holds('hettieTaken', 'party')).toBe(true);
    await j.play(...steps.morning_stays.slice(0, 3), ...steps.cross_out);
    expect(reached(j)).toBe('Down to the Water');
  }, 290000);

  it('lets Seddon be held at his lamp: the company may keep him there while Hettie walks', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play('Watch Seddon\'s hands while Mrs Marram talks of Tam', 'Ask Seddon whether there is a thing he has never said to Mrs Marram',
      ...steps.to_lamp, '=until hettieWalking(party)');
    const hold = "Put a hand on Seddon's arm: keep the lamp; you will bring her back";
    expect(j.find(hold)).toBeDefined();
    await j.play(hold, '=until hettieTaken(party)');
    expect(j.holds('orrinTaken', 'party')).toBe(false);
    expect(j.holds('orrinChasing', 'party')).toBe(false);
  }, 290000);

  it('survives two nights at the lamp, and sees the second dawn', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    j.roll('pass');
    await j.play(...steps.lovers, ...night, ...steps.second_night, '=06:30');
    expect(j.holds('crossed', 'party')).toBe(false);
    expect(reached(j)).toBe('The Second Dawn');
  }, 290000);

  it('hunts the party in the dark: at call time the voice may be answered, but only out of doors, and answering costs one of them', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk, '=until calling()');
    expect(j.find('Answer the voice by your own name')).toBeUndefined();
    const before = j.campaign.fighters.filter(f => f.hp > 0).length;
    await j.play("Out to the holm's landing");
    expect(j.find('Answer the voice by your own name')).toBeDefined();
    await j.play('Answer the voice by your own name');
    expect(j.campaign.fighters.filter(f => f.hp > 0).length).toBe(before - 1);
  }, 200000);

  it('lets Corrie answer the second call unless she has been paid', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk.slice(0, -1), '=02:30');
    expect(j.holds('corrieLost', 'party')).toBe(true);
  }, 200000);

  it('lets a rope-seller be paid: Corrie sells a line, and answers no voice that offers no coin', async () => {
    const j = await start();
    await j.play(...steps.cross_in, 'Buy a coil of Corrie\'s line');
    expect(j.holds('corrieSold', 'party')).toBe(true);
  }, 120000);

  it('is kept across a save', async () => {
    const j = await start();
    await j.play(...steps.cross_in, ...steps.talk);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('hettieSecret', 'party')).toBe(true);
    expect(reached(j)).toBeUndefined();
  }, 120000);
});
