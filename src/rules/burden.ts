import { Canon } from '../canon/canon';
import type { Creature } from '../creature';
import type { ItemKind } from '../canon/schema';

// What a member carries, and how much they can carry before it slows them. A kind of thing weighs what it says it
// weighs (a module's own kind, "weighing 2"), else what its class of weapon or armour weighs, else what things of its
// category weigh: a lump of ore is heavy in the hand, a ring is nothing, a coat of scale is a load in itself. Anyone
// can carry ten and twice their strength; past that they go slowly.
export class Burden {
  static readonly weapons: Record<string, number> = { light: 1, medium: 2, heavy: 4 };
  static readonly armours: Record<string, number> = { light: 4, medium: 8, heavy: 12 };
  static readonly categories: Record<string, number> = { weapon: 2, armor: 8, tool: 2, gear: 1, equipment: 1,
    consumable: 0, treasure: 1 };
  static mass(kind: string): number {
    const item = Canon.items[kind] as (ItemKind & { mass?: number }) | undefined;
    if (!item) { return 1; }
    if (item.mass !== undefined) { return item.mass; }
    const weapon = item.weapon?.weight && this.weapons[item.weapon.weight];
    const armour = item.armor?.weight && this.armours[item.armor.weight];
    return weapon || armour || (this.categories[item.category] ?? 1);
  }
  static load(c: Creature): number {
    return (c.state.inventory ?? []).reduce((n, i) => n + this.mass(i.definition), 0);
  }
  static capacity(c: Creature): number { return 10 + 2 * c.base.strength; }
}
