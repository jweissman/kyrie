import { describe, expect, it } from 'bun:test';
import { Words } from '../web/reader/words';

// What the company did is told back as the act, without what the choice said of its odds (round 5: "You read the
// ring of letters on the flag · likely.").
describe('what was done, told back', () => {
  it('is the act, not its odds', () => {
    expect(Words.echo(Words.lastSaid('Read the ring of letters on the flag · likely'))).toBe('You read the ring of letters on the flag.');
    expect(Words.lastSaid('Talk › Tell the sergeant his war is over, and the road is not his · an even chance · one try'))
      .toBe('Tell the sergeant his war is over, and the road is not his');
  });
});
