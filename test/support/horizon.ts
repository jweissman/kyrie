import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RulePackages, type RulePackageDeclaration } from '../../src/campaign/rule-packages';
import { ModuleParser } from '../../src/lang/index';

// What a fragment is proved among (OR-407; the owner, 24 November: "just testing a tiny rule doesn't pull in the
// universe"): the kernel of the shared rules (places and ways, people and talk, what is known) and the packages named,
// each with what it declares it reads (data/rules/packages.json), and no canon unless it is named. A read beyond them
// fails as Kyr's unknown name or MT-25's undeclared read, and is said again here as what it is: the name, the package
// that declares it, and the horizon it lies beyond.
export class Horizon {
  private static readonly rules = join(import.meta.dir, '../../data/rules');
  private static packages?: RulePackages;
  private static owners?: Map<string, string>;
  // The name in a failure to read: Kyr's unknown kind, relation or entity, or MT-25's undeclared read.
  private static readonly reads =
    /Unknown kind (\w+)|Unknown function or arity: (\w+)|Undeclared relation read: (\w+)|Invalid argument (\w+)/;
  readonly installed: readonly string[];
  constructor(readonly named: readonly string[]) {
    this.installed = Horizon.declared().closure(named);
  }
  // The rules a manifest names for it (the installer adds what they read).
  get manifest(): string[] { return ['core', ...this.named]; }
  // Whether the canon is within it: only when named.
  get canonless(): boolean { return !this.named.includes('canon'); }
  static declared(): RulePackages {
    return this.packages ??= RulePackages.from(
      JSON.parse(readFileSync(join(this.rules, 'packages.json'), 'utf8')) as RulePackageDeclaration);
  }
  // The package that declares a name (a kind, an entity, a relation, a measure or a query), parsed only when a read
  // beyond a horizon is to be said.
  static owner(name: string): string | undefined {
    if (!this.owners) {
      this.owners = new Map();
      for (const file of readdirSync(this.rules).filter(f => f.endsWith('.kyr')).sort()) {
        const m = ModuleParser.parse(readFileSync(join(this.rules, file), 'utf8')), p = file.replace(/\.kyr$/, '');
        for (const n of [...m.kinds, ...m.entities.map(e => e.id), ...m.relations.map(r => r.name),
          ...m.measures.map(r => r.name), ...m.queries.map(q => q.name)]) { this.owners.set(n, p); }
      }
    }
    return this.owners.get(name);
  }
  // A failure as a read beyond the horizon, where it is one; any other as it was.
  explain(error: unknown): unknown {
    const message = error instanceof Error ? error.message : String(error);
    const name = Horizon.reads.exec(message)?.slice(1).find(Boolean), owner = name && Horizon.owner(name);
    if (!owner || this.installed.includes(owner)) { return error; }
    const within = this.named.length ? `the kernel and ${this.named.join(', ')}` : 'the kernel';
    return new Error(`Beyond the horizon: ${name} is declared by ${owner}, outside ${within} `
      + `(${this.installed.join(', ')}); name ${owner} in the horizon (OR-407). ${message}`, { cause: error });
  }
  async within<T>(work: () => Promise<T>): Promise<T> {
    try { return await work(); } catch (error) { throw this.explain(error); }
  }
}
