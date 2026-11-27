import type { BundleSource } from './bundle-source';

// The shared rules as packages (BX-02): what each file of data/rules reads of the others, declared beside them in
// data/rules/packages.json and read through the same source. The kernel (places and ways, people and talk, and what is
// known: core, passages, people, discovery, which the engine reads of together) goes with every package and reads
// nothing of conflict; every other package names the packages it reads, each with the names it reads of it. The rules
// a manifest names are installed with what they declare they read, and with nothing else, in the order the declaration
// lists them, which is the standard set's own (ModuleBundle.ruleNames). The standard set ("world") is closed under
// what its packages read, its canon or not (test/small/rule-packages), so a world is installed as it always was.
export interface RulePackageDeclaration {
  version: 1;
  kernel: string[];
  // Each package by name, in the standard order: the packages it reads, each with what it reads of it.
  packages: Record<string, Record<string, string>>;
}
export class RulePackages {
  static readonly path = 'data/rules/packages.json';
  private static readonly declared = new WeakMap<BundleSource, Promise<RulePackages>>();
  private constructor(readonly declaration: RulePackageDeclaration) {}
  // The declaration as a source has it, read once for each source.
  static of(source: BundleSource): Promise<RulePackages> {
    let kept = this.declared.get(source);
    if (!kept) {
      kept = source.read(source.resolve(this.path)).then(text => this.from(JSON.parse(text) as RulePackageDeclaration));
      this.declared.set(source, kept);
    }
    return kept;
  }
  static from(declaration: RulePackageDeclaration): RulePackages {
    if (declaration.version !== 1 || !Array.isArray(declaration.kernel) || typeof declaration.packages !== 'object') {
      throw new Error(`Invalid rule packages (${this.path})`);
    }
    return new RulePackages(declaration);
  }
  get names(): string[] { return Object.keys(this.declaration.packages); }
  get kernel(): readonly string[] { return this.declaration.kernel; }
  // The packages one reads, beyond the kernel.
  requires(name: string): string[] {
    const declared = this.declaration.packages[name];
    if (!declared) { throw new Error(`No rule package ${name} (${RulePackages.path})`); }
    return Object.keys(declared);
  }
  // The kernel, the packages named, and whatever they read, and it reads, in the standard order.
  closure(names: readonly string[]): string[] {
    const seen = new Set<string>(), open = [...this.kernel, ...names];
    for (let name = open.pop(); name !== undefined; name = open.pop()) {
      if (!seen.has(name)) { seen.add(name); open.push(...this.requires(name)); }
    }
    return this.names.filter(n => seen.has(n));
  }
  // A manifest's shared rules as they are installed: the standard set as it is listed (closed already: nothing it
  // reads lies outside it, which test/small/rule-packages holds), anything less with its closure.
  static async installed(names: readonly string[], standard: boolean, source: BundleSource):
    Promise<readonly string[]> {
    return standard ? names : (await this.of(source)).closure(names);
  }
}
