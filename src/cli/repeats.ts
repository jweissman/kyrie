// `kyrie voice repeats <module>`: an author's own phrases that come again and again across a module's texts (what is
// said, greeted, seen, done and told by its rules), most repeated first, with where each is (Wapshott's Circus friction
// 25, WPC-25: "for a long time" fifteen times, "purring like a millstone" twice, and `kyrie voice` read only the
// shared voice tables).
//   bin/kyrie voice repeats <dir or file.kyr ...> [--top n]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface Repeat { phrase: string; count: number; at: string[] }
export class Repeats {
  // Words that make no phrase an author's own: a phrase must have two words besides these.
  static readonly common = new Set(('a an the and or but nor of to in on at by for with from into onto up down out off '
    + 'over under as is are was were be been it its it’s he she they them his her their you your we us our i me my '
    + 'this that these those there here not no so then than if when while what who which one all some has have had '
    + 'do does did will would can could shall should may might must').split(' '));
  // The texts of the .kyr files under each path: each quoted text of five words or more, with its file and line; a
  // shorter one is a name.
  static texts(paths: string[], root = process.cwd()): { text: string; at: string }[] {
    const out: { text: string; at: string }[] = [];
    for (const file of paths.flatMap(p => this.files(p))) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (/^\s*\/\//.test(line)) { return; }
        for (const m of line.matchAll(/"((?:\\.|[^"\\])*)"/g)) { out.push({ text: m[1]!, at: `${relative(root, file)}:${i + 1}` }); }
      });
    }
    return out;
  }
  private static words(text: string): string[] {
    return text.split(/[^A-Za-z’'-]+/).map(w => w.replace(/^['’-]+|['’-]+$/g, '')).filter(Boolean);
  }
  private static files(path: string): string[] {
    if (!statSync(path).isDirectory()) { return path.endsWith('.kyr') ? [path] : []; }
    return readdirSync(path).sort().flatMap(f => this.files(join(path, f)));
  }
  // The phrases of three to six words said more than once, each as long as it runs (a shorter one inside a longer said
  // as often is the longer's), most often first.
  // A phrase with a name in it is the name's, not the author's habit: one named in capitals ("the Door of Doors"), or
  // one of the module's own names ("the fish stairs").
  static find(texts: { text: string; at: string }[], top = 20): Repeat[] {
    const seen = new Map<string, string[]>(), long = texts.filter(t => t.text.split(/\s+/).length >= 5);
    const names = texts.filter(t => t.text.split(/\s+/).length < 5).map(t => this.words(t.text).join(' ').toLowerCase())
      .filter(n => n.split(' ').filter(w => !this.common.has(w)).length >= 2);
    for (const { text, at } of long) {
      for (const clause of text.replace(/\{[^}]*\}/g, ',').split(/[.,;:!?—–()“”"‘]|\s'|'\s/)) {
        const words = this.words(clause);
        for (let n = 3; n <= 6; n++) {
          for (let i = 0; i + n <= words.length; i++) {
            const phrase = words.slice(i, i + n), key = phrase.join(' ').toLowerCase();
            if (phrase.some((w, k) => (i + k > 0) && /^[A-Z]/.test(w))
              || phrase.filter(w => !this.common.has(w.toLowerCase())).length < 2
              || names.some(name => ` ${key} `.includes(` ${name} `))) { continue; }
            seen.set(key, [...seen.get(key) ?? [], at]);
          }
        }
      }
    }
    const kept = [...seen].filter(([, at]) => at.length > 1).map(([phrase, at]) => ({ phrase, count: at.length, at }));
    return kept.filter(r => !kept.some(o => o.count === r.count && o.phrase.length > r.phrase.length
      && ` ${o.phrase} `.includes(` ${r.phrase} `)))
      .sort((a, b) => b.count - a.count || b.phrase.length - a.phrase.length).slice(0, top);
  }
  static main(args: string[], print: (line: string) => void = console.log): number {
    const at = args.indexOf('--top'), top = at < 0 ? 20 : Number(args[at + 1]);
    const paths = args.filter((a, i) => a !== '--top' && args[i - 1] !== '--top');
    if (!paths.length) { print('usage: kyrie voice repeats <dir or file.kyr ...> [--top n]'); return 1; }
    const found = this.find(this.texts(paths), top);
    for (const r of found) {
      const more = r.at.length > 6 ? `, and ${r.at.length - 6} more` : '';
      print(`${String(r.count).padStart(3)}× “${r.phrase}”  ${r.at.slice(0, 6).join(', ')}${more}`);
    }
    if (!found.length) { print('no phrase of three words or more is said twice'); }
    return 0;
  }
}
