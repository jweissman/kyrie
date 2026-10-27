import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';

// One world holds every authored adventure (Mission 16's XIII), so no two of them may give one name to different
// people or places: a Coyle in the Corrow and another on the Ghessil Uplands read as kin who are not (What Tessary
// Owes' W25: fourteen such names were found only by a search made by hand). A person's surname, or a one-word name,
// and a place's proper name, are each one adventure's own; first names may be shared, as in any country. The world
// itself (Imbar) is everyone's.
class Names {
  static readonly shared = new Set(['Imbar']);
  static readonly declared = /^\s*(Person|Place)\s+\w+\s+"([^"]+)"/gm;
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
  static readonly titles = new Set(['Speaker', 'Precentor', 'Sir', 'Lady', 'Lord', 'Master', 'Mother', 'Father',
    'Brother', 'Sister', 'Old', 'Young', 'Captain', 'Warden', 'Steward', 'Reeve', 'Saint', 'Dame', 'Doctor']);
  static read(): Map<string, Map<string, string>> {
    const names = new Map<string, Map<string, string>>();
    for (const adventure of readdirSync('data/adventures', { withFileTypes: true }).filter(d => d.isDirectory())) {
      for (const file of readdirSync(`data/adventures/${adventure.name}`).filter(f => f.endsWith('.kyr'))) {
        const text = readFileSync(`data/adventures/${adventure.name}/${file}`, 'utf8');
        for (const m of text.matchAll(this.declared)) {
          // People's names against people's, places' against places' (a dog called Tip and a place called the Tip
          // are not taken for one another).
          for (const n of this.of(m[1]!, m[2]!).map(n => `${m[1]}: ${n}`)) {
            if (!names.has(n)) { names.set(n, new Map()); }
            names.get(n)!.set(adventure.name, m[2]!);
          }
        }
      }
    }
    return names;
  }
}
describe('the names of the adventures one world holds', () => {
  it('are each one adventure\'s own: no surname or proper place-name given in two', () => {
    const clashes = [...Names.read()].filter(([n, by]) => by.size > 1 && !Names.shared.has(n.replace(/^\w+: /, '')))
      .map(([n, by]) => `${n}: ${[...by].map(([a, said]) => `${said} (${a})`).join(', ')}`);
    expect(clashes).toEqual([]);
  });
  // A kind of thing an adventure declares (Kind letter_kind "a letter" is gear) is one catalog's for the whole game:
  // What Tessary Owes and A Parliament of Books each declared a letter_kind, and a career that went from Tessary to
  // Calamy could not install Calamy (the library tour, seed kite).
  it('declare each kind of thing as one adventure\'s own', () => {
    const by = new Map<string, Set<string>>();
    for (const adventure of readdirSync('data/adventures', { withFileTypes: true }).filter(d => d.isDirectory())) {
      for (const file of readdirSync(`data/adventures/${adventure.name}`).filter(f => f.endsWith('.kyr'))) {
        const text = readFileSync(`data/adventures/${adventure.name}/${file}`, 'utf8');
        for (const m of text.matchAll(/^\s*Kind (\w+) "/gm)) {
          by.set(m[1]!, new Set([...by.get(m[1]!) ?? [], adventure.name]));
        }
      }
    }
    expect([...by].filter(([, where]) => where.size > 1).map(([k, where]) => `${k}: ${[...where].join(', ')}`)).toEqual([]);
  });
});
