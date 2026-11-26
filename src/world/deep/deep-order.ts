import { Draw } from '../land/draw';
import { DeepRooms } from './deep-rooms';
import { Stones } from './stones';
import type { DeepContent } from './deep-pacing';
import type { DeepLayout } from './deep-layout';
import type { DeepPurpose } from './deep-purposes';

// The words a purpose gives its order chest (data/generation/deep/<art>.json, order): the marks it may bear, and how
// each part of it is told; every other key is a placeholder of rooms.kyrt's `order` and `orderright`.
export type OrderWords = Record<string, string> & { marks: string[] };

// One puzzle a site that asks for observation and an inference (the sites commission, item 2): on its second level,
// a chest that opens to three of its marks pressed in an order, the order shown on something in another room of the
// same level. It stands in place of the Orsino riddle the level would have had there, or in a room with no one in it;
// it opens to a thing of the tier, which force breaks. Each mark is one flat act (four acts in view: GRAMMAR.md).
export class DeepOrder {
  // Written before the rooms are (DeepRooms), since a riddle it replaces is not then a casket too.
  static lines(layout: DeepLayout, content: DeepContent[], at: { purpose: DeepPurpose; key: string }): string[] {
    const words = (at.purpose as DeepPurpose & { order?: OrderWords }).order;
    const level = content.filter(c => c.room.level === 1), cache = (at.purpose as { cache?: { role: string } }).cache;
    // A room with no one in it first; where every room has someone (most rooms below the mouth do: OR-1234), one of
    // theirs that no elite keeps, the chest to be had once they are dealt with.
    const open = level.filter(c => c.room.role !== cache?.role && !c.wonder), free = open.filter(c => !c.dwellers);
    const kept = open.filter(c => !c.dwellers?.elite);
    const chest = free.find(c => c.riddle) ?? free.find(c => c.room.y === 1) ?? free[0] ?? kept.find(c => c.riddle)
      ?? kept.find(c => c.room.y === 1) ?? kept[0];
    const frieze = chest && (level.find(c => c !== chest && c.room.y === 1) ?? level.find(c => c !== chest));
    if (!words || !chest || !frieze) { return []; }
    delete chest.riddle;
    const draw = new Draw(`${at.key}:order`), marks = draw.shuffle([...words.marks]).slice(0, 3);
    const shown = [...marks].sort(), id = `${chest.room.id}_order`;
    const named = { a: shown[0]!, b: shown[1]!, c: shown[2]!, first: marks[0]!, second: marks[1]!, third: marks[2]! };
    const said = Object.fromEntries(Object.entries(words).filter(([k]) => k !== 'marks')
      .map(([k, v]) => [k, this.fill(v as string, named)]));
    return [...DeepRooms.section('order', { ...said, id, room: chest.room.id, friezeroom: frieze.room.id }),
      ...shown.flatMap((part, n) => DeepRooms.section('orderright', { ...said, id, room: chest.room.id, n: String(n),
        k: String(marks.indexOf(part)), press: words.press!.replace('{part}', part), ...this.last(id, said,
          marks.indexOf(part) === marks.length - 1) })),
      ...this.gift(id, at.purpose, draw)];
  }
  // The last mark held says the chest opening and opens it; any other, that it holds.
  private static last(id: string, said: Record<string, string>, last: boolean): { saidheld: string; opens: string } {
    return last ? { saidheld: said.right!, opens: ` Retract state(${id}, sealed). Assert state(${id}, open).` }
      : { saidheld: said.held!, opens: '' };
  }
  private static fill(text: string, named: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (all, k: string) => named[k] ?? all);
  }
  // What the chest keeps: one of the makers' own things of worth, or a thing of the minor tier.
  private static gift(id: string, purpose: DeepPurpose, draw: Draw): string[] {
    const own = (purpose.valuables?.minor ?? []).map(v => v.id), tier = Stones.tiers.minor ?? [];
    const kind = own.length && draw.chance(0.6) ? draw.pick(own) : tier.length ? draw.pick(tier) : undefined;
    return kind ? [`  Item ${id}_gift ${JSON.stringify(DeepRooms.called(kind, purpose))} is ${kind} in ${id}.`] : [];
  }
}
