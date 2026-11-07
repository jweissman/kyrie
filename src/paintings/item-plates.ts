import { Canon } from '../canon/canon';
import { CanonValidation } from '../canon/canon-validation';
import { Likeness } from './likeness';
import type { World } from '../lang/world';

// A thing by its kind's plate (the owner's sheets: gear, arms, armour, consumables, valuables, stones), where one is
// cut: a stone found below by its stone's, a module's kind like another by that one's. What has none is told in words
// alone.
export class ItemPlates {
  static of(world: World, item: string): ReturnType<typeof Likeness.portrait> | undefined {
    const kind = world.one('itemKind', item);
    return kind ? ItemPlates.kind(kind) : undefined;
  }
  // A kind's plate, by the catalog's id for it (torch, ring_of_protection), a module's own kind by the kind it is.
  static kind(kind: string): ReturnType<typeof Likeness.portrait> | undefined {
    const plate = Canon.items[kind.replace(/^.*__/, '')]?.portrait;
    return plate && CanonValidation.paintings.has(plate) ? Likeness.portrait(plate) : undefined;
  }
}
