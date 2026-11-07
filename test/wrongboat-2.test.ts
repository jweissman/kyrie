import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { campaign, quayOpen, hamperOpen, start, walkOut, pay, toGap, wrap, begin, until, exactly, meet, galley, allyAboard } from './support/wrongboat';

describe('The Wrong Boat', () => {
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
    await j.play(...quayOpen, ...hamperOpen, 'To the deck of the Mary', 'Wind the music box', 'Wind the music box');
    // The comb is a trapwork check, and this spec is about the plate, not the throw: since the old-school rules and
    // tools for the trained came, the seed's natural throw failed it, so the one throw is forced, as other routes do.
    j.roll('pass');
    await j.play('Wind the box a third time and feel under the comb');
    j.roll();
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

});

describe('The Wrong Boat', () => {
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
