import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const startGame = async () => {
  const j = await Journey.start(campaign, 'merren-pebbles');
  Placed.at(j, 'tallow__taproom');
  await j.play('Ask Merren who else wants the road', 'Ask Merren about the pebbles on the table',
    'Play the pebble game with Merren');
  return j;
};

describe('Merren\'s pebble game', () => {
  it('lets a winning sequence uncover a memory useful in later negotiations', async () => {
    const j = await startGame();
    expect(j.page).toContain('8 pebbles');
    await j.play('Take one pebble');
    expect(j.measure('lcPebbles', 'party')).toBe(6);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Take two pebbles');
    expect(resumed.measure('lcPebbles', 'party')).toBe(3);
    await resumed.play('Take two pebbles');
    expect(resumed.holds('lcPebbleWon', 'party')).toBe(true);
    expect(resumed.holds('knows', 'party', 'lc_boats_memory')).toBe(true);
    expect(resumed.offers('Play the pebble game with Merren')).toBe(false);
    resumed.assert('knows', 'party', 'lc_withdrawal_cost');
    resumed.put('lc_ferryman', 'green');
    resumed.put('lc_raiders', 'bank');
    expect(resumed.offers('Ask Merren to bargain with the Ferryman')).toBe(true);
    await resumed.play('Ask Merren to bargain with the Ferryman');
    expect(resumed.holds('lcBargained', 'party')).toBe(true);
  }, 10000);

  it('leaves the memory undiscovered after a losing sequence', async () => {
    const j = await startGame();
    await j.play('Take two pebbles');
    expect(j.measure('lcPebbles', 'party')).toBe(4);
    await j.play('Take two pebbles');
    expect(j.measure('lcPebbles', 'party')).toBe(1);
    await j.play('Take one pebble');
    expect(j.holds('lcPebbleWon', 'party')).toBe(false);
    expect(j.holds('knows', 'party', 'lc_boats_memory')).toBe(false);
    expect(j.offers('Play the pebble game with Merren')).toBe(false);
    await j.play('==+6');
    expect(j.offers('Play the pebble game with Merren')).toBe(true);
  }, 10000);

  it('abandons an unfinished game if the company leaves', async () => {
    const j = await startGame();
    await j.play('Take one pebble', 'Out to Swallet green');
    expect(j.holds('lcPebblePlaying', 'party')).toBe(false);
    await j.play('Into the Chandler\'s Arms', '==+6');
    expect(j.offers('Play the pebble game with Merren')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_boats_memory')).toBe(false);
  }, 10000);

  it('does not award a pending win if the company has left the table', async () => {
    const j = await startGame();
    j.assert('lcPebbleReply', 'party');
    j.campaign.commitWorld(j.campaign.world.apply([{
      kind: 'set', call: ModuleWriter.call('tallow__lcPebbles', 'party'), value: ModuleWriter.number(1),
    }]));
    Placed.at(j, 'tallow__green');
    await j.play('==+1');
    expect(j.holds('lcPebblePlaying', 'party')).toBe(false);
    expect(j.holds('lcPebbleWon', 'party')).toBe(false);
    expect(j.holds('knows', 'party', 'lc_boats_memory')).toBe(false);
  }, 10000);
});
