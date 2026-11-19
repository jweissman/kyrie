import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// Where in its author's files a lint finding's declaration is ("data/situations/arcology/halls.kyr:105"), so that an
// advice names the line to change and not only the id the module's namespace gave it: found in the files of the
// campaign's own module of that id (beside its bundle), else in the one file of the repository's data that declares it
// (a standing scenario's).
export class LintSource {
  static readonly root = resolve(import.meta.dir, '../..');
  private static readonly texts = new Map<string, string>();
  private static data?: string[];
  // The campaigns of drawn worlds being linted (`kyrie lint --world`): not files, but their standing scenarios'
  // declarations are in data/ (data/situations/walk/gathering.kyr), and found there.
  static readonly drawn = new Set<string>();
  // `path:line: ` before the message, or nothing where it is not found once, or the campaign is not a file (a module
  // written in a spec) and not a drawn world's.
  static at(campaign: string, id: string, keyword: string): string {
    const parts = id.split('__'), local = parts.pop()!, module = parts[0];
    const declares = new RegExp(`\\b${keyword}\\s+${local}\\b`);
    const path = resolve(this.root, campaign), file = campaign.endsWith('.json') && existsSync(path);
    if (!file && !this.drawn.has(campaign)) { return ''; }
    const found = module && file ? this.files(this.bundle(path, module)).filter(f => declares.test(this.text(f))) : [];
    // (Not the shared rules': a name a module shares with them is declared there too.)
    const hits = found.length ? found : (this.data ??= this.files(join(this.root, 'data'))
      .filter(f => !f.includes('/data/rules/'))).filter(f => declares.test(this.text(f)));
    // Of two in data, the one in a directory of its module's name (walk's riot_breaks, not Tessary's).
    const mine = hits.length > 1 && module ? hits.filter(f => f.includes(`/${module}/`)) : hits;
    if (mine.length !== 1) { return ''; }
    const lines = this.text(mine[0]!).split('\n'), line = lines.findIndex(l => declares.test(l)) + 1;
    return `${mine[0]!.slice(this.root.length + 1)}:${line}: `;
  }
  // The directory of the campaign's module of that id, by its bundle.
  private static bundle(path: string, module: string): string | undefined {
    const modules = (JSON.parse(readFileSync(path, 'utf8')) as { modules?: { id: string; bundle?: string }[] })
      .modules ?? [];
    const bundle = modules.find(m => m.id === module)?.bundle;
    return bundle ? dirname(resolve(dirname(path), bundle)) : undefined;
  }
  private static files(dir: string | undefined): string[] {
    if (!dir || !existsSync(dir)) { return []; }
    return readdirSync(dir).sort().flatMap(f => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? this.files(p) : f.endsWith('.kyr') ? [p] : [];
    });
  }
  private static text(file: string): string {
    let text = this.texts.get(file);
    if (text === undefined) { text = readFileSync(file, 'utf8'); this.texts.set(file, text); }
    return text;
  }
}
