import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Sheet } from '../web/reader/sheet';

// The cold review's "rest and food are interesting but opaque" (REV-14): the ration clock had to be found out by
// resting and waiting. The pack says when the company next eats, or that it is hungry.
describe('the ration clock', () => {
  it('is said with what the company carries', async () => {
    const j = await Journey.start('test/fixtures/ford-road/campaign.json', 'fed');
    expect(Sheet.fed(j.screen())).toMatch(/^Fed until \d+:\d\d [ap]\.m\..*, when a ration is eaten/);
    const hungry = { ...j.screen(), expedition: { ...j.screen().expedition, hungry: true } };
    expect(Sheet.fed(hungry)).toBe('Hungry: a ration is eaten as soon as there is one.');
  }, 60000);
});
