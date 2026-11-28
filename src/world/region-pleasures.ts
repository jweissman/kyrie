import text from '../../data/generation/town/pleasures.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { RegionKey } from './region-key';
import type { Region, Settlement } from './region-writer';
import { RegionPractitioners } from './region-practitioners';

// A few pleasant things to do in every generated settlement (the owner, 20 November: "make sure there's at least a few
// pleasant activities available in every generated town"): three of the pool in data/generation/town/pleasures.kyrt,
// drawn for each settlement by its own key, none drawn twice in a country while the pool has others. The first town
// keeps its own fiddle and cards (neighbours.kyrt), so its three are drawn from the rest; and a town with a tinker of
// its own draws no pump.
export class RegionPleasures {
  static readonly template = KyrTemplates.parse(text);
  static readonly per = 3;
  // The pool: each group of the template is one pleasure.
  static readonly pool = [...new Set(RegionPleasures.template.sections.map(s => s.group))];
  // The first town's own, where it has them: their kin are not drawn there.
  static readonly kept = ['pump', 'fiddle', 'cards'];
  // Where someone who lives there practises tinkering, the old pump is theirs (the tinker kit's resident): a second
  // pump on the same green, with a second mender, is not drawn there (Wrackham had had both, with Elfred).
  static readonly tinkers = ['pump'];
  private static readonly drawn = new WeakMap<Region, Map<string, Map<string, string[]>>>();
  // Each settlement's three, by id: drawn in the settlements' order, from those no other settlement of the country has
  // drawn while there are three such left (the difference census's third proposal: with eight, every life met the same
  // dog in the sun), and then from all.
  static of(region: Region, home = ''): Map<string, string[]> {
    const kept = this.drawn.get(region) ?? new Map<string, Map<string, string[]>>(), had = kept.get(home);
    if (had) { return had; }
    const out = new Map<string, string[]>(), key = RegionKey.of(region), used = new Set<string>();
    const tended = new Set(RegionPractitioners.of(region).filter(p => p.craft === 'tinkering').map(p => p.at));
    for (const s of region.settlements) {
      const pool = this.pool.filter(p => !(s.id === home && this.kept.includes(p))
        && !(tended.has(s.id) && this.tinkers.includes(p)));
      const order = new Draw(`${key}:${s.id}:pleasures`).shuffle(pool);
      const fresh = order.filter(p => !used.has(p)), from = fresh.length >= this.per ? fresh : [...fresh, ...order];
      const three = [...new Set(from)].slice(0, this.per).sort();
      for (const p of three) { used.add(p); }
      out.set(s.id, three);
    }
    this.drawn.set(region, kept.set(home, out));
    return out;
  }
  // The Kyr written for one settlement's three.
  static lines(region: Region, s: Settlement, home = ''): string[] {
    const three = this.of(region, home).get(s.id) ?? [];
    return KyrTemplates.declared(this.template.sections.filter(x => three.includes(x.group)).flatMap(x => x.lines),
      { s: s.id, town: s.name }, 'pleasures');
  }
}
