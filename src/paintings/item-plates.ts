import { Canon } from '../canon/canon';
import { CanonValidation } from '../canon/canon-validation';
import { Likeness } from './likeness';
import type { World } from '../lang/world';

// A thing by its kind's plate (the owner's sheets: gear, arms, armour, consumables, valuables, stones), where one is
// cut: a stone found below by its stone's, a module's kind like another by that one's. What has none is told in words
// alone.
export class ItemPlates {
  static of(world: World, item: string): ReturnType<typeof Likeness.portrait> | undefined {
    const kind = world.one('itemKind', item)?.replace(/^.*__/, ''), plate = kind ? Canon.items[kind]?.portrait : undefined;
    return plate && CanonValidation.paintings.has(plate) ? Likeness.portrait(plate) : undefined;
  }
}
