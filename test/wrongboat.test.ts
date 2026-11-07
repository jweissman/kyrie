import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { campaign, quayOpen, hamperOpen, board, start, walkOut, pay, toGap, begin, t, until, exactly, meet, trail, noReversal } from './support/wrongboat';

describe('The Wrong Boat', () => {
  // Off the Mary before she casts off, with Shim or Mr Dally or the cook's good opinion, and on foot.

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('sets a toll-clerk on the company the moment a porter has shouted, and she comes to the deck', async () => {
    const j = await begin();
    await j.play(...quayOpen, ...hamperOpen);
    expect(j.holds('accused', 'party')).toBe(true);
    await j.play(...board);
    await until(j, 20);
    expect(['wrongboat__road', 'wrongboat__quay', 'wrongboat__fen_landing', 'wrongboat__toll_counter']).toContain(j.at('wrongboat__bess') ?? '');
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

});

describe('The Wrong Boat', () => {
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

  it('lets the walk reach Clean Water for fifteen coin and a decision, and not for nothing', async () => {
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
    expect(['wrongboat__weir', 'wrongboat__millyard']).toContain(j.at('wrongboat__lads') ?? '');
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

});
