import tongues from 'languages';
import type { Region } from './region-writer';

interface Named { name: string; feature?: string; affix?: string; gloss?: string; tongue?: string }
// Generated places named in the tongue of the folk who live there. Deem chooses what a name means (a feature and an
// affix from the region's tables: "cold" and "hill"); the region's language says it ("Chealdholm", in Westron), and
// the place keeps the meaning so a description can tell it. A name whose parts the language lacks stays as Deem said.
export class PlaceNames {
  static readonly tongues: Record<string, string> = { human: 'westron', elf: 'quenya', dwarf: 'khuzdul' };
  static render(region: Region): Region {
    const tongue = this.tongues[region.ancestry] ?? 'westron';
    return { ...region, ...this.named(region, tongue),
      settlements: region.settlements.map(s => ({ ...s, ...this.named(s, tongue) })),
      sites: region.sites.map(s => ({ ...s, ...this.named(s, tongue) })) };
  }
  private static named<T extends Named>(place: T, tongue: string): Partial<Named> {
    // A part drawn twice ("fen" and "fen") is said once.
    const parts = [...new Set([place.feature, place.affix])];
    if (parts.some(p => !p)) { return {}; }
    const dictionary = tongues.getDictionary(tongue);
    try {
      return { name: dictionary.translate(...parts as Parameters<typeof dictionary.translate>).trim(),
        gloss: parts.join(' '), tongue: dictionary.name };
    } catch { return {}; }
  }
}
