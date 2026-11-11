import { describe, expect, it } from 'bun:test';
import { MapView } from '../web/reader/map-view';
import type { Screen } from '../src/ui/screen-types';

// What a journey costs of food and rest, said before setting out (the owner's play of 10 November): a ration at each
// mealtime it passes, a day apart; going hungry where there are too few; going on weary.
describe('a journey, before it is set out on', () => {
  const at = (rations: number, weary = false) =>
    ({ elapsed: 0, expedition: { mealAt: 72, rations, weary } } as unknown as Screen);
  it('says nothing where it passes no mealtime', () => {
    expect(MapView.provision(at(2), 300)).toBe('');
  });
  it('says the rations it eats, and hunger where there are too few', () => {
    expect(MapView.provision(at(2), 1000)).toBe('You would eat a ration on the way, of the 2 you carry.');
    expect(MapView.provision(at(1), 2300)).toBe('You would need 2 rations on the way, and carry 1: you would go hungry.');
    expect(MapView.provision(at(0, true), 1000)).toBe('You would need a ration on the way, and carry none: you would go '
      + 'hungry. You are weary, and would go on without sleep.');
  });
});
