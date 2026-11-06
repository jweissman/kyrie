import { Canon } from '../canon/canon';

// What a herbalist pays for what is gathered wild (the owner, 6 November: the herb-wife pays you to collect the rare
// ones): every plant's yield, by how seldom it is met (data/catalog/plants.json, abundance): a coin for what grows
// wherever it can, more for the scarce. One table for the herb-wife on a green and the remedies shop alike.
export class Herbals {
  static price(abundance?: number): number {
    return abundance === undefined || abundance >= 5 ? 1 : abundance >= 3 ? 2 : abundance >= 2 ? 3 : 6;
  }
  static buys(): [string, number][] {
    const seen = new Map<string, number>();
    for (const p of Object.values(Canon.plants)) {
      if (p.yields && Canon.items[p.yields]) {
        seen.set(p.yields, Math.max(seen.get(p.yields) ?? 0, this.price(p.abundance)));
      }
    }
    return [...seen];
  }
}
