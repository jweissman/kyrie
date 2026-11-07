import arms from '../data/catalog/items/arms.json';
import armour from '../data/catalog/items/armour.json';
import gear from '../data/catalog/items/gear.json';
import consumables from '../data/catalog/items/consumables.json';
import wonders from '../data/catalog/items/wonders.json';
import valuables from '../data/catalog/items/valuables.json';
import gems from '../data/catalog/items/gems.json';
import treasure from '../data/generation/tables/treasure.json';

interface Lootable { value?: number; tier?: string; drops?: boolean }

// What a room may hold, by tier: the catalog itself (the owner, 6 November: the catalog is the table, else what is all
// the illustration for). Every kind of thing in the catalog's files is in the tier its worth puts it in, or its own
// `tier`, unless it says `drops: false`; and Orsino's own choices for a tier are in it besides, so they come up the
// more often there. What a body fights with (natural.json) is no file of these, and a drill-yard's fine blades are
// made, not found.
export class LootTables {
  // The most a kind may be worth for each tier, from the worth of what Orsino put in each (basic up to 2, negligible to
  // about 12, minor to 100, major to 600, grand to 1,500, legendary above).
  static readonly bands: [string, number][] = [['basic', 2], ['negligible', 12], ['minor', 100], ['major', 600],
    ['grand', 1500], ['legendary', Infinity]];
  static readonly files = [arms, armour, gear, consumables, wonders, valuables, gems]
    .map(f => f.items as unknown as Record<string, Lootable>);
  static tier(kind: Lootable): string {
    return kind.tier ?? LootTables.bands.find(([, most]) => (kind.value ?? 0) <= most)![0];
  }
  // The `treasure` table of the Deem setting, which the `loot` template draws from.
  static table(): Record<string, unknown> {
    const groups: Record<string, string[]> = Object.fromEntries(Object.entries(treasure.treasure.groups)
      .map(([t, ids]) => [t, [...ids]]));
    for (const file of LootTables.files) {
      for (const [id, kind] of Object.entries(file)) {
        if (kind.drops !== false && !id.startsWith('fine_')) { (groups[LootTables.tier(kind)] ??= []).push(id); }
      }
    }
    return { treasure: { discriminator: 'tier', groups } };
  }
  static readonly tiers = (LootTables.table().treasure as { groups: Record<string, string[]> }).groups;
}
