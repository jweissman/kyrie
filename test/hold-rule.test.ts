import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../src/ui/choice-list';
import type { Act } from '../src/ui/screen-types';

// Which acts are held rather than touched (the owner, 14 November: "sustained actions in the game should … require
// long-touch"): by the act's action and its minutes, typed, never its words. A presentation of the act; nothing about
// what it does or how long it takes changes.
describe('an act held', () => {
  const act = (does: string, minutes?: number, label = 'Do it'): Act =>
    ({ key: does, label, command: `${does}(party)`, does, ...minutes ? { minutes } : {} });
  it('is a search, a wait, a rest or a camp, by its action', () => {
    for (const does of ['search', 'wait', 'wait_watch', 'wait_for_light', 'rest', 'camp']) {
      expect([does, ChoiceList.choice(act(does), 'x', 'company').hold]).toEqual([does, 'sustained']);
    }
  });
  it('is anything of half an hour or more, and nothing quicker, whatever it is called', () => {
    expect(ChoiceList.choice(act('look_closely', 30), 'x', 'thing').hold).toBe('sustained');
    expect(ChoiceList.choice(act('look_closely', 10, 'Search the cart thoroughly'), 'x', 'thing').hold).toBeUndefined();
    expect(ChoiceList.choice(act('talk_to', undefined, 'Wait for her to finish'), 'x', 'person').hold).toBeUndefined();
  });
});
