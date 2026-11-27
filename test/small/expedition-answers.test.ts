import { describe, expect, it } from 'bun:test';
import { QuantityExpeditions } from '../../scripts/quantity/expeditions';

// The five expeditions' explicit branches for OR-1392's grammars (scripts/quantity/expeditions.ts): a band that talks
// is answered with the words the page gives the best odds, talking round before a lie before a warning where they are
// as good, never words it says are beyond the company; a band that lets the company be is asked what it knows; and
// each command is counted as the kind of answer it is.
const row = (command: string, label: string) => ({ command, label });
describe('the expeditions\' answers', () => {
  it('speak at the best odds the page gives, and ask what a band that lets them be knows', () => {
    const even = [row('face_down(cap)', 'Warn the captain off · an even chance · one try'),
      row('pass_off(cap)', 'Tell the captain you are after the same thing · an even chance · one try'),
      row('talk_round(cap)', 'Ask the captain to let you by · an even chance · one try')];
    expect(QuantityExpeditions.words(even, new Set())).toBe('talk_round(cap)');
    const lie = [row('talk_round(cap)', 'Ask the captain to let you by · unlikely · one try'),
      row('pass_off(cap)', 'Tell the captain you are after the same thing · likely · one try')];
    expect(QuantityExpeditions.words(lie, new Set())).toBe('pass_off(cap)');
    expect(QuantityExpeditions.words([row('talk_round(cap)', 'Ask the captain to let you by · beyond you')],
      new Set())).toBeUndefined();
    const asked = [...even, row('cap_tells', 'Ask the captain what is worth having down here')];
    expect(QuantityExpeditions.words(asked, new Set())).toBe('cap_tells');
    expect(QuantityExpeditions.words(asked, new Set(['cap_tells']))).toBe('talk_round(cap)');
  });
  it('count each command as the answer it is', () => {
    expect(['attack(cap)', 'pass_off(cap)', 'face_down(cap)', 'cap_tells', 'listen(door)', 'change_thing(seal)',
      'go(a,b)'].map(id => QuantityExpeditions.answer(id))).toEqual(['fight', 'lie', 'threaten', 'ask', 'listen', 'work',
      undefined]);
  });
});
