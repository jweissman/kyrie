import { describe, expect, it } from 'bun:test';
import { ChoiceList } from '../src/ui/choice-list';
import { Counted } from '../src/presentation/counted';
import type { ItemRow, Screen } from '../src/ui/screen-types';

// Alike things carried are one row with their count, and what is done with it is done with one of them: the Third
// Night's playtest went down with eight torches, and the pack was a torch eight times (AUT-22).
describe('the pack', () => {
  const row = (id: string, name: string, extra: Partial<ItemRow> = {}): ItemRow => ({ id, name, kind: name,
    description: '', owner: 'elen', ownerName: 'Elen', equipped: false,
    acts: [{ key: `light:${id}`, label: 'Light', command: `light_item(${id})` },
      { key: `put:${id}`, label: 'Set down here', command: `put_item(${id})` }],
    ...extra });
  it('counts alike things together, apart from what is in use', () => {
    const items = [row('t1', 'a torch'), row('t2', 'a torch'), row('t3', 'a torch'), row('c1', 'a candle'),
      row('s1', 'a longsword', { equipped: true, slot: 'hand' }), row('s2', 'a longsword')];
    const [pack] = ChoiceList.pack({ items, party: [] } as unknown as Screen);
    expect(pack!.choices.map(c => c.label)).toEqual(['Three torches', 'A candle', 'A longsword', 'A longsword']);
    expect(pack!.choices[0]!.children?.map(c => c.command)).toEqual(['light_item(t1)', 'put_item(t1)']);
  });
  it('says how many in words', () => {
    expect(Counted.many(8, 'torch')).toBe('eight torches');
    expect(Counted.many(2, 'sack of bell-teeth')).toBe('two sacks of bell-teeth');
    expect(Counted.many(14, 'arrow')).toBe('14 arrows');
    // "what thiefs carry by custom" (play 11).
    expect(['thief', 'hunting knife', 'staff', 'ruby'].map(n => Counted.plural(n)))
      .toEqual(['thieves', 'hunting knives', 'staffs', 'rubies']);
  });
});
