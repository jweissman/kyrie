// Where a load error is in the author's files, and what else has the name it is about. Kyr's errors name an entity
// or a call; this finds the line that declares or uses it in the module's own files, and, for a name that collides,
// the line in the shared rules that already has it ("marsh" is a terrain kind in data/rules/core.kyr).
export interface SourceFile { path: string; text: string }

export class Diagnostics {
  static readonly declares = 'Place|Item|Thing|Person|Entity|Passage|Hazard|Discovery|Company|Topic|Rule|Event|Action'
    + '|Observe|Objective|Relation|Measure|Query|Kind|State|Source|Change';
  static explain(error: unknown, authored: SourceFile[], shared: SourceFile[]): Error {
    const message = error instanceof Error ? error.message : String(error);
    if (/^\S+:\d+: /.test(message)) { return error instanceof Error ? error : new Error(message); }
    const names = this.names(message);
    const here = names.map(n => this.locate(authored, n)).find(Boolean);
    const also = names.flatMap(n => [this.collide(shared, n), this.twice(authored, n)]).filter((x): x is string => !!x);
    return new Error([`${here ? `${here}: ` : ''}${message}`, ...new Set(also)].join('\n  '));
  }
  // A parse error in one file, said with that file's path.
  static parse(error: unknown, path: string): Error {
    const message = error instanceof Error ? error.message : String(error);
    const at = /Line (\d+), col (\d+)/.exec(message);
    const file = this.short(path);
    return new Error(at ? `${file}:${at[1]}:${at[2]}: ${message}` : `${file}: ${message}`);
  }
  // The names an error is about: "Duplicate entity a, b", "Parameter shadows entity x", "Invalid argument x in …",
  // "Text names unknown entity {x}", "Unknown predicate x".
  private static names(message: string): string[] {
    const patterns = [/Duplicate entity ([\w, ]+)/, /Parameter shadows entity (\w+)/, /Invalid argument (\w+) in/,
      /unknown entity \{(\w+)\}/, /Unknown predicate (\w+)/];
    for (const p of patterns) {
      const m = p.exec(message);
      if (m) { return m[1]!.split(/,\s*/).map(n => n.trim()).filter(Boolean); }
    }
    return [];
  }
  // Where the author declares a name, or else first uses it.
  private static locate(files: SourceFile[], name: string): string | undefined {
    return this.line(files, new RegExp(`\\b(${this.declares})\\s+${this.escape(name)}\\b`))
      ?? this.line(files, new RegExp(`\\b${this.escape(name)}\\b`));
  }
  // What the shared rules already call by the name: an entity they declare, or a parameter of one of their rules.
  private static collide(shared: SourceFile[], name: string): string | undefined {
    const declared = this.line(shared, new RegExp(`\\b(${this.declares})\\s+${this.escape(name)}\\b`));
    if (declared) { return `'${name}' is already declared by the shared rules at ${declared}; choose another name`; }
    const parameter = this.line(shared, new RegExp(`[(,]\\s*${this.escape(name)}:\\s*\\w+`));
    return parameter ? `'${name}' is a parameter of a shared rule at ${parameter}; choose another name` : undefined;
  }
  // A name the author gave to two things (a place and a state both called 'yard').
  private static twice(authored: SourceFile[], name: string): string | undefined {
    const pattern = new RegExp(`\\b(${this.declares})\\s+${this.escape(name)}\\b`);
    const all = authored.flatMap(f => f.text.split('\n').map((l, i) => pattern.test(l) && !/^\s*\/\//.test(l)
      ? `${this.short(f.path)}:${i + 1}` : '').filter(Boolean));
    return all.length < 2 ? undefined
      : `'${name}' names two things, at ${all.join(' and ')}; give one of them another name`;
  }
  private static line(files: SourceFile[], pattern: RegExp): string | undefined {
    for (const f of files) {
      const i = f.text.split('\n').findIndex(l => pattern.test(l) && !/^\s*\/\//.test(l));
      if (i >= 0) { return `${this.short(f.path)}:${i + 1}`; }
    }
    return undefined;
  }
  // A path as the author would write it, from the repository's root.
  private static short(path: string): string {
    const root = typeof process !== 'undefined' ? `${process.cwd()}/` : '';
    return root && path.startsWith(root) ? path.slice(root.length) : path;
  }
  private static escape(name: string): string { return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
