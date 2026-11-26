// The setting's own catalogues listed (in the setting, where a read of Canon is its own, not an ambient one).
import { readdirSync, existsSync } from 'node:fs';
import { Canon } from './canon';
import { Likeness } from '../paintings/likeness';

// What the game holds, one a line, for reading and for grep (the owner, 26 November: "`kyrie list professions` …
// that echoes out all known active/effective backgrounds and professions one per line"). Each line is the id, then
// tab-separated what most tells it apart; --count says how many only, --kind=<k> keeps those of one kind, and --json
// prints the records whole. What is listed is what the game compiles and draws on (Canon's catalogs as merged, not
// the files as written), so a hand entry replacing a generated one is listed once, as it plays.
//   bin/kyrie list <what> [--kind=<k>] [--count] [--json]
//   bin/kyrie list            (the lists there are)
interface Row { id: string; cols: string[]; kind?: string; whole: unknown }
type Listed = 'professions' | 'callings' | 'ancestries' | 'skills' | 'abilities' | 'spells' | 'items' | 'conditions'
  | 'portraits' | 'adventures' | 'kits' | 'situations';
export class ListTool {
  static readonly lists: Record<Listed, string> = {
    professions: 'backgrounds and professions a life or a person can have, by kind and source',
    callings: 'the callings (classes) and their specialties',
    ancestries: 'the peoples a life can be born of',
    skills: 'the skills a company brings to bear',
    abilities: 'techniques, spells and natural abilities, and whether each is said in the effect language',
    spells: 'the spells, by tradition and level',
    items: 'what can be carried, by category, with its price',
    conditions: 'the states a creature can be put in',
    portraits: 'the paintings of one sitter, with the sex and station seen in them',
    adventures: 'the adventures under data/adventures',
    kits: 'the kits under data/kits',
    situations: 'the situations under data/situations',
  };
  static main(args: string[], print: (line: string) => void = console.log): number {
    const what = args.find(a => !a.startsWith('--'));
    if (!what || !Object.hasOwn(this.lists, what)) {
      if (what) { print(`no list of ${what}`); }
      Object.entries(this.lists).forEach(([k, about]) => print(`${k}\t${about}`));
      return what ? 1 : 0;
    }
    const kind = args.find(a => a.startsWith('--kind='))?.slice('--kind='.length), all = this.rows(what as Listed);
    const rows = all.filter(r => !kind || r.kind === kind).sort((a, b) => a.id.localeCompare(b.id));
    if (kind && !rows.length) {
      print(`no ${what} of kind ${kind}; the kinds are: ${[...new Set(all.map(r => r.kind).filter(Boolean))].sort()
        .join(', ')}`);
      return 1;
    }
    if (args.includes('--count')) { print(`${rows.length}`); return 0; }
    if (args.includes('--json')) {
      print(JSON.stringify(Object.fromEntries(rows.map(r => [r.id, r.whole])), null, 1));
      return 0;
    }
    rows.forEach(r => print([r.id, ...r.cols].join('\t').trimEnd()));
    return 0;
  }
  static rows(what: Listed): Row[] {
    switch (what) {
      case 'professions': return Object.entries(Canon.backgrounds).map(([id, b]) => ({ id, kind: b.kind, whole: b,
        cols: [b.name, b.kind ?? '', b.source?.orsino ? 'orsino' : 'kyr', b.painting ? 'painted' : ''] }));
      case 'callings': return Object.entries(Canon.classes).map(([id, c]) => ({ id, whole: c,
        cols: [c.name, (c.specializations ?? []).join(', ')] }));
      case 'ancestries': return Object.entries(Canon.ancestries).map(([id, a]) => ({ id, whole: a, cols: [a.name] }));
      case 'skills': return Object.entries(Canon.skills).map(([id, s]) => ({ id, whole: s, cols: [s.name ?? id] }));
      case 'abilities': return Object.entries(Canon.abilities).map(([id, a]) => ({ id, kind: a.kind, whole: a,
        cols: [a.name, a.kind, a.effect ? 'sentence' : 'json'] }));
      case 'spells': return Object.entries(Canon.abilities).filter(([, a]) => a.kind === 'spell')
        .map(([id, a]) => ({ id, kind: a.spell?.tradition, whole: a,
          cols: [a.name, a.spell?.tradition ?? '', `level ${a.spell?.level ?? '?'}`, a.effect ? 'sentence' : 'json'] }));
      case 'items': return Object.entries(Canon.items).map(([id, i]) => ({ id, kind: i.category, whole: i,
        cols: [i.name, i.category ?? '', i.value === undefined ? '' : `${i.value}`] }));
      case 'conditions': return Object.entries(Canon.conditions).map(([id, c]) => ({ id, whole: c, cols: [c.name ?? id] }));
      case 'portraits': return [...Likeness.sitters].map(([id, s]) => ({ id, kind: s.station, whole: s,
        cols: [s.sex, s.age ?? '', s.station ?? '', s.era] }));
      default: return this.dirs(`data/${what}`).map(id => ({ id, whole: { id }, cols: [] }));
    }
  }
  private static dirs(path: string): string[] {
    return existsSync(path) ? readdirSync(path, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
      : [];
  }
}
