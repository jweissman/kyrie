import text from '../../data/generation/wild/animals.kyrt' with { type: 'text' };
import { Canon } from '../canon/canon';
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { RegionGrowth } from './region-growth';
import { RegionMeetings } from './region-meetings';
import { RegionTracts } from './region-tracts';
import { RegionEcology } from './region-ecology';
import type { Region } from './region-writer';

// The animals of a country met where they live (the owner, 5 November, late: an animal added to animals.json is met
// where it lives, with nothing else to write): about one stretch in eight of the open country that no meeting holds
// has an animal of its habitats, drawn by how common each is, and never more than a few dozen. What is written for one
// is the author's, in data/generation/wild/animals.kyrt.
export class RegionAnimals {
  static readonly template = KyrTemplates.parse(text);
  static readonly most = 30;
  static lines(region: Region): string[] {
    const met = new Set(RegionMeetings.meetings(region).map(m => m.cell)), draw = new Draw(`${region.name}:animals`);
    const standing = new Set(RegionTracts.standing(region).map(s => s.cell));
    const cells = RegionTracts.cells(region).filter(c => !met.has(c) && !standing.has(c));
    const chosen = draw.shuffle(cells).slice(0, Math.min(this.most, Math.round(cells.length / 8)));
    const lines = this.template.sections.flatMap(s => s.lines);
    // A kind of country known by its terrain alone (the desert, the snows) is every stretch of it.
    const country = Object.entries(Canon.habitats).filter(([, h]) => !h.covers && h.terrains?.includes(region.terrain))
      .map(([id]) => id);
    return chosen.sort((a, b) => a - b).flatMap(c => {
      const kinds = RegionEcology.seen(new Set([...RegionGrowth.habitats(region, [c]), ...country]));
      if (!kinds.length) { return []; }
      const [species, s] = new Draw(`${region.name}:animal:${c}`).weighted(kinds.map(k => [k, k[1].abundance!] as const));
      const name = s.name.toLowerCase();
      return KyrTemplates.fill(lines, { a: `wa${c}`, tract: RegionTracts.id(c), species,
        name: `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`,
        looks: (s.looks ?? s.description).replace(/^./, ch => ch.toLowerCase()).replace(/\.$/, '') });
    });
  }
}
