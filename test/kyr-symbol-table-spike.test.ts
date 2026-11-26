import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { KyrLint } from '../src/cli/kyr-lint';
import { ModuleParser } from '../src/lang/index';
import { SymbolTableSpike, type SourceModule } from './spikes/kyr-symbol-table';

const paths = ['data/rules/core.kyr', 'data/rules/belongings.kyr', 'data/adventures/eelbell/night.kyr'];
const source = (file: string, text = readFileSync(file, 'utf8')): SourceModule =>
  ({ file, text, module: ModuleParser.parse(text) });

describe('symbol table spike', () => {
  test('matches the vocabulary and twin checks for real modules, including locations', () => {
    const modules = paths.map(p => source(p));
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    const parsed = modules.map(({ file, module }) => ({ file, module }));
    expect(table.twins()).toEqual(KyrLint.twins(parsed));
    expect(table.vocabulary()).toEqual(KyrLint.vocabulary(parsed));
    for (const symbol of table.symbols) {
      const text = modules.find(m => m.file === symbol.file)!.text;
      expect(text.slice(symbol.start, symbol.end)).toBe(symbol.name);
      const lines = text.slice(0, symbol.start).split('\n');
      expect([symbol.line, symbol.column]).toEqual([lines.length, lines.at(-1)!.length + 1]);
    }
    for (const occurrence of table.occurrences) {
      const text = modules.find(m => m.file === occurrence.file)!.text;
      expect(text.slice(occurrence.start, occurrence.end)).toBe(occurrence.name);
    }
    expect(table.occurrences.some(o => o.name === 'begun' && o.mode === 'read' && o.target?.module === 'eelbell')).toBe(true);
    expect(table.occurrences.some(o => o.name === 'begun' && o.mode === 'write' && o.target?.module === 'eelbell')).toBe(true);
  });
  test('detects real-module collisions with the existing checks', () => {
    const rules = source(paths[0]!);
    const original = readFileSync(paths[2]!, 'utf8');
    const adventure = source(paths[2]!, original.replace('Relation begun(place).', 'Relation memberOf(group). Relation begun(place).'));
    const modules = [rules, adventure], parsed = modules.map(({ file, module }) => ({ file, module }));
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    expect(table.vocabulary()).toEqual(KyrLint.vocabulary(parsed));
    expect(table.vocabulary().some(f => f.message === 'redefines canonical memberOf')).toBe(true);
  });
  test('detects a query shadowing a shared relation', () => {
    const rules = source(paths[0]!);
    const original = readFileSync(paths[2]!, 'utf8');
    const adventure = source(paths[2]!, original.replace('Relation begun(place).', 'Query memberOf() means true. Relation begun(place).'));
    const modules = [rules, adventure], parsed = modules.map(({ file, module }) => ({ file, module }));
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    expect(table.twins()).toEqual(KyrLint.twins(parsed));
    expect(table.twins().some(f => f.message === 'redefines canonical query memberOf')).toBe(true);
  });
  test('uses the supplied catalog rather than a process-wide vocabulary', () => {
    const adventure = source(paths[2]!);
    const external = { file: 'catalog.kyr', module: 'catalog', kind: 'relation' as const, name: 'within',
      signature: 'group,place', start: 0, end: 6, line: 1, column: 1 };
    const bound = new SymbolTableSpike({ modules: [adventure], catalog: new Map([['within', external]]) });
    const absent = new SymbolTableSpike({ modules: [adventure], catalog: new Map() });
    expect(bound.occurrences.find(o => o.name === 'within')?.target).toEqual(external);
    expect(absent.occurrences.find(o => o.name === 'within')?.target).toBeUndefined();
  });
});
