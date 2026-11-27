import { describe, expect, it } from 'bun:test';
import { Travel, type Journeyed } from '../../src/session/travel';
import type { CampaignEvent } from '../../src/campaign/campaign';

// What the world said on a leg passed is said with where it was said (GR-07): the pedlar seen far off on the woodland
// south of Reedbridge, passed on the way to the landing, is told at the landing as at that place; what the last leg
// brought is its own telling's, unless its own telling does not tell it.
describe('a journey told', () => {
  it('says what a leg passed said with that place, and the last leg\'s as its own', () => {
    const event = {} as CampaignEvent;
    const done: Journeyed = { arrived: true, legs: [
      { command: 'go(a,b)', said: 'To the woodland', event, told: [{ text: 'A pedlar is coming the other way.', own: true,
        at: 'woodland south of Reedbridge' }] },
      { command: 'go(b,c)', said: 'To the landing', event, told: [{ text: 'The tide is out.', own: true, at: 'the landing' },
        { text: 'Your torch burns out.' }] }] } as Journeyed;
    expect(Travel.way(done)).toEqual(['At woodland south of Reedbridge: A pedlar is coming the other way.',
      'Your torch burns out.']);
  });
});
