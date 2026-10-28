import { describe, expect, it } from 'bun:test';
import { Hours } from '../web/reader/hours';

// A journey says before it is begun that it would end after dark, or go on through the night (PT-31: a journey arrived
// at night, though the way had been told with "go in daylight").
describe('a journey set out on now', () => {
  it('says when it would end after dark', () => {
    const at = (hour: number) => (hour - 8) * 6;
    expect([Hours.dark(at(9), 180), Hours.dark(at(18), 180), Hours.dark(at(21), 60), Hours.dark(at(10), 20 * 60)])
      .toEqual(['', 'after dark', 'after dark', 'after dark']);
  });
});
