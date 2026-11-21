import text from '../../data/generation/town/room.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { RegionLetters } from './region-letters';
import { SettlementWriter } from './settlement-writer';
import { Foundings } from './founding';
import type { Region, Settlement } from './region-writer';

// A room of one's own at the house that keeps travellers in the town the company begins in (the first-hour beat
// sheet's checkpoint 7, a home): rented by the week and kept, as data/generation/town/room.kyrt says. Written only
// where the town keeps travellers; its name, its way up, its look and its terms are the house's (the difference
// census's third proposal: every life had been let the same room on the same words): an inn's room under the eaves,
// an alehouse's loft, a guest-cell at the brothers' house, a bunk in a fort's barrack. The letter from home it sends up
// to the pillow is the country's own answer (see RegionLetters).
interface Terms { roomname: string; roomway: string; roomscene: string; roomask: string; price: string; terms: string }
export class RegionRoom {
  static readonly template = KyrTemplates.parse(text);
  static terms(keeping: string, keeper: string, town: string): Terms {
    const k = `{${keeper}}`;
    switch (keeping) {
      case 'alehouse': return { roomname: 'the loft over the alehouse', roomway: 'the ladder up to the loft',
        roomscene: 'A loft under the thatch, with a straw bed, a barrel-hoop on a nail and the smell of malt coming up through the boards.',
        roomask: 'the loft', price: '3',
        terms: `'Three coin the week for the loft, and your supper,' says ${k}. 'You will hear the barrel all night. There is a chest up there that locks.'` };
      case 'guesthouse': return { roomname: "a guest-cell at the brothers' house", roomway: 'the cloister to the guest-cells',
        roomscene: 'A whitewashed cell with a cot, a stool and a window too high to see out of. The bell for the hours can be heard from here.',
        roomask: 'a guest-cell', price: '2',
        terms: `'Two coin the week, and you keep the hours,' says ${k}. 'The cell has a chest. The brothers will not touch it.'` };
      case 'canteen': return { roomname: "a bunk in the fort's barrack", roomway: 'the barrack door',
        roomscene: 'A long barrack of bunks, most of them empty, a stove at one end, and a window onto the wall-walk.',
        roomask: 'a bunk', price: '3',
        terms: `'Three coin the week for a bunk,' says ${k}. 'Sleep through the bugle and the sergeant will find you work. The chest under it is yours.'` };
      default: return { roomname: 'your room upstairs', roomway: 'the stair up to your room',
        roomscene: `A low room under the eaves, with a bed under a patched quilt and a window over ${town}.`,
        roomask: 'a room of your own', price: '4',
        terms: `'Four coin the week, bed and board,' says ${k}. The coins are gone before you have quite decided. 'Top of the stair. There is a chest, and nobody opens it but you.'` };
    }
  }
  static lines(region: Region, s: Settlement): string[] {
    if (!SettlementWriter.rooms(region, s).taproom) { return []; }
    const letter = region.letter ?? RegionLetters.table.default[0]!;
    const keeping = Foundings.of(region, region.settlements.indexOf(s)).keeping;
    const values = { t: s.id, town: s.name, letterfrom: letter.from, letter: letter.news,
      ...this.terms(keeping, `${s.id}_innkeeper`, s.name) };
    return this.template.sections.flatMap(x => KyrTemplates.fill(x.lines, values));
  }
}
