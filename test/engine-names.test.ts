import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { resolve } from 'node:path';
import { KyrLint } from '../src/cli/kyr-lint';
import { ModuleParser } from '../src/lang/module-parser';

// What the engine reads of a world by name (ModuleWriter.call('dark'), world.related('connects')) is its contract
// with the shared rules: the architecture review's H3 found the rule library to be the engine's hidden ABI. Each name
// is declared there, so that renaming one in data/rules fails here, by the file that reads it, rather than quietly
// turning a feature off; and no module of the library names its own relation, measure, query or action as the shared
// rules name theirs, which would make a later shared name rename the module's own within it (The Long Man's
// exposed in Mission 16; the disputation's settled() beside the camp's settled(place), found in Mission 17).
class EngineNames {
  static readonly root = resolve(import.meta.dir, '..');
  // Read by the engine and declared by no rule, each for its reason.
  static readonly unruled: Record<string, string> = {
    recorded: 'the record of a situation manifest\'s pressure, a deadline no generator or module has used since the '
      + 'first commit; saves carry its empty list (Gate E\'s deadlines use it, declared, or remove it)',
    deficit: 'the same pressure\'s shortfall',
  };
  private static kept?: ReturnType<typeof KyrLint.parsed>;
  static get parsed() { return this.kept ??= KyrLint.parsed(); }
  static declared(): Set<string> {
    return new Set(this.parsed.filter(p => p.file.startsWith('data/rules/'))
      .flatMap(p => [...p.module.relations, ...p.module.measures, ...p.module.queries].map(r => r.name)));
  }
  static readonly reading = new RegExp(String.raw`(?:ModuleWriter\.call|\.related|\.relatedTo|\.relates|\.one|\.number`
    + String.raw`|\.measured|\.declares)\('([A-Za-z_]+)'`, 'g');
  static read(): Map<string, string[]> {
    const read = new Map<string, string[]>();
    for (const file of new Glob('src/**/*.ts').scanSync(this.root)) {
      const text = readFileSync(resolve(this.root, file), 'utf8');
      for (const m of text.matchAll(EngineNames.reading)) {
        read.set(m[1]!, [...new Set([...read.get(m[1]!) ?? [], file])]);
      }
    }
    return read;
  }
}

describe('the names the engine reads, and the shared rules that declare them', () => {
  it('reads by name only what the shared rules declare, but for two records said why', () => {
    const declared = EngineNames.declared(), read = EngineNames.read();
    expect(read.size).toBeGreaterThan(100);
    const unruled = [...read].filter(([name]) => !declared.has(name)).map(([name, files]) => `${name} ← ${files.join(', ')}`);
    expect(unruled.map(u => u.split(' ← ')[0]).sort()).toEqual(Object.keys(EngineNames.unruled).sort());
  }, 60000);
  it('finds no module of the library naming its own as the shared rules name theirs', () => {
    expect(KyrLint.vocabulary(EngineNames.parsed).filter(f => f.level === 'error').map(f => `${f.where}: ${f.message}`))
      .toEqual([]);
  }, 60000);
  it('says so of a query, a relation or an action named as a shared one is', () => {
    const rules = ModuleParser.parse('Module r "Rules" { Relation settled(place). Query mild(p: place) means settled(p). }');
    const own = ModuleParser.parse('Module m "Mine" { Query settled() means true. Relation mild(place). }');
    expect(KyrLint.twins([{ file: 'data/rules/core.kyr', module: rules }, { file: 'data/goings-on/m.kyr', module: own }])
      .map(f => f.message)).toEqual(['redefines canonical query settled', 'redefines canonical mild']);
  });
});
