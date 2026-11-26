import type { ItemCatalog } from '../item-catalog';
import type { Creature } from '../creature';

// What a member carries, and how much they can carry before it slows them. A kind of thing weighs what it says it
// weighs (a module's own kind, "weighing 2"), else what its class of weapon or armour weighs, else what things of its
// category weigh: a lump of ore is heavy in the hand, a ring is nothing, a coat of scale is a load in itself. Anyone
// can carry ten and twice their strength; past that they go slowly.
export class Burden {
  static readonly weapons: Record<string, number> = { light: 1, medium: 2, heavy: 4 };
  static readonly armours: Record<string, number> = { light: 4, medium: 8, heavy: 12 };
  static readonly categories: Record<string, number> = { weapon: 2, armor: 8, tool: 2, gear: 1, equipment: 1,
    consumable: 0, treasure: 1 };
  static mass(catalog: ItemCatalog, kind: string): number {
    const item = catalog.find(kind);
    if (!item) { return 1; }
    if (item.mass !== undefined) { return item.mass; }
    const weapon = item.weapon?.weight && this.weapons[item.weapon.weight];
    const armour = item.armor?.weight && this.armours[item.armor.weight];
    return weapon || armour || (item.category ? this.categories[item.category] : undefined) || 1;
  }
  static load(catalog: ItemCatalog, c: Creature): number {
    return (c.state.inventory ?? []).reduce((n, i) => n + this.mass(catalog, i.definition), 0);
  }
  // Anyone can carry ten and twice their strength (with what they wear: a belt of giant strength), and what a beast
  // they lead carries besides (a pack mule's thirty).
  static capacity(catalog: ItemCatalog, c: Creature): number {
    return 10 + 2 * catalog.quality(c, 'strength')
      + (c.state.inventory ?? []).reduce((n, i) => n + this.carries(catalog, i.definition), 0);
  }
  static carries(catalog: ItemCatalog, kind: string): number { return catalog.find(kind)?.carries ?? 0; }
}
