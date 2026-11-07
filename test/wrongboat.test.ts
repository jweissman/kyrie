import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';

// The Wrong Boat, played by the labels a player sees. Each journey is a different way for it to end, or a test of the
// engine of the thing: a chaser who hunts the company where it is, a face that is seen or not, a loss that is not a
// surrender, a back road that is the fast way and has a price. Time is spent by waiting; a wait is broken by an arrival,
// so a wait is asked for in pieces.
describe('The Wrong Boat', () => {
  const campaign = 'data/campaigns/wrongboat.campaign.json';
  const quayOpen = ['To the Staithe quay', 'Say which barge you paid for', 'The Mary, I think'];
  const hamperOpen = ['Look under the cloth in the hamper'];
  const board = ['To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each'];
  const start = [...quayOpen, ...hamperOpen, ...board];
  const walkOut = ['To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir'];
  const toGap = ['To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves',
    'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills'];
  const toRace = ['To the head of the mill-race', 'To the mill yard', 'To the weir'];
  const sluice = ['To the head of the mill-race', 'To the mill yard', 'To the sluice hut', 'Spin the wheel and open the relief', 'To the mill yard', 'To the weir'];
  const t = (j: Journey) => j.watch() - j.measure('t0');
  // Waits in pieces until the clock is N watches past the quay.
  const until = async (j: Journey, n: number) => {
    const t0 = j.measure('t0');
    for (let guard = 0; j.watch() < t0 + n && guard < 250; guard++) { await j.step('=+6'); }
  };
  const exactly = async (j: Journey, n: number) => {
    const t0 = j.measure('t0');
    for (let guard = 0; j.watch() < t0 + n && guard < 300; guard++) { await j.step('=+1'); }
  };
  // Bess is a chaser the other half of a journey is not about: she has said her piece and gone, as she does when a
  // meeting has gone the company's way. (The meetings themselves are played in their own journeys.)
  const clearBess = (j: Journey) => { j.assert('bessMet', 'party'); };
  const meet = async (j: Journey) => { for (let g = 0; !j.holds('confronted', 'party') && g < 12; g++) { await j.step('=+1'); } };
  // Aboard and clear of Bess, waiting for the race-head.
  const toMillRace = async (j: Journey) => { await j.play(...start); clearBess(j); await until(j, 220); await exactly(j, 227); };
  const trail = async (j: Journey, watches: number, who = 'wrongboat__bess') => {
    const seen: (string | undefined)[] = [];
    for (let g = 0; g < watches; g++) { await j.step('=+1'); const w = j.at(who); if (seen[seen.length - 1] !== w) { seen.push(w); } }
    return seen;
  };
  // A chaser who walks A then B then A has a pursuit that is satisfied and let go. A hunt never goes back where it was.
  const noReversal = (seen: (string | undefined)[]) => { for (let i = 2; i < seen.length; i++) { expect(seen[i] === seen[i - 2]).toBe(false); } };

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('sets a toll-clerk on the company the moment a porter has shouted, and she comes to the deck', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen);
    expect(j.holds('accused', 'party')).toBe(true);
    await j.play(...board);
    await until(j, 20);
    expect(['wrongboat__road', 'wrongboat__quay', 'wrongboat__fen_landing', 'wrongboat__toll_counter']).toContain(j.at('wrongboat__bess'));
  }, 120000);

  it('never has Bess go back where she was: not on the road, not on the quay, not at the fen', async () => {
    const barge = await Journey.start(campaign, 'wb');
    await barge.play(...start);
    const aboard = await trail(barge, 75);
    noReversal(aboard);
    expect(aboard).toContain('wrongboat__fen_landing');
    // A company that dawdles on the quay is walked up to, once, and met.
    const dawdle = await Journey.start(campaign, 'wb');
    await dawdle.play(...quayOpen, 'Wait');
    const seen = await trail(dawdle, 40);
    noReversal(seen);
    expect(dawdle.holds('confronted', 'party') || dawdle.holds('bessTook', 'party')).toBe(true);
  }, 250000);

  it('is cast off from Staithe with the chaser on the quay, and cannot be boarded on the water', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await until(j, 40);
    expect(j.measure('stageNow')).toBe(0);
    expect(j.holds('confronted', 'party')).toBe(false);
    expect(j.at('wrongboat__bess')).not.toBe('wrongboat__deck');
  }, 150000);

  it('does not put the company ashore from the middle of the river for want of a fare', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary');
    await exactly(j, 30);
    expect(j.at('party')).toBe('wrongboat__deck');
    expect(j.measure('stageNow')).toBe(0);
    await exactly(j, 61);
    expect(j.at('party')).toBe('wrongboat__fen_landing');
  }, 250000);

  it('ends in the Lowther kitchen if the box is put in her hands, wherever she finds the company', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    expect(j.measure('stageNow')).toBe(2);
    await meet(j);
    expect(j.holds('confronted', 'party')).toBe(true);
    const told = await j.play('Hear what Bess has to say', 'Put the box in her hands');
    expect(told).toContain('as if it might spill');
  }, 200000);

  it('costs the box if the confrontation is left to lie: she takes it, kindly, in three watches', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    expect(j.holds('confronted', 'party')).toBe(true);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 200000);

  it('takes the hamper too, unopened: it is no safer than the box', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...board);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(true);
    await exactly(j, 61);
    await meet(j);
    expect(j.holds('confronted', 'party')).toBe(true);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(false);
  }, 200000);

  it('does not give "it was Hob Garrod" for free: it wants a thing known, or a roll, and a failed roll costs the box', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say');
    expect(j.find('Tell her it was Hob Garrod who put it aboard')).toBeUndefined();
    j.roll('fail');
    await j.play('Tell Bess the porter shouted Hob Garrod\'s name, and you know no more');
    expect(j.holds('bessAlly', 'party')).toBe(false);
    expect(j.holds('bessKnows', 'party')).toBe(true);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    const ok = await Journey.start(campaign, 'wb');
    await ok.play(...start);
    await exactly(ok, 61);
    await meet(ok);
    ok.roll('pass');
    await ok.play('Tell Bess the porter shouted Hob Garrod\'s name, and you know no more');
    expect(ok.holds('bessAlly', 'party')).toBe(true);
  }, 250000);

  it('does not let "it is not hers to ask for" be free either: it is a roll, and losing it loses the box', async () => {
    const lost = await Journey.start(campaign, 'wb');
    await lost.play(...start);
    await exactly(lost, 61);
    await meet(lost);
    lost.roll('fail');
    await lost.play('Tell her it is not hers to ask for');
    expect(lost.holds('bessTook', 'party')).toBe(true);
    const won = await Journey.start(campaign, 'wb');
    await won.play(...start);
    await exactly(won, 61);
    await meet(won);
    won.roll('pass');
    await won.play('Tell her it is not hers to ask for');
    expect(won.holds('bessTook', 'party')).toBe(false);
    expect(won.holds('bessMet', 'party')).toBe(true);
  }, 250000);

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

  it('makes hiding cost a ration and a watch, wear off in three hours, and does not keep Bess from the hold', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'To the Mary\'s hold');
    const before = j.measure('quantity', 'party', 'rations');
    await j.play('Go down into the hold and pull the onion-sacks over you');
    expect(j.holds('hiding', 'party')).toBe(true);
    expect(j.measure('quantity', 'party', 'rations')).toBe(before - 1);
    await exactly(j, 40);
    expect(j.holds('hiding', 'party')).toBe(false);
    // And a company in the hold when the Mary lies at the fen is gone down to and found, or still searched for.
    await exactly(j, 70);
    const where = j.at('wrongboat__bess');
    expect(['wrongboat__deck', 'wrongboat__hold'].includes(where ?? '') || j.holds('confronted', 'party') || j.holds('bessTook', 'party')).toBe(true);
  }, 250000);

  it('does not let the deck be a sanctuary: the first meeting is on the Mary, when a plank opens at the fen', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    expect(j.at('party')).toBe('wrongboat__deck');
    expect(j.at('wrongboat__bess')).toBe('wrongboat__deck');
  }, 250000);

  it('makes the back road the fast way and gives it a price: the lads are at the weir, and take the box in five watches', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, ...walkOut);
    expect(j.at('party')).toBe('wrongboat__weir');
    // The walk is quicker than the barge by a long way, and it does not arrive unmet.
    expect(t(j)).toBeLessThan(80);
    expect(j.at('wrongboat__lads')).toBe('wrongboat__weir');
    expect(j.find('Stand and fight the lads')).toBeDefined();
    expect(j.find('Pay the lads eight coin to find the wrong woman')).toBeDefined();
    await j.play('=+3', '=+3');
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 200000);

  it('lets the walk reach Clean Water for eight coin, and not for nothing', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, ...walkOut, 'Pay the lads eight coin to find the wrong woman');
    expect(j.holds('ladsPaid', 'party')).toBe(true);
    const told = await j.play(...toGap);
    expect(told).toContain('plays the whole tune');
  }, 250000);

  it('lets a company that has not opened the hamper pay, and carry it to the gap unopened', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...walkOut);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(true);
    await j.play('=+3', '=+3');
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(false);
    const paid = await Journey.start(campaign, 'wb');
    await paid.play(...quayOpen, ...walkOut, 'Pay the lads eight coin to find the wrong woman');
    const told = await paid.play(...toGap);
    expect(told).toContain('DO NOT OPEN');
  }, 250000);

  it('makes the fight a roll with a price: won, they are driven off and do not come back; lost, they have everything', async () => {
    const won = await Journey.start(campaign, 'wb');
    await won.play(...quayOpen, ...hamperOpen, ...walkOut);
    won.roll('pass');
    await won.play('Stand and fight the lads');
    expect(won.holds('ladsRouted', 'party')).toBe(true);
    expect(won.at('wrongboat__lads')).not.toBe('wrongboat__weir');
    // The two who were beaten take nothing, however long after.
    await won.play('=+6', '=+6', '=+6');
    expect(won.holds('caught', 'party')).toBe(false);
    expect(won.holds('holding', 'party', 'music_box')).toBe(true);
    const lost = await Journey.start(campaign, 'wb');
    await lost.play(...quayOpen, ...hamperOpen, ...walkOut);
    lost.roll('fail');
    await lost.play('Stand and fight the lads');
    expect(lost.holds('beatenUp', 'party')).toBe(true);
    expect(lost.holds('holding', 'party', 'music_box')).toBe(false);
    expect(lost.holds('dead', 'party')).toBe(false);
  }, 250000);

  it('ends with empty hands if the box is dropped in the river before the weir, and the lads have nothing to take', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard');
    await j.play('To the weir', 'Drop the music box in the river', '=+6');
    expect(j.holds('caught', 'party')).toBe(false);
    const told = await j.play(...toGap);
    expect(told).toContain('lying in the mud');
  }, 250000);

  it('ends clean, down the weir, if the lads are left to the relief sluice and the ferrywoman is told the truth', async () => {
    const j = await Journey.start(campaign, 'wb');
    await toMillRace(j);
    await j.play(...sluice);
    expect(j.holds('ladsSwept', 'party')).toBe(true);
    const told = await j.play(...toGap);
    expect(told).toContain('drying out');
  }, 300000);

  it('ends with the box sold and fifty coin if it is carried to the horse lines and no further', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'Sell the music box to the horse-dealer for fifty coin, no questions');
    expect(j.holds('soldHonest', 'party')).toBe(true);
    const told = await j.play('To the mill yard', 'To the weir', ...toGap);
    expect(told).toContain('horse-dealer winds a music box');
  }, 250000);

  it('ends in a bad bargain at the fair if a gentleman in flight is offered the box for his horse', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each',
      'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in flight', 'Ask Mr Peregrine Dally to join the company', 'To the deck of the Mary');
    clearBess(j);
    await until(j, 148);
    await exactly(j, 152);
    const told = await j.play('To Pelham quay', 'To Pelham fairground', 'To the horse lines',
      'Trade the music box to Mr Dally for his horse, Parnassus');
    expect(told).toContain('long-faced bay');
  }, 250000);

  it('sends a married Mr Dally off to a church, and leaves a peal behind the company at the gap', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in love', 'Ask Mr Peregrine Dally to join the company', 'To the deck of the Mary');
    clearBess(j);
    await until(j, 148);
    await exactly(j, 152);
    await j.play('To Pelham quay', 'To Pelham fairground');
    for (let g = 0; !j.holds('dallyNoted', 'party') && g < 60; g++) { await j.step('=+1'); }
    expect(j.holds('dallyNoted', 'party')).toBe(true);
    await j.play('Tell Mr Dally to go to the church');
    expect(j.holds('dallyWed', 'party')).toBe(true);
    await j.play('To the horse lines');
    const told = await j.play('To the mill yard', 'To the sluice hut', 'Spin the wheel and open the relief', 'To the mill yard', 'To the weir', ...toGap);
    expect(told).toContain('bell is going');
  }, 400000);

  it('ends taken on the towpath if the lads are allowed to snatch the box', async () => {
    const j = await Journey.start(campaign, 'wb');
    await toMillRace(j);
    await j.play(...toRace);
    await until(j, 252);
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 300000);

  it('ends in the Last Pint if the box is sold to the man who was to have bought it', async () => {
    const j = await Journey.start(campaign, 'wb');
    await toMillRace(j);
    await j.play(...sluice, 'To the Highfoot stage', 'To the ferrywoman\'s hut',
      'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road',
      'Into the Last Pint', 'Ask Mr Fosse what he wants with a music box');
    const told = await j.play('Say you are the seller and want forty');
    expect(told).toContain('shelf of stopped clocks');
  }, 300000);

  it('makes the ferrywoman refuse while the pair are on the stage, and the chain is the way: caught on it, or over', async () => {
    const setup = async () => {
      const j = await Journey.start(campaign, 'wb');
      await j.play(...start);
      clearBess(j);
      await until(j, 292);
      await j.play('To the Highfoot stage');
      expect(j.at('wrongboat__lads')).toBe('wrongboat__ferry_stage');
      await j.play('To the ferrywoman\'s hut', 'Ask Una to put you across');
      expect(j.find('Say nothing but yourselves')).toBeUndefined();
      expect(j.find('Tell her what is in the hamper')).toBeUndefined();
      await j.play('Ask Una again, with the pair on the stage', 'To the Highfoot stage');
      return j;
    };
    const over = await setup();
    over.roll('pass');
    await over.play('Go hand over hand along the ferry chain, over the water');
    expect(over.holds('chainFell', 'party')).toBe(false);
    const told = await over.play('To the far bank');
    expect(told.length).toBeGreaterThan(0);
    const fell = await setup();
    fell.roll('fail');
    await fell.play('Go hand over hand along the ferry chain, over the water');
    expect(fell.holds('chainFell', 'party')).toBe(true);
    expect(fell.holds('holding', 'party', 'music_box')).toBe(false);
  }, 400000);

  it('does not let the lads use the ferry the company has paid for', async () => {
    const j = await Journey.start(campaign, 'wb');
    await toMillRace(j);
    await j.play(...sluice);
    await j.play('To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank');
    expect(j.holds('ferryPaid', 'party')).toBe(false);
    await j.play('=+6', '=+6');
    expect(['wrongboat__far_bank', 'wrongboat__hill_foot']).not.toContain(j.at('wrongboat__lads'));
  }, 300000);

  it('lets Bess walk with the company, once the company knows whose box it is, and keeps that across a save', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...start, 'To the Mary\'s galley', 'Show Mrs Brabant the music box', 'To the deck of the Mary');
    expect(j.holds('hobKnown', 'party')).toBe(true);
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
    expect(j.holds('bessAlly', 'party')).toBe(true);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('bessAlly', 'party')).toBe(true);
  }, 250000);

  it('ends at the gap with Bess, who takes the box back down to a man in a lock-up', async () => {
    const j = await Journey.start(campaign, 'wb');
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Dolly what the fare is', 'Work your passage in the galley',
      'To the Mary\'s galley', 'Show Mrs Brabant the music box', 'To the deck of the Mary');
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
    await until(j, 220);
    await exactly(j, 227);
    await j.play(...sluice);
    const told = await j.play('To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Tell her what is in the hamper', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills');
    expect(told).toContain('never been this far');
  }, 400000);

  it('ends at the gap with Shim, or without him, by what was said to him on the deck', async () => {
    const run = async (answer: string) => {
      const j = await Journey.start(campaign, 'wb');
      await j.play(...start, 'Ask Shim whose side he is on', answer, 'Ask Shim Garrod to join the company');
      clearBess(j);
      await until(j, 220);
      await exactly(j, 227);
      await j.play(...sluice);
      return j.play('To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills');
    };
    const gone = await run('Tell him you\'d go to the one wronged');
    expect(gone).toContain('figure with its hand up');
    const on = await run('Tell him you don\'t know him well enough to say');
    expect(on).toContain('VERY LARGE ONE');
  }, 600000);
});
