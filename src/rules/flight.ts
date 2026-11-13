import { Canon } from '../canon/canon';

// Getting away from a fight, by the rules' table (vocabulary's combat.flee: 1 in 2, then 3 in 4, then sure), counted
// by the tries that failed: what a try is rolled at (Effects.apply) and the odds the page draws it with (Battle.flight)
// are read from here alike. The odds had been written out a second time in Battle, free to drift (R10-07).
export class Flight {
  // The die and the most it may show for a try after so many failed; none once the next is sure.
  static roll(failed: number): { die: string; atMost: number } | undefined { return Canon.rules.combat.flee[failed]; }
  static odds(failed: number): number {
    const r = this.roll(failed);
    return r ? r.atMost / Number(r.die.split('d')[1]) : 1;
  }
}
