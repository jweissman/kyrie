import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../src/ui/choice-list';
import type { Act } from '../src/ui/screen-types';

// Which acts are held rather than touched (the owner, 16 November: sustained input only where cost or irreversibility
// warrants deliberate commitment, a night's rest and a camp; searching, waiting, talking and looking are not
// laborious): by the act's action, typed, never its words or its minutes. A presentation of the act; nothing about what
// it does or how long it takes changes.
describe('an act held', () => {
  const act = (does: string, minutes?: number, label = 'Do it'): Act =>
    ({ key: does, label, command: `${does}(party)`, does, ...minutes ? { minutes } : {} });
  it('is a rest or a camp, by its action', () => {
    for (const does of ['rest', 'rest_unfed', 'camp']) {
      expect([does, ChoiceList.choice(act(does), 'x', 'company').hold]).toEqual([does, 'sustained']);
    }
  });
  // A journey, by its command (the owner's play of 18 November, OR-111: "You should definitely have to long-press
  // commit to travel somewhere"); a walk within the place is a touch.
  it('is a journey set out on, by its command', () => {
    const go = (command: string): Act => ({ key: command, label: 'Go', command, does: 'travel' });
    expect(ChoiceList.choice(go('travel:region__s5'), 'x', 'company').hold).toBe('sustained');
    expect(ChoiceList.choice(go('go(lane,region__s2_green)'), 'x', 'company').hold).toBeUndefined();
  });
  it('is not a search, a wait, a look or a talk, however long it takes or whatever it is called', () => {
    for (const does of ['search', 'wait', 'wait_watch', 'wait_for_light', 'wait_hour']) {
      expect([does, ChoiceList.choice(act(does), 'x', 'company').hold]).toEqual([does, undefined]);
    }
    expect(ChoiceList.choice(act('look_closely', 30), 'x', 'thing').hold).toBeUndefined();
    expect(ChoiceList.choice(act('look_closely', 10, 'Make camp thoroughly'), 'x', 'thing').hold).toBeUndefined();
    expect(ChoiceList.choice(act('talk_to', undefined, 'Rest a while'), 'x', 'person').hold).toBeUndefined();
  });
});
