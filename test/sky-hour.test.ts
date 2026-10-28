import { describe, expect, it } from 'bun:test';
import { Words } from '../web/reader/words';

// The running head over Tatharimlad read "Night, sunny" (play 9).
describe('the sky in the running head', () => {
  it('is clear at night where it was sunny by day', () => {
    expect([Words.sky('night', 'sunny'), Words.sky('morning', 'sunny'), Words.sky('night', 'foggy'), Words.sky('night')])
      .toEqual(['clear', 'sunny', 'foggy', '']);
  });
});
