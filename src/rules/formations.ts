import { Canon } from '../canon/canon';
import type { Trait } from '../canon/schema';

// A member as a formation counts it: what it is and what it does.
export interface FormationMember { raceId?: string; classId?: string }
// One member short: what is missing, and which member (by index) the formation does not use, to be changed.
export interface FormationNear { id: string; trait: Trait; missing: string[]; spare: number[] }

// Orsino's party traits: a company whose members include a formation's classes (three clerics make a Clerical
// Synod), or its ancestries (a human, an elf and a dwarf a Free Fellowship), holds that trait, and every member gets
// its perks. A formation needs each of its classes or ancestries as many times as it names them. Recognized when the
// company is formed and kept, as Orsino keeps it.
export class Formations {
  static all(): [string, Trait][] {
    return Object.entries(Canon.traits).filter(([, t]) => t.category === 'party' && t.requires?.company);
  }
  static recognize(members: FormationMember[]): string[] {
    return this.all().filter(([, t]) => this.missing(t, members).length === 0).map(([id]) => id);
  }
  // Formations one member short, and what that member would have to be: shown while a company is chosen.
  static near(members: FormationMember[]): FormationNear[] {
    return this.all().map(([id, trait]) => ({ id, trait, ...this.match(trait, members) }))
      .filter(f => f.missing.length > 0 && f.missing.length < 2 && this.possible(f.trait));
  }
  // Each class or ancestry the formation still needs, once per missing member.
  static missing(trait: Trait, members: FormationMember[]): string[] { return this.match(trait, members).missing; }
  // Matches members to what the formation names: what is still needed, and the members it does not use.
  static match(trait: Trait, members: FormationMember[]): { missing: string[]; spare: number[] } {
    const company = trait.requires!.company!, needed = company.classes ?? company.ancestries ?? [];
    const spare = members.map((_, i) => i), missing: string[] = [];
    for (const need of needed) {
      const i = spare.findIndex(m => (company.classes ? members[m]!.classId : members[m]!.raceId) === need);
      if (i >= 0) { spare.splice(i, 1); } else { missing.push(need); }
    }
    return { missing, spare };
  }
  // A formation a player's company could ever make: every class or ancestry it names can be chosen.
  static possible(trait: Trait): boolean {
    const company = trait.requires!.company!;
    return company.classes ? company.classes.every(c => Canon.classes[c]?.playable)
      : (company.ancestries ?? []).every(a => Canon.ancestries[a]?.playable);
  }
}
