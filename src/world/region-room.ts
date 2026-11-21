import text from '../../data/generation/town/room.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { RegionLetters } from './region-letters';
import { SettlementWriter } from './settlement-writer';
import type { Region, Settlement } from './region-writer';

// A room of one's own at the inn of the town the company begins in (the first-hour beat sheet's checkpoint 7, a home):
// rented by the week and kept, as data/generation/town/room.kyrt says. Written only where the town keeps travellers;
// the letter from home it sends up to the pillow is the country's own answer (see RegionLetters).
export class RegionRoom {
  static readonly template = KyrTemplates.parse(text);
  static lines(region: Region, s: Settlement): string[] {
    if (!SettlementWriter.rooms(region, s).taproom) { return []; }
    const letter = region.letter ?? RegionLetters.table.default[0]!;
    const values = { t: s.id, town: s.name, letterfrom: letter.from, letter: letter.news };
    return this.template.sections.flatMap(x => KyrTemplates.fill(x.lines, values));
  }
}
