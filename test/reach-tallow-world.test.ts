import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ProvincePlay } from './support/province-play';

// The Ash's war in a generated world, carried by its Tallow (data/adventures/tallow/count.kyr): the count begins when
// the old road under the Edge is opened, the assessor comes to the Chandler's for the twelfth seat, and the war is
// reckoned from the twelve seats broken or served across the whole country; a world in which nobody acts is the Ash's.
describe('the Ash\'s war in the world', () => {
  it('begins with the old road, seats a company at the Ash\'s board, and is reckoned from the seats', async () => {
    const { s, c, k } = await ProvincePlay.enter('kite', 'tallow',
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(s);
    expect(c.world.test({ kind: 'call', name: 'befell', args: ['ash_count_begun'] } as never)).toBe(false);
    j.assert('state', k('calx_gate'), k('raised'));
    await j.play('=+1');
    expect(j.holds('befell', 'ash_count_begun')).toBe(true);
    expect(j.holds('at', k('tc_assessor'), k('taproom'))).toBe(true);
    j.put('party', k('taproom'));
    await j.play('Talk to Assessor Ninefold', 'Ask the assessor what the twelfth seat is', 'Take the twelfth seat at the Ferryman\'s board');
    expect(j.holds('befell', 'company_sworn_ash')).toBe(true);
    expect(j.page).toMatch(/He asks for accuracy/);
    // The oath weighs two; five seats served elsewhere make seven, and the marches are the Ash's.
    for (const seat of ['general', 'tallymen', 'quorn', 'engineer', 'heretic']) { j.assert('befell', `${seat}_served`); }
    await j.play('=+1');
    expect(j.holds('befell', 'ash_triumphs')).toBe(true);
    expect(j.holds('befell', 'ash_broken')).toBe(false);
  }, 60000);
});
