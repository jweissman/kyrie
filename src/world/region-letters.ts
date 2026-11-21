import table from '../../data/generation/town/letters.json';
import backgrounds from '../../data/catalog/backgrounds.json';
import { Draw } from './land/draw';
import { RegionKey } from './region-key';
import type { Region } from './region-writer';

export interface Letter { from: string; news: string }
// The answer to a letter home (the scrivener's: data/generation/town/teachers.kyrt), from the character's own people:
// by the origin their life set out from (the drove's mother in the fells above Brynach, the weir's mother, Tegwen's
// sister), else by the kind of their background, else the old default (the goat, the sister, the top field), which
// every company had heard. Drawn by the country's key from data/generation/town/letters.json.
export class RegionLetters {
  static readonly table = table as { origins: Record<string, Letter[]>; kinds: Record<string, Letter[]>;
    default: Letter[] };
  // The country's answer, for the protagonist an origin makes (Origins.protagonist): by their origin, else
  // their background.
  static give(region: Region, origin: string | undefined, protagonist?: { backgroundId?: string }): void {
    region.origin = origin;
    region.letter = this.of(region, { ...origin ? { origin } : {},
      ...protagonist?.backgroundId ? { background: protagonist.backgroundId } : {} });
  }
  // The kind of life a background is of (the catalog's backgroundKind: wild, roads, learning…).
  private static kind(background: string): string | undefined {
    const table = backgrounds as unknown as { backgroundKind: { groups: Record<string, string[]> } };
    const groups = table.backgroundKind.groups;
    return Object.entries(groups).find(([, ids]) => ids.includes(background))?.[0];
  }
  static of(region: Region, at: { origin?: string; background?: string }): Letter {
    const kind = at.background ? this.kind(at.background) : undefined;
    const pool = (at.origin && this.table.origins[at.origin]) || (kind && this.table.kinds[kind]) || this.table.default;
    return new Draw(`${RegionKey.of(region)}:letter`).pick(pool);
  }
}
