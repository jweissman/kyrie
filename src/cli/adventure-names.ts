import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// One world holds every authored adventure (Mission 16's XIII), so no two of them may give one name to different
// people or places: a Coyle in the Corrow and another on the Ghessil Uplands read as kin who are not (What Tessary
// Owes' W25: fourteen such names were found only by a search made by hand). A person's surname, or a one-word name,
// and a place's proper name, are each one adventure's own; first names may be shared, as in any country. The world
// itself (Imbar) is everyone's. `kyrie lint` says so as an author drafts, not a test after (the Liberty of the Ice's
// 26; A Winter in Carth's 15).
export class AdventureNames {
  static readonly shared = new Set(['Imbar']);
  static readonly declared = /^\s*(Person|Place)\s+\w+\s+"([^"]+)"/gm;
  static readonly titles = new Set(['Speaker', 'Precentor', 'Sir', 'Lady', 'Lord', 'Master', 'Mother', 'Father',
    'Brother', 'Sister', 'Old', 'Young', 'Captain', 'Warden', 'Steward', 'Reeve', 'Saint', 'Dame', 'Doctor']);
  // A person's surname, or the name of one called by one name; a place's name without its article, if it is a
  // proper name.
  static of(kind: string, name: string): string[] {
    const words = name.replace(/^(the|a|an) /i, '').replace(/'s\b|’s\b/g, '').split(/\s+/);
    if (kind === 'Person') {
      const proper = words.filter(w => /^[A-Z][a-z]+$/.test(w) && !this.titles.has(w));
      return proper.length && /^[A-Z]/.test(name) && !/^The /.test(name) ? [proper.at(-1)!] : [];
    }
    return /^(the |)[A-Z]/.test(name) && !/^[A-Z][a-z]+ of /.test(name) && words.every(w => /^[A-Z]/.test(w))
      ? [words.join(' ')] : [];
  }
  // People's names against people's, places' against places' (a dog called Tip and a place called the Tip are not
  // taken for one another): each name, and the adventures that give it, with what each calls it.
  static read(root = resolve(import.meta.dir, '../../data/adventures')): Map<string, Map<string, string>> {
    const names = new Map<string, Map<string, string>>();
    const adventures = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const adventure of adventures) {
      for (const file of readdirSync(join(root, adventure.name)).filter(f => f.endsWith('.kyr'))) {
        for (const m of readFileSync(join(root, adventure.name, file), 'utf8').matchAll(this.declared)) {
          for (const n of this.of(m[1]!, m[2]!).map(n => `${m[1]}: ${n}`)) {
            if (!names.has(n)) { names.set(n, new Map()); }
            names.get(n)!.set(adventure.name, m[2]!);
          }
        }
      }
    }
    return names;
  }
  // "Person: Coyle: Agnes Coyle (low-water), Dennet Coyle (the-patient-star)".
  static clashes(root?: string): string[] {
    return [...this.read(root)].filter(([n, by]) => by.size > 1 && !this.shared.has(n.replace(/^\w+: /, '')))
      .map(([n, by]) => `${n}: ${[...by].map(([a, said]) => `${said} (${a})`).join(', ')}`);
  }
}
