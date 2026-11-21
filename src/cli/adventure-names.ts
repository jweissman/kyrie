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
  static readonly declared = /^\s*(Person|Place|Kind)\s+(\w+)\s+"([^"]+)"/gm;
  static readonly titles = new Set(['Speaker', 'Precentor', 'Sir', 'Lady', 'Lord', 'Master', 'Mother', 'Father',
    'Brother', 'Sister', 'Old', 'Young', 'Captain', 'Warden', 'Steward', 'Reeve', 'Saint', 'Dame', 'Doctor']);
  // A person's surname, or the name of one called by one name; a place's name without its article, if it is a
  // proper name.
  // A kind of thing by its id, which is the world's one namespace of kinds (Fair Weather's 13: a clash found by a
  // test, not as an author drafts).
  static of(kind: string, name: string, id = ''): string[] {
    if (kind === 'Kind') { return [id]; }
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
          for (const n of this.of(m[1]!, m[3]!, m[2]!).map(n => `${m[1]}: ${n}`)) {
            if (!names.has(n)) { names.set(n, new Map()); }
            names.get(n)!.set(adventure.name, m[3]!);
          }
        }
      }
    }
    return names;
  }
  // `kyrie names Pargeter Tench …`: whether each name is free, or which adventure has it, before a page is written with
  // it (Quittance's friction 1: nine of the first twenty surnames were taken, found one at a time by the lint).
  static main(words: string[]): number {
    const names = [...this.read()], lines = words.map(w => {
      const by = names.filter(([n]) => n.replace(/^\w+: /, '').toLowerCase() === w.toLowerCase())
        .flatMap(([, m]) => [...m].map(([a, said]) => `${said} (${a})`));
      const firsts = [...this.firsts().get(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) ?? []]
        .map(([a, said]) => `${said} (${a})`);
      const also = firsts.length ? `; as a first name, given by ${firsts.join(', ')} (advisory)` : '';
      return `${w}: ${by.length ? `taken by ${by.join(', ')}` : 'free'}${also}`;
    });
    console.log(lines.join('\n'));
    return lines.some(l => l.includes(': taken by ')) ? 1 : 0;
  }
  // "Person: Coyle: Agnes Coyle (low-water), Dennet Coyle (the-patient-star)".
  static clashes(root?: string): string[] {
    return [...this.read(root)].filter(([n, by]) => by.size > 1 && !this.shared.has(n.replace(/^\w+: /, '')))
      .map(([n, by]) => `${n}: ${[...by].map(([a, said]) => `${said} (${a})`).join(', ')}`);
  }
  // Each module id the adventures declare, with the adventures that declare it: two adventures of one id are one module
  // to the engine (The Ninth Voice's friction 1, AU-19: `pellam` scaffolded over The Liberty of the Ice's).
  static modules(root = resolve(import.meta.dir, '../../data/adventures')): Map<string, Set<string>> {
    const ids = new Map<string, Set<string>>();
    for (const dir of readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())) {
      for (const file of readdirSync(join(root, dir.name)).filter(f => /\.kyrt?$/.test(f))) {
        for (const m of readFileSync(join(root, dir.name, file), 'utf8').matchAll(/^\s*Module\s+(\w+)\b/gm)) {
          ids.set(m[1]!, new Set([...ids.get(m[1]!) ?? [], dir.name]));
        }
      }
    }
    return ids;
  }
  // "Module pellam: liberty-of-the-ice, pellam".
  static twice(root?: string): string[] {
    return [...this.modules(root)].filter(([, by]) => by.size > 1).map(([id, by]) => `Module ${id}: ${[...by].join(', ')}`);
  }
  // A person's first name another adventure gives a person too (The Ninth Voice's friction 3, AU-21: its choirmistress
  // Ysolde, and The Book of Faces' Registrar): advisory, as first names may be shared, but a small corpus feels it.
  static firsts(root = resolve(import.meta.dir, '../../data/adventures')): Map<string, Map<string, string>> {
    const names = new Map<string, Map<string, string>>();
    // In the adventures' order by name, never the file system's (CI lists them otherwise than a desk does).
    const dirs = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const dir of dirs) {
      for (const file of readdirSync(join(root, dir.name)).filter(f => f.endsWith('.kyr')).sort()) {
        for (const m of readFileSync(join(root, dir.name, file), 'utf8').matchAll(this.declared)) {
          const first = m[1] === 'Person' ? this.first(m[3]!) : undefined;
          if (!first) { continue; }
          if (!names.has(first)) { names.set(first, new Map()); }
          names.get(first)!.set(dir.name, m[3]!);
        }
      }
    }
    return names;
  }
  // The first of a person's proper names where they have two or more ("Ysolde Marr"), or the one ("Ysolde").
  private static first(name: string): string | undefined {
    if (!/^[A-Z]/.test(name) || /^The /.test(name)) { return undefined; }
    return name.split(/\s+/).find(w => /^[A-Z][a-z]+$/.test(w) && !this.titles.has(w));
  }
  // "Ysolde: Ysolde (the-book-of-faces), Ysolde Venn (the-ninth-voice)", for the first names one adventure shares.
  static sharedFirsts(adventure: string, root?: string): string[] {
    return [...this.firsts(root)].filter(([, by]) => by.has(adventure) && by.size > 1)
      .map(([n, by]) => `${n}: ${[...by].map(([a, said]) => `${said} (${a})`).join(', ')}`);
  }
}
