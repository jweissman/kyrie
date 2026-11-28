import { describe, expect, it } from 'bun:test';
import { Deeds } from '../../src/presentation/deeds';
import { Tiny } from '../support/tiny';
import type { Campaign } from '../../src/campaign/campaign';

// Deeds (the owner, 15 November: achievements): what the game remembers of the company, said once each and never as a
// reward or a counter. Earned by what the log and the screen hold; a fresh company has none; a world that has had a
// fight won has the first.
const none = { won: 0, camps: 0, visited: 1, done: 0, party: 1, coin: 0 };
describe('deeds', () => {
  it('are earned by thresholds of what is done, each said once, none for a fresh company', () => {
    expect(Deeds.earned(none)).toEqual([]);
    expect(Deeds.earned({ ...none, won: 1 }).map(d => d.id)).toEqual(['first_blood']);
    expect(Deeds.earned({ ...none, won: 5, camps: 1, visited: 8, done: 1, party: 3, coin: 100 }).map(d => d.id))
      .toEqual(['first_blood', 'blooded', 'afield', 'seen_through', 'open_sky', 'fellowship', 'well_found']);
  });
  it('are counted from the log as it grows, never from the start again', () => {
    const win = { action: 'attack', combat: [{ type: 'end', outcome: 'fighters' }] }, camp = { action: 'camp', combat: [] };
    const history: unknown[] = [win, camp];
    const campaign = { history } as unknown as Campaign;
    expect(Deeds.counts(campaign)).toEqual({ won: 1, camps: 1 });
    history.push(win);
    expect(Deeds.counts(campaign)).toEqual({ won: 2, camps: 1 });
  });
  it('are none on the screen of a fresh company', async () => {
    const t = await Tiny.start(`Place hall "the hall" is room at 0, 0 indoors. Company party "You" of 1 at hall. Goal false.`,
      { horizon: [] });
    expect(t.screen.deeds).toEqual([]);
  });
});
