import text from '../../data/generation/town/afoot.kyrt' with { type: 'text' };
import { Communities } from './community/community';
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { RegionKey } from './region-key';
import type { Region, Settlement } from './region-writer';

// Something small going on in every generated town that moves on by the days whether or not the company acts (the
// owner's first-hour beat sheet, checkpoint 10: a local situation can develop without the player): a barn going up, a
// feud over a wall, a sick cow, a wedding, a boat on trestles where there is water. One of the pool in
// data/generation/town/afoot.kyrt for each settlement, drawn by its own key from those no other settlement of the
// country has while any are left (three weddings in one country had been drawn); three stages told on its heart by
// the country's clock, and one point where the company may step in, which the last stage remembers.
export class RegionAfoot {
  static readonly template = KyrTemplates.parse(text);
  private static readonly drawnIn = new WeakMap<Region, Map<string, string>>();
  // Each settlement's, by its option's name (barn, feud, cow, wedding, boat), drawn in the settlements' order.
  static drawn(region: Region): Map<string, string> {
    const known = this.drawnIn.get(region);
    if (known) { return known; }
    const out = new Map<string, string>(), used = new Set<string>();
    for (const s of region.settlements) {
      const values = this.values(region, s);
      const fit = this.template.sections.filter(x => (!x.when || values[x.when]) && (!x.unless || !values[x.unless]));
      const fresh = fit.filter(x => !used.has(x.option)), pool = fresh.length ? fresh : fit;
      const pick = pool.length ? new Draw(`${RegionKey.of(region)}:${s.id}:afoot`).pick(pool).option : undefined;
      if (pick) { out.set(s.id, pick); used.add(pick); }
    }
    this.drawnIn.set(region, out);
    return out;
  }
  static lines(region: Region, s: Settlement): string[] {
    const values = this.values(region, s), option = this.drawn(region).get(s.id);
    return this.template.sections.filter(x => x.option === option).flatMap(x => KyrTemplates.declared(x.lines, values, 'afoot'));
  }
  private static values(region: Region, s: Settlement): Record<string, string> {
    return { s: s.id, town: s.name, ...Communities.water(region, s) ? { water: 'yes' } : {} };
  }
}
