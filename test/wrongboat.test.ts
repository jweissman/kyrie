import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';

// The Wrong Boat, played by the labels a player sees. The journeys are played: where one needs luck it forces the roll
// (`roll`), and where the engine's clock is the thing under test it waits in pieces, because a wait is broken by an
// arrival. Nothing here sets Bess aside; she is met, avoided, allied with, paid for or outwalked.
describe('The Wrong Boat', () => {
  const campaign = 'data/campaigns/wrongboat.campaign.json';
  const quayOpen = ['To the Staithe quay', 'Say which barge you paid for', 'The Mary, I think'];
  const hamperOpen = ['Look under the cloth in the hamper'];
  const board = ['To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each'];
  const start = [...quayOpen, ...hamperOpen, ...board];
  const walkOut = ['To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir'];
  const pay = 'Pay the lads fifteen coin to find the wrong woman';
  const toGap = ['To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves',
    'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills'];
  // Bess has the carrier's cart: a company that walks the back road is met at the weir or the stage. This is the
  // step in a journey where the company deals with her by the same means a player has: a roll, forced to pass.
  const wrap = (j: Journey): Journey => {
    const orig = j.play.bind(j);
    j.play = async (...steps: string[]) => {
      let out = '';
      let chunk: string[] = [];
      const flush = async () => { if (chunk.length) { out = await orig(...chunk); chunk = []; } };
      for (const st of steps) {
        if (st !== '@bess') { chunk.push(st); continue; }
        await flush();
        for (let g = 0; !j.holds('confronted', 'party') && !j.holds('bessMet', 'party') && g < 4; g++) { await orig('=+1'); }
        if (j.holds('confronted', 'party')) { j.roll('pass'); out = await orig('Swear to Bess that you have only cakes'); }
      }
      await flush();
      return out;
    };
    return j;
  };
  const begin = async () => wrap(await Journey.start(campaign, 'wb'));
  const t = (j: Journey) => j.watch() - j.measure('t0');
  const until = async (j: Journey, n: number) => { for (let g = 0; t(j) < n && g < 300; g++) { await j.step('=+6'); } };
  const exactly = async (j: Journey, n: number) => { for (let g = 0; t(j) < n && g < 400; g++) { await j.step('=+1'); } };
  const meet = async (j: Journey) => { for (let g = 0; !j.holds('confronted', 'party') && g < 12; g++) { await j.step('=+1'); } };
  const trail = async (j: Journey, watches: number, who = 'wrongboat__bess') => {
    const seen: (string | undefined)[] = [];
    for (let g = 0; g < watches; g++) { await j.step('=+1'); const w = j.at(who); if (seen[seen.length - 1] !== w) { seen.push(w); } }
    return seen;
  };
  // A chaser who goes A, B, A has a pursuit that is satisfied and let go. A hunt never goes back where it was.
  const noReversal = (seen: (string | undefined)[]) => { for (let i = 2; i < seen.length; i++) { expect(seen[i] === seen[i - 2]).toBe(false); } };
  // The Mary at Staithe, with the box shown to the cook: the company knows whose it is.
  const galley = ['To the Mary\'s galley', 'Show Mrs Brabant the music box', 'To the deck of the Mary'];
  // Bess met at the fen landing and walked with. The company is "escorted" afterwards, at the weir and elsewhere.
  const allyAboard = async () => {
    const j = await begin();
    await j.play(...start, ...galley);
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
    return j;
  };
  // Off the Mary before she casts off, with Shim or Mr Dally or the cook's good opinion, and on foot.
  const leaveWith = ['To the Staithe quay', ...['To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir']];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('sets a toll-clerk on the company the moment a porter has shouted, and she comes to the deck', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen);
    expect(j.holds('accused', 'party')).toBe(true);
    await j.play(...board);
    await until(j, 20);
    expect(['wrongboat__road', 'wrongboat__quay', 'wrongboat__fen_landing', 'wrongboat__toll_counter']).toContain(j.at('wrongboat__bess'));
  }, 120000);

  it('never has Bess go back where she was: not on the road, not on the quay, not at the fen', async () => {
    const barge = await begin();
    await barge.play(...start);
    const aboard = await trail(barge, 75);
    noReversal(aboard);
    expect(aboard).toContain('wrongboat__fen_landing');
    const dawdle = await begin();
    await dawdle.play(...quayOpen, 'Wait');
    const seen = await trail(dawdle, 40);
    noReversal(seen);
    expect(dawdle.holds('confronted', 'party') || dawdle.holds('bessTook', 'party')).toBe(true);
  }, 250000);

  it('is cast off from Staithe with the chaser on the quay, and cannot be boarded on the water', async () => {
    const j = await begin();
    await j.play(...start);
    await until(j, 40);
    expect(j.measure('stageNow')).toBe(0);
    expect(j.holds('confronted', 'party')).toBe(false);
    expect(j.at('wrongboat__bess')).not.toBe('wrongboat__deck');
  }, 150000);

  it('does not put the company ashore from the middle of the river for want of a fare', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary');
    await exactly(j, 30);
    expect(j.at('party')).toBe('wrongboat__deck');
    expect(j.measure('stageNow')).toBe(0);
    await exactly(j, 61);
    expect(j.at('party')).toBe('wrongboat__fen_landing');
  }, 250000);

  it('makes work for a passage cost the deck: the cook calls the company back to the galley while she is afloat', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Dolly what the fare is', 'Work your passage in the galley');
    expect(j.holds('galleyDuty', 'party')).toBe(true);
    await exactly(j, 20);
    expect(j.at('party')).toBe('wrongboat__galley');
    // The fare is not paid: the coin is kept for the lads, and for Una.
    expect(j.measure('quantity', 'party', 'gold')).toBe(20);
  }, 150000);

  it('ends in the Lowther kitchen if the box is put in her hands once the lads are paid; and in the same kitchen, briefly, if they are not', async () => {
    const paid = await begin();
    await paid.play(...quayOpen, ...hamperOpen, ...walkOut, pay, 'To the Highfoot stage');
    await meet(paid);
    expect(paid.holds('confronted', 'party')).toBe(true);
    const told = await paid.play('Hear what Bess has to say', 'Put the box in her hands');
    expect(told).toContain('as if it might spill');
    const bare = await begin();
    await bare.play(...start);
    await exactly(bare, 61);
    await meet(bare);
    const rueful = await bare.play('Hear what Bess has to say', 'Put the box in her hands');
    expect(rueful).toContain('two men in grey coats at the door');
  }, 300000);

  it('costs the box if the confrontation is left to lie: she takes it, kindly, in three watches', async () => {
    const j = await begin();
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 200000);

  it('takes the hamper too, unopened: it is no safer than the box', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...board);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(true);
    await exactly(j, 61);
    await meet(j);
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(false);
  }, 200000);

  it('lets a company with empty hands be turned away by Bess rather than stuck in front of her', async () => {
    const j = await begin();
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say', 'Drop the music box in the river', '=+1');
    expect(j.holds('bessTook', 'party')).toBe(false);
    expect(j.holds('bessMet', 'party')).toBe(true);
    expect(j.holds('confronted', 'party')).toBe(false);
  }, 200000);

  it('does not give "it was Hob Garrod" for free: it wants a thing known, or a roll, and a failure sticks', async () => {
    const j = await begin();
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    await j.play('Hear what Bess has to say');
    expect(j.find('Tell her it was Hob Garrod who put it aboard')).toBeUndefined();
    j.roll('fail');
    await j.play('Tell Bess the porter shouted Hob Garrod\'s name, and you know no more');
    expect(j.holds('bessAlly', 'party')).toBe(false);
    expect(j.find('Tell Bess the porter shouted Hob Garrod\'s name, and you know no more')).toBeUndefined();
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
    const ok = await begin();
    await ok.play(...start);
    await exactly(ok, 61);
    await meet(ok);
    ok.roll('pass');
    await ok.play('Tell Bess the porter shouted Hob Garrod\'s name, and you know no more');
    expect(ok.holds('bessAlly', 'party')).toBe(true);
  }, 250000);

  it('does not let "it is not hers to ask for" be free: it is a roll, losing it loses the box, winning it sends her off the deck', async () => {
    const lost = await begin();
    await lost.play(...start);
    await exactly(lost, 61);
    await meet(lost);
    lost.roll('fail');
    await lost.play('Tell her it is not hers to ask for');
    expect(lost.holds('bessTook', 'party')).toBe(true);
    const won = await begin();
    await won.play(...start);
    await exactly(won, 61);
    await meet(won);
    won.roll('pass');
    await won.play('Tell her it is not hers to ask for');
    expect(won.holds('bessTook', 'party')).toBe(false);
    expect(won.at('wrongboat__bess')).not.toBe('wrongboat__deck');
    expect(won.holds('liedToBess', 'party')).toBe(false);
  }, 250000);

  it('costs the box if the run for it fails, and keeps it if it comes off', async () => {
    const lost = await begin();
    await lost.play(...start);
    await exactly(lost, 61);
    await meet(lost);
    lost.roll('fail');
    await lost.play('Break from her and run for it');
    expect(lost.holds('bessTook', 'party')).toBe(true);
    const kept = await begin();
    await kept.play(...start);
    await exactly(kept, 61);
    await meet(kept);
    kept.roll('pass');
    await kept.play('Break from her and run for it');
    expect(kept.holds('bessTook', 'party')).toBe(false);
    expect(kept.holds('confronted', 'party')).toBe(false);
  }, 250000);

  it('makes hiding cost a ration and wear off, and does not keep Bess from the hold', async () => {
    const j = await begin();
    await j.play(...start, 'To the Mary\'s hold');
    const before = j.measure('quantity', 'party', 'rations');
    await j.play('Go down into the hold and pull the onion-sacks over you');
    expect(j.holds('hiding', 'party')).toBe(true);
    expect(j.measure('quantity', 'party', 'rations')).toBe(before - 1);
    await exactly(j, 40);
    expect(j.holds('hiding', 'party')).toBe(false);
    await exactly(j, 70);
    const where = j.at('wrongboat__bess');
    expect(['wrongboat__deck', 'wrongboat__hold'].includes(where ?? '') || j.holds('confronted', 'party') || j.holds('bessTook', 'party')).toBe(true);
  }, 250000);

  it('does not let the deck be a sanctuary: the first meeting is on the Mary, when a plank opens at the fen', async () => {
    const j = await begin();
    await j.play(...start);
    await exactly(j, 61);
    await meet(j);
    expect(j.at('party')).toBe('wrongboat__deck');
    expect(j.at('wrongboat__bess')).toBe('wrongboat__deck');
  }, 250000);

  it('makes the back road the fast way and holds the towpath: the lads are at the weir and the company cannot walk past', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut);
    expect(j.at('party')).toBe('wrongboat__weir');
    expect(t(j)).toBeLessThan(80);
    expect(j.at('wrongboat__lads')).toBe('wrongboat__weir');
    expect(j.find('Stand and fight the lads')).toBeDefined();
    expect(j.find(pay)).toBeDefined();
    expect(j.takes('To the Highfoot stage')).toBe(false);
    await j.play('=+3', '=+3');
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 200000);

  it('lets the walk reach Clean Water for eight coin and a decision, and not for nothing', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut, pay);
    expect(j.holds('ladsPaid', 'party')).toBe(true);
    const told = await j.play(...toGap);
    expect(told).toContain('plays the whole tune');
  }, 250000);

  it('sends the lads after a company that has stepped away from them, and they have it in five watches wherever they meet', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut);
    await j.play('To the mill yard', '=+6');
    expect(j.holds('ladsMet', 'party')).toBe(true);
    expect(['wrongboat__weir', 'wrongboat__millyard']).toContain(j.at('wrongboat__lads'));
  }, 200000);

  it('lets a company that has not opened the hamper pay, and carry it to the gap unopened, or be robbed of it', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...walkOut);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(true);
    await j.play('=+3', '=+3');
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'hamper_kind')).toBe(false);
    const paid = await begin();
    await paid.play(...quayOpen, ...walkOut, pay);
    const told = await paid.play(...toGap);
    expect(told).toContain('DO NOT OPEN');
  }, 250000);

  it('makes the fight a roll with a price: won, they are driven off and do not come back; lost, they have everything', async () => {
    const won = await begin();
    await won.play(...quayOpen, ...hamperOpen, ...walkOut);
    won.roll('pass');
    await won.play('Stand and fight the lads');
    expect(won.holds('ladsRouted', 'party')).toBe(true);
    expect(won.at('wrongboat__lads')).not.toBe('wrongboat__weir');
    expect(won.takes('To the Highfoot stage')).toBe(true);
    await won.play('=+1');
    expect(won.holds('caught', 'party')).toBe(false);
    expect(won.holds('holding', 'party', 'music_box')).toBe(true);
    const lost = await begin();
    await lost.play(...quayOpen, ...hamperOpen, ...walkOut);
    lost.roll('fail');
    await lost.play('Stand and fight the lads');
    expect(lost.holds('beatenUp', 'party')).toBe(true);
    expect(lost.holds('holding', 'party', 'music_box')).toBe(false);
    expect(lost.holds('dead', 'party')).toBe(false);
  }, 250000);

  it('gives the relief sluice a roll, two watches and a consequence: the lads in the river, Bess unwilling to walk beside it, and no medal', async () => {
    const lost = await begin();
    await lost.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the sluice hut');
    lost.roll('fail');
    await lost.play('Spin the wheel and open the relief');
    expect(lost.holds('ladsSwept', 'party')).toBe(false);
    expect(lost.at('wrongboat__lads')).toBe('wrongboat__sluice_hut');
    const won = await begin();
    await won.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the sluice hut');
    const w0 = t(won);
    won.roll('pass');
    await won.play('Spin the wheel and open the relief');
    expect(t(won) - w0).toBeGreaterThanOrEqual(2);
    expect(won.holds('ladsSwept', 'party')).toBe(true);
    const told = await won.play('To the weir', ...toGap);
    expect(told).toContain('has not mentioned your name');
  }, 300000);

  it('ends with empty hands if the box is dropped in the river: the lads hold the path against what is carried, and there is nothing', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard');
    await j.play('To the weir', 'Drop the music box in the river', '=+1');
    expect(j.takes('To the Highfoot stage')).toBe(true);
    const told = await j.play(...toGap);
    expect(told).toContain('lying in the mud');
  }, 250000);

  it('lets a company that took nothing walk the whole way unhindered: the towpath is held against what is carried, not against feet', async () => {
    const j = await begin();
    await j.play('To the Staithe quay', 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir');
    expect(j.takes('To the Highfoot stage')).toBe(true);
    expect(j.find(pay)).toBeUndefined();
    const told = await j.play(...toGap);
    expect(told).toContain('nothing to show for the river');
  }, 250000);

  it('ends with the box sold and fifty coin if it is carried to the horse lines and no further', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'Sell the music box to the horse-dealer for fifty coin, no questions');
    expect(j.holds('soldHonest', 'party')).toBe(true);
    const told = await j.play('To the mill yard', 'To the weir', ...toGap);
    expect(told).toContain('horse-dealer winds a music box');
  }, 250000);

  it('ends in a bad bargain at the fair if a gentleman in flight is offered the box for his horse', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary',
      'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in flight', 'Ask Mr Peregrine Dally to join the company',
      'To the deck of the Mary', 'To the Staithe quay', 'To the Staithe road', 'To the horse lines');
    const told = await j.play('Trade the music box to Mr Dally for his horse, Parnassus');
    expect(told).toContain('long-faced bay');
  }, 250000);

  it('sends Mr Dally to a church if he is in love, and leaves a peal behind the company at the gap', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary',
      'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in love', 'Ask Mr Peregrine Dally to join the company',
      'To the deck of the Mary', 'To the Staithe quay', 'To the Staithe road', 'To the horse lines', 'To Pelham fairground');
    for (let g = 0; !j.holds('dallyNoted', 'party') && g < 80; g++) { await j.step('=+1'); }
    expect(j.holds('dallyNoted', 'party')).toBe(true);
    await j.play('Tell Mr Dally to go to the church');
    expect(j.holds('dallyWed', 'party')).toBe(true);
    await j.play('To the horse lines', 'To the mill yard', 'To the weir', pay);
    const told = await j.play(...toGap);
    expect(told).toContain('flat cracked bell is going');
  }, 400000);

  it('leaves a Mr Dally who bolted and would not trade with the company at the gap, asking if there is anywhere further', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary',
      'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man in flight', 'Ask Mr Peregrine Dally to join the company',
      'To the deck of the Mary', 'To the Staithe quay', 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir', pay);
    const told = await j.play(...toGap);
    expect(told).toContain('anywhere further');
  }, 300000);

  it('ends taken on the towpath if the lads are allowed to snatch the box', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut, '=+6');
    expect(j.holds('caught', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'music_box')).toBe(false);
  }, 300000);

  it('ends in the Last Pint if the box is sold to the man who was to have bought it', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut, pay, 'To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut',
      'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road',
      'Into the Last Pint', 'Ask Mr Fosse what he wants with a music box');
    const told = await j.play('Say you are the seller and want forty');
    expect(told).toContain('shelf of stopped clocks');
  }, 300000);

  it('keeps a bargeman\'s initials: the company that will not sell, having read what is on the plate', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Wind the music box', 'Wind the music box', 'Wind the box a third time and feel under the comb');
    expect(j.holds('drawerOpen', 'party')).toBe(true);
    await j.play('Read the words scratched in the back-plate', 'To the Staithe quay', ...walkOut.slice(0, 4), pay,
      'To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank',
      'To the foot of the hill road', 'Into the Last Pint', 'Ask Mr Fosse what he wants with a music box', 'Say you are only carrying it for a friend');
    expect(j.holds('quillRead', 'party')).toBe(true);
    const told = await j.play('To the foot of the hill road', 'To the gap in the hills');
    expect(told).toContain('B.L. FROM T.L.');
  }, 400000);

  it('makes the ferrywoman refuse while the pair are on the stage, and the chain is the way: caught on it, or over', async () => {
    const setup = async () => {
      const j = await begin();
      await j.play(...start);
      await exactly(j, 61);
      await j.play('@bess');
      await until(j, 292);
      await j.play('To the Highfoot stage');
      expect(j.at('wrongboat__lads')).toBe('wrongboat__ferry_stage');
      await j.play('To the ferrywoman\'s hut', 'Ask Una to put you across');
      expect(j.find('Say nothing but yourselves')).toBeUndefined();
      expect(j.find('Tell her what is in the hamper')).toBeUndefined();
      await j.play('Ask Una again, with the stage as it is', 'To the Highfoot stage');
      return j;
    };
    const over = await setup();
    over.roll('pass');
    await over.play('Go hand over hand along the ferry chain, over the water');
    expect(over.holds('chainFell', 'party')).toBe(false);
    const told = await over.play('To the far bank');
    expect(told).toContain('lifts one hand a little');
    const fell = await setup();
    fell.roll('fail');
    await fell.play('Go hand over hand along the ferry chain, over the water');
    expect(fell.holds('chainFell', 'party')).toBe(true);
    expect(fell.holds('holding', 'party', 'music_box')).toBe(false);
  }, 600000);

  it('carries an escorted company across at the stage even with the pair standing on it: Bess walking with them is the answer to the lads', async () => {
    const j = await allyAboard();
    await until(j, 292);
    await j.play('To the Highfoot stage');
    expect(j.at('wrongboat__lads')).toBe('wrongboat__ferry_stage');
    await j.play('To the ferrywoman\'s hut', 'Ask Una to put you across');
    expect(j.find('Say nothing but yourselves')).toBeDefined();
  }, 400000);

  it('does not let the lads use the ferry the company has paid for', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, ...walkOut, pay, 'To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank');
    expect(j.holds('ferryPaid', 'party')).toBe(false);
  }, 300000);

  it('lets Bess walk with the company, once the company knows whose box it is, and keeps that across a save', async () => {
    const j = await allyAboard();
    expect(j.holds('bessAlly', 'party')).toBe(true);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('bessAlly', 'party')).toBe(true);
  }, 250000);

  it('lets an escorted company pass the lads, and ends at the gap with Bess, who takes the box back down', async () => {
    const j = await allyAboard();
    await until(j, 220);
    await exactly(j, 227);
    await j.play('To the head of the mill-race', 'To the mill yard', 'To the weir');
    expect(j.takes('To the Highfoot stage')).toBe(true);
    const told = await j.play('To the Highfoot stage', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Tell her what is in the hamper', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills');
    expect(told).toContain('never been this far');
  }, 400000);

  it('plays the reunion: Bess in the cell with Hob, and the company goes on without her', async () => {
    const j = await allyAboard();
    await until(j, 150);
    await exactly(j, 152);
    await j.play('To Pelham quay', 'To the Magpie', 'To the Pelham lock-up');
    expect(j.holds('bessReunited', 'party')).toBe(true);
    expect(j.at('wrongboat__bess')).toBe('wrongboat__lockup');
  }, 400000);

  it('walks Shim to the hill foot; where he turns back, or goes on, by what was said to him on the deck', async () => {
    const run = async (answer: string) => {
      const j = await begin();
      await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Shim whose side he is on', answer, 'Ask Shim Garrod to join the company',
        'To the Staithe quay', ...walkOut.slice(0, 4), pay);
      return j.play('To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills');
    };
    expect(await run('Tell him you\'d go to the one wronged')).toContain('figure with its hand up');
    expect(await run('Tell him you don\'t know him well enough to say')).toContain('VERY LARGE ONE');
    expect(await run('Tell him blood is blood, and you\'d say nothing')).toContain('I said I would');
  }, 900000);

  it('plays the quiet threads to their endings: Una and the song, Mrs Brabant and the cook\'s advice, Tabitha and the tea, the galley', async () => {
    const una = await begin();
    await una.play(...quayOpen, ...hamperOpen, 'Wind the music box', ...walkOut, pay, 'To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Wind the box and let her listen', 'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road');
    expect(await una.play('To the gap in the hills')).toContain('listening for it');
    const cook = await begin();
    await cook.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', ...galley.slice(0, 2), 'To the deck of the Mary', 'To the Staithe quay', ...walkOut.slice(0, 4), pay);
    expect(await cook.play(...toGap)).toContain('a spoon that stopped');
    const tea = await begin();
    await tea.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'Ask Mrs Auster whether you are running from a man or toward one', 'Toward. I think. I\'m not sure', 'To the weir', pay);
    expect(await tea.play(...toGap)).toContain('It was good tea');
    const onions = await begin();
    await onions.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Dolly what the fare is', 'Work your passage in the galley', 'To the Staithe quay', ...walkOut.slice(0, 4), pay);
    expect(await onions.play(...toGap)).toContain('smell of onions');
  }, 900000);

  it('plays the fen on foot: the decoy in the eel-skiff sends Bess to the eel-stage, and the bell-cot is a loft', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the fen landing', 'To the long causeway', 'To the eel-stage');
    await j.play('Wrap a ration-cake in a dishcloth and leave it in the eel-skiff');
    expect(j.holds('decoyLaid', 'party')).toBe(true);
    await exactly(j, 70);
    expect(j.holds('decoyFound', 'party') || j.at('wrongboat__bess') === 'wrongboat__eel_stage').toBe(true);
  }, 400000);

  it('leaves a message not passed: Hob asked for Bess, and the company went on without telling her', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To Pelham fairground', 'To Pelham quay', 'To the Magpie', 'To the Pelham lock-up',
      'Ask Hob what he thinks he has done', 'Say she might, if he told her to her face');
    expect(j.holds('hobAsked', 'party')).toBe(true);
    await j.play('To the Magpie', 'To Pelham quay', 'To Pelham fairground', 'To the horse lines', 'To the mill yard', 'To the weir', pay);
    const told = await j.play(...toGap);
    expect(told).toContain('lock-up, and had no money');
  }, 400000);

  it('sends a Mr Dally who is neither in love nor in flight to a church all the same, and rings the wrong bell and then the right one', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary',
      'To the Mary\'s cabin', 'Ask Mr Dally about his bride', 'You look like a man with a cold', 'Ask Mr Peregrine Dally to join the company',
      'To the deck of the Mary', 'To the Staithe quay', 'To the Staithe road', 'To the horse lines', 'To Pelham fairground');
    for (let g = 0; !j.holds('dallyNoted', 'party') && g < 80; g++) { await j.step('=+1'); }
    await j.play('Tell Mr Dally to go to the church', 'To the horse lines', 'To the mill yard', 'To the weir', pay);
    const told = await j.play(...toGap);
    expect(told).toContain('wrong hour for a wedding');
  }, 400000);

  it('lets the sluice be tried once, and a failure is the lads at the hut with no second go', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the sluice hut');
    j.roll('fail');
    await j.play('Spin the wheel and open the relief');
    expect(j.find('Spin the wheel and open the relief')).toBeUndefined();
    expect(j.at('wrongboat__lads')).toBe('wrongboat__sluice_hut');
  }, 250000);

  it('sends an allied Bess away from a company that has put two men in the weir, and says so', async () => {
    const j = await allyAboard();
    await until(j, 220);
    await exactly(j, 227);
    await j.play('To the head of the mill-race', 'To the mill yard', 'To the sluice hut');
    j.roll('pass');
    await j.play('Spin the wheel and open the relief', '=+1');
    expect(j.holds('ladsSwept', 'party')).toBe(true);
    expect(j.holds('bessAlly', 'party')).toBe(false);
    expect(j.at('wrongboat__bess')).not.toBe(j.at('party'));
  }, 400000);

  it('swearing first is not free: a failed oath closes "it was Hob Garrod" and the box goes in three watches', async () => {
    const j = await begin();
    await j.play(...start, ...galley);
    await exactly(j, 61);
    await meet(j);
    expect(j.find('Tell her it was Hob Garrod who put it aboard')).toBeUndefined();
    await j.play('Hear what Bess has to say');
    expect(j.find('Tell her it was Hob Garrod who put it aboard')).toBeDefined();
    j.roll('fail');
    await j.play('Swear to Bess that you have only cakes');
    expect(j.holds('bessKnows', 'party')).toBe(true);
    expect(j.find('Tell her it was Hob Garrod who put it aboard')).toBeUndefined();
    await j.play('=+4');
    expect(j.holds('bessTook', 'party')).toBe(true);
  }, 250000);

  it('makes hiding a gamble with Bess in the room: she finds the company or she is satisfied and goes off the hunt', async () => {
    let found = 0;
    let missed = 0;
    for (const seed of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8']) {
      const j = wrap(await Journey.start(campaign, seed));
      await j.play(...start, 'To the Mary\'s hold');
      await exactly(j, 56);
      await j.play('Go down into the hold and pull the onion-sacks over you');
      for (let g = 0; g < 14 && !j.holds('confronted', 'party') && !j.holds('bessSearched', 'party'); g++) { await j.step('=+1'); }
      if (j.holds('confronted', 'party')) { found++; } else if (j.holds('bessSearched', 'party')) { missed++; expect(j.holds('confronted', 'party')).toBe(false); }
      if (found > 0 && missed > 0) { break; }
    }
    expect(found).toBeGreaterThan(0);
    expect(missed).toBeGreaterThan(0);
  }, 600000);

  it('turns Shim back to Pelham, with tobacco, when he has seen his uncle and was not told blood is blood', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Ask Shim whose side he is on', 'Tell him you don\'t know him well enough to say', 'Ask Shim Garrod to join the company',
      'To the Staithe quay', 'To the Staithe road', 'To the horse lines', 'To Pelham fairground', 'To Pelham quay', 'To the Magpie',
      'Ask Shim what he means to do about his uncle in the lock-up', 'Tell him to go and look his uncle in the face');
    expect(j.holds('shimSeesHob', 'party')).toBe(true);
    await j.play('To Pelham quay', 'To Pelham fairground', 'To the horse lines', 'To the mill yard', 'To the weir', pay);
    const told = await j.play(...toGap);
    expect(told).toContain('screw of tobacco');
  }, 600000);
});
