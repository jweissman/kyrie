import type { Creature, ItemInstance } from '../creature';
import { Canon } from '../canon/canon';
import { Overlays } from '../overlays';
import { ItemCatalog } from '../item-catalog';

// Where a thing is kept, for the pack to part what is worn or in hand from the supplies a journey uses up and from
// everything else carried (the owner, 9 November: everything carried and worn shown alike); and, for what was packed
// at the start, where it came from: the calling's kit, or the life before (Overlays gives each its own id); and the
// slot it is worn in.
export class ItemStow {
  static of(c: Creature, i: ItemInstance, light: boolean):
    { stow: 'worn' | 'supplies' | 'carried'; packed?: string; slot?: string } {
    const slot = ItemCatalog.get(i.definition).slot;
    const stow = i.equipped ? 'worn' : Canon.items[i.definition]?.category === 'consumable' || light || this.supplies.has(i.definition)
      ? 'supplies' : 'carried';
    const packed = i.id === Overlays.gearId(c.id, i.definition) ? this.packed(c, i.definition) : undefined;
    return { stow, ...packed ? { packed } : {}, ...slot ? { slot } : {} };
  }
  // What a journey uses up that the catalog does not call consumable: food, fire, the means of a camp.
  private static readonly supplies = new Set(['rations', 'firewood', 'bedroll', 'flask', 'waterskin', 'lamp_oil']);
  private static packed(c: Creature, kind: string): string {
    const calling = c.classId ? Canon.classes[Canon.resolve('classes', c.classId)] : undefined;
    if (Overlays.classGear(c).includes(kind)) {
      return `Packed when you set out: ${calling ? `${this.an(calling.name.toLowerCase())}'s` : 'your'} kit.`;
    }
    const life = c.backgroundId ? Canon.backgrounds[c.backgroundId] : undefined;
    return life ? `Yours from your days as ${this.an(life.name.toLowerCase())}.` : 'Yours when you set out.';
  }
  // "an explorer", not "a explorer" (round 5).
  private static an(word: string): string { return `${/^[aeiou]/.test(word) ? 'an' : 'a'} ${word}`; }
}
