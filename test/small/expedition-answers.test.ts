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
  it('take up what lies about by the act, not its words, and keep the gear they go down with (OR-1620)', () => {
    const kinds: Record<string, string> = { mirror: 'bronze_mirror', ring: 'ring_of_protection', brand: 'torch' };
    const kind = (act: string) => kinds[/\(([^,)]+)/.exec(act)?.[1] ?? ''] ?? '';
    const lying = [row('take_item(brand,me)', 'Take'), row('take_item(mirror,me)', 'Take'),
      row('take_out(ring,pack,me)', 'Take a ring of protection from a rotted pack'),
      row('change_thing(coins_gather)', 'Gather up the coins')];
    expect(QuantityExpeditions.loot(lying, new Set(), kind)).toBe('take_item(mirror,me)');
    expect(QuantityExpeditions.loot(lying, new Set(['take_item(mirror,me)']), kind)).toBe('take_out(ring,pack,me)');
    expect(QuantityExpeditions.loot(lying.slice(0, 1), new Set(), kind)).toBeUndefined();
  });
  it('go into a room never been in before the way through, deeper first (OR-1620)', () => {
    const ways = [{ id: 'go(halls_through,kings_door)', to: 'kings_door' }, { id: 'go(g,well)', to: 'well' },
      { id: 'go(g,mourners)', to: 'mourners' }, { id: 'go(g,stair)', to: 'stair' }];
    const depth = new Map([['kings_door', 1], ['well', 1], ['mourners', 1], ['stair', 0]]);
    const at = { now: new Set<string>(), ever: new Set(['kings_door', 'stair', 'mourners']), depth };
    expect(QuantityExpeditions.onward(ways, at)).toBe('go(g,well)');
    expect(QuantityExpeditions.onward(ways, { ...at, listen: 'listen(well)' })).toBe('listen(well)');
    // Every room been in once: the way through, then a room not been in on this expedition.
    const all = { ...at, ever: new Set([...at.ever, 'well']) };
    expect(QuantityExpeditions.onward(ways, all)).toBe('go(halls_through,kings_door)');
    expect(QuantityExpeditions.onward(ways, { ...all, now: new Set(['kings_door', 'well']) })).toBe('go(g,mourners)');
  });
  it('count each command as the answer it is', () => {
    expect(['attack(cap)', 'pass_off(cap)', 'face_down(cap)', 'cap_tells', 'listen(door)', 'change_thing(seal)',
      'go(a,b)'].map(id => QuantityExpeditions.answer(id))).toEqual(['fight', 'lie', 'threaten', 'ask', 'listen', 'work',
      undefined]);
  });
});
