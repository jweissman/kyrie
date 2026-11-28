import text from '../../data/generation/wild/animals.kyrt' with { type: 'text' };
import { Canon } from '../canon/canon';
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { RegionGrowth } from './region-growth';
import { RegionMeetings } from './region-meetings';
import { RegionTracts } from './region-tracts';
import { RegionEcology } from './region-ecology';
import type { Region } from './region-writer';
import { RegionKey } from './region-key';

// The animals of a country met where they live (the owner, 5 November, late: an animal added to animals.json is met
// where it lives, with nothing else to write): about one stretch in eight of the open country that no meeting holds
// has an animal of its habitats, drawn by how common each is, and never more than a few dozen. What is written for one
// is the author's, in data/generation/wild/animals.kyrt.
export class RegionAnimals {
  static readonly template = KyrTemplates.parse(text);
  static readonly most = 30;
  static lines(region: Region): string[] {
    const met = new Set(RegionMeetings.meetings(region).map(m => m.cell));
    const standing = new Set(RegionTracts.standing(region).map(s => s.cell));
    const cells = RegionTracts.cells(region).filter(c => !met.has(c) && !standing.has(c));
    const chosen = Draw.ranked(`${RegionKey.of(region)}:animals`, cells).slice(0, Math.min(this.most, Math.round(cells.length / 8)));
    const lines = this.template.sections.flatMap(s => s.lines);
    // A kind of country known by its terrain alone (the desert, the snows) is every stretch of it.
    const country = Object.entries(Canon.habitats).filter(([, h]) => !h.covers && h.terrains?.includes(region.terrain))
      .map(([id]) => id);
    return chosen.sort((a, b) => a - b).flatMap(c => {
      const kinds = RegionEcology.seen(new Set([...RegionGrowth.habitats(region, [c]), ...country]));
      if (!kinds.length) { return []; }
      const [species, s] = new Draw(`${RegionKey.of(region)}:animal:${c}`).weighted(kinds.map(k => [k, k[1].abundance!] as const));
      const name = s.name.toLowerCase(), called = `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`;
      // Said after its name, so not its name again: "a beetle, as big as a hand", where the record's own looks begin
      // "A beetle as big as a hand" (kyrie lint's role: "a beetle, a beetle as big as a hand").
      const looks = (s.looks ?? s.description).replace(/^./, ch => ch.toLowerCase()).replace(/\.$/, '');
      return KyrTemplates.declared(lines, { a: `wa${c}`, tract: RegionTracts.id(c), species, name: called,
        looks: looks.startsWith(`${called} `) ? looks.slice(called.length + 1) : looks }, 'animals');
    });
  }
}
