import type { Choice } from './choice-list';

// What a choice the page leads with costs, said after it in the lead's note (see Affordances' served): a bed, a light,
// a hand, a cure, a sale, a lesson. Kept apart from Affordances, which is at its length.
export class ChoicePrice {
  static fee(c: Choice): string {
    const fee = c.note?.split(' · ')[0];
    return fee && /coin$/.test(fee) ? `, ${fee}` : '';
  }
  // What a lesson teaches, out of its row's words ("Train Wenna in Cleave — 20 coin": Cleave).
  static lesson(c: Choice): string { return c.label.replace(/^Train (\S+ )?(in )?| — .+$/g, ''); }
  // Its price said after it, unless its own words say it already ("Ask Ebba for healing, 2 coin": CL-24).
  static priced(c: Choice): string {
    const fee = c.note?.split(' · ')[0], said = !!fee && c.label.endsWith(fee);
    return `${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}${fee && /coin$/.test(fee) && !said ? `, ${fee}` : ''}`;
  }
}
