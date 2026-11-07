import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';

// The Wrong Boat, played by the labels a player sees. Each journey is a different way for it to end, or a test of the
// engine of the thing: a chaser who hunts the company where it is, a face that is seen or not, a loss that is not a
// surrender. Time is spent by waiting; a wait is broken by an arrival, so a wait is asked for in pieces.
describe('The Wrong Boat', () => {
  const campaign = 'data/campaigns/wrongboat.campaign.json';
  const start = ['To the Staithe quay', 'Say which barge you paid for', 'The Mary, I think', 'Look under the cloth in the hamper',
    'To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each'];
  const hide = ['To the Mary\'s hold', 'Go down into the hold and pull the onion-sacks over you'];
  const toGap = ['To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves',
    'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills'];
  const ended = (told: string, phrase: string) => expect(told).toContain(phrase);
  // Waits in pieces until the clock is N watches past the quay.
  const until = async (j: Journey, n: number) => {
    const t0 = j.measure('t0');
    for (let guard = 0; j.watch() < t0 + n && guard < 80; guard++) { await j.step('=+6'); }
  };
  const exactly = async (j: Journey, n: number) => {
    const t0 = j.measure('t0');
    for (let guard = 0; j.watch() < t0 + n && guard < 200; guard++) { await j.step('=+1'); }
  };
  // The Mary lies at the fen landing; Bess comes aboard the deck and sees them. Stop the moment she has.
  const meet = async (j: Journey) => { for (let g = 0; !j.holds('confronted', 'party') && g < 8; g++) { await j.step('=+1'); } };
  const deck = async (j: Journey) => { if (j.at('party') !== 'wrongboat__deck') { await j.step('To the deck of the Mary'); } };
  // The same, kept under the onions: hiding wears off in three hours, and is taken up again.
  const lie = async (j: Journey, n: number) => {
    const t0 = j.measure('t0');
    for (let guard = 0; j.watch() < t0 + n && guard < 80; guard++) {
      if (!j.holds('hiding', 'party') && j.find('Go down into the hold and pull the onion-sacks over you')) { await j.step('Go down into the hold and pull the onion-sacks over you'); }
      await j.step('=+6');
    }
  };

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('sets a toll-clerk on the company the moment a porter has shouted, and she comes to the deck', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start.slice(0, 4));
    expect(j.holds('accused', 'party')).toBe(true);
    await j.play(...start.slice(4));
    // Hunting, not itinerary: Bess has come from the toll-house to where the company is.
    await until(j, 20);
    expect(['wrongboat__road', 'wrongboat__quay', 'wrongboat__fen_landing']).toContain(j.at('wrongboat__bess'));
  }, 120000);

  it('is cast off from Staithe with the chaser on the quay, and cannot be boarded on the water', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 20);
    expect(j.measure('stageNow')).toBe(0);
    expect(j.holds('confronted', 'party')).toBe(false);
    expect(j.at('wrongboat__bess')).not.toBe('wrongboat__deck');
  }, 150000);

  it('ends in the Lowther kitchen if the box is put in her hands, wherever she finds the company', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    expect(j.measure('stageNow')).toBe(2);
    await meet(j);
    expect(j.holds('confronted', 'party')).toBe(true);
    const told = await j.play('Hear what Bess has to say', 'Put the box in her hands');
    ended(told, 'as if it might spill');
  }, 200000);

  it('costs the box if the confrontation is left to lie: she takes it, kindly, in three watches', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    expect(j.measure('stageNow')).toBe(2);
    await meet(j);
    expect(j.holds('confronted', 'party')).toBe(true);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 200000);

  it('costs the box if the run for it fails, and keeps it if it comes off', async () => {
    const lost = await Journey.start(campaign, 'wb');
    await lost.play(...start);
    await exactly(lost, 61);
    await meet(lost);
    lost.roll('fail');
    await lost.play('Break from her and run for it');
    expect(lost.holds('bessTook', 'party')).toBe(true);
    const kept = await Journey.start(campaign, 'wb');
    await kept.play(...start);
    await exactly(kept, 61);
    await meet(kept);
    kept.roll('pass');
    await kept.play('Break from her and run for it');
    expect(kept.holds('bessTook', 'party')).toBe(false);
    expect(kept.holds('confronted', 'party')).toBe(false);
  }, 250000);

  it('does not let the deck at Highfoot be a sanctuary: she comes aboard once the Mary lies at the stage', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 280);
    await deck(j);
    await until(j, 292);
    expect(j.measure('stageNow')).toBe(5);
    await until(j, 420);
    // On the deck, or in the hold, or having taken the box: not stood on the quay with a plank open.
    const where = j.at('wrongboat__bess');
    expect(['wrongboat__deck', 'wrongboat__hold'].includes(where ?? '') || j.holds('bessTook', 'party') || j.holds('confronted', 'party')).toBe(true);
  }, 250000);

  it('ends clean, down the weir, if the lads are left to the relief sluice and the ferrywoman is paid', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 222);
    await deck(j);
    await exactly(j, 227);
    await j.play('To the head of the mill-race', 'To the mill yard', 'To the sluice hut', 'Spin the wheel and open the relief',
      'To the mill yard', 'To the weir');
    expect(j.holds('ladsSwept', 'party')).toBe(true);
    const told = await j.play(...toGap);
    expect(told.length).toBeGreaterThan(0);
  }, 300000);

  it('ends with the box sold and fifty coin if it is carried to the horse lines and no further', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 148);
    await deck(j);
    await j.play('To Pelham quay', 'To Pelham fairground', 'To the horse lines',
      'Sell the music box to the horse-dealer for fifty coin, no questions');
    expect(j.holds('soldHonest', 'party')).toBe(true);
  }, 250000);

  it('ends in a bad bargain at the fair if a gentleman in flight is offered the box for his horse', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in flight',
      'Ask Mr Peregrine Dally to join the company', 'To the deck of the Mary', ...hide);
    await lie(j, 148);
    await deck(j);
    const told = await j.play('To Pelham quay', 'To Pelham fairground', 'To the horse lines',
      'Trade the music box to Mr Dally for his horse, Parnassus');
    ended(told, 'long-faced bay');
  }, 250000);

  it('ends taken on the towpath if the lads are allowed to snatch the box', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 222);
    await deck(j);
    await exactly(j, 227);
    await j.play('To the head of the mill-race', 'To the mill yard', 'To the weir');
    await until(j, 252);
    expect(j.holds('caught', 'party') || j.holds('dead', 'party')).toBe(true);
  }, 300000);

  it('ends in the Last Pint if the box is sold to the man who was to have bought it', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, ...hide);
    await lie(j, 222);
    await deck(j);
    await exactly(j, 227);
    await j.play('To the head of the mill-race', 'To the mill yard', 'To the sluice hut',
      'Spin the wheel and open the relief', 'To the mill yard', 'To the weir', 'To the Highfoot stage', 'To the ferrywoman\'s hut',
      'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road',
      'Into the Last Pint', 'Ask Mr Fosse what he wants with a music box');
    const told = await j.play('Say you are the seller and want forty');
    ended(told, 'shelf of stopped clocks');
  }, 300000);

  it('lets Bess walk with the company, and keeps that across a save', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    expect(j.measure('stageNow')).toBe(2);
    await meet(j);
    await j.play('Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
    expect(j.holds('bessAlly', 'party')).toBe(true);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('bessAlly', 'party')).toBe(true);
  }, 250000);
});
