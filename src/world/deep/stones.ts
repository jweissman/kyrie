import gems from '../../../data/catalog/items/gems.json';
import { LootTables } from '../../loot-tables';
import { Canon } from '../../canon/canon';
import { Content } from '../../content';
import { ItemNames } from '../../item-names';

// A stone found in a deep site: a stone of the catalog's kind, drawn by Orsino's gemstone (its cut, size and quality)
// and worth what its rank is, by what those make of it (data/catalog/items/gems.json), so that no two rubies found are
// the same ruby.
// Its kind is named by what it is (rose_quartz_large_brilliant_good), so that the same stone is the same kind wherever
// it is found, in any country of a world.
export interface DeepStone { kind: string; type: string; name: string; worth: number; text: string }
interface Way { worth?: number; says?: string; name?: string; unsaid?: boolean }

export class Stones {
  // What a room may hold, by tier: the catalog's own kinds by their worth, Orsino's choices among them the more often
  // (LootTables).
  static readonly tiers = LootTables.tiers;
  static readonly kinds = new Set(Object.keys(gems.items));
  static readonly ranks = gems.ranks as Record<string, { worth: number }>;
  static readonly cuts = gems.cuts as Record<string, Way>;
  static readonly sizes = gems.sizes as Record<string, Way>;
  static readonly qualities = gems.qualities as Record<string, Way>;
  // Orsino's loot of a tier: what was left lying in a room by those who came after the makers.
  static loot(tier: string, key: string): string | undefined {
    try { return (new Content(`${key}:loot`).generate('loot', { tier }) as { key: string }).key; }
    catch (error) { if (/No matching options/.test(String(error))) { return undefined; } throw error; }
  }
  // A stone of a kind, or of whatever kind Orsino's gemstone draws.
  static drawn(key: string, kind?: string): DeepStone {
    const g = new Content(`${key}:stone`).generate('gemstone', kind ? { type: kind } : {}) as
      { rank: string; type: string; cut: string; size: string; quality: string };
    const type = g.type, base = Canon.items[type]!, cut = this.cuts[g.cut]!, size = this.sizes[g.size]!;
    const clarity = this.qualities[g.quality]!;
    const stone = cut.name!.replace('{stone}', base.name.toLowerCase());
    const worth = (this.ranks[g.rank]?.worth ?? base.value ?? 1) * (size.worth ?? 1) * (clarity.worth ?? 1);
    const rank = (base.description ?? 'A gemstone').split(',')[0]!;
    return { kind: `${type}_${g.size}_${g.cut}_${g.quality}`, type, name: ItemNames.called(size.unsaid ? stone : `${g.size} ${stone}`),
      worth: Math.max(1, Math.round(worth)), text: `${rank}, ${cut.says}, ${clarity.says}.` };
  }
}
