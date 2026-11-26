import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { KyrLint } from '../src/cli/kyr-lint';
import { ModuleParser } from '../src/lang/index';
import { SymbolTableSpike, type SourceModule } from './spikes/kyr-symbol-table';

const paths = ['data/rules/people.kyr', 'data/rules/belongings.kyr', 'data/adventures/eelbell/night.kyr'];
const shadowPath = 'test/fixtures/probes/shadow/site.kyr';
const source = (file: string, scope: SourceModule['scope'], text = readFileSync(file, 'utf8')): SourceModule =>
  ({ file, scope, text, module: ModuleParser.parse(text) });

describe('symbol table spike', () => {
  test('matches the vocabulary and twin checks for real modules, including locations', () => {
    const modules = [source(paths[0]!, 'shared'), source(paths[1]!, 'shared'), source(paths[2]!, 'local')];
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    const parsed = modules.map(({ file, module }) => ({ file, module }));
    expect(table.twins()).toEqual(KyrLint.twins(parsed));
    expect(table.vocabulary()).toEqual(KyrLint.vocabulary(parsed));
    expect(table.identifiers).toBe(table.symbols.length + table.occurrences.length);
    for (const symbol of table.symbols) {
      const text = modules.find(m => m.file === symbol.file)!.text;
      expect(text.slice(symbol.start, symbol.end)).toBe(symbol.name);
      const lines = text.slice(0, symbol.start).split('\n');
      expect([symbol.line, symbol.column]).toEqual([lines.length, lines.at(-1)!.length + 1]);
    }
    for (const occurrence of table.occurrences) {
      const text = modules.find(m => m.file === occurrence.file)!.text;
      expect(text.slice(occurrence.start, occurrence.end)).toBe(occurrence.name);
      const lines = text.slice(0, occurrence.start).split('\n');
      expect([occurrence.line, occurrence.column]).toEqual([lines.length, lines.at(-1)!.length + 1]);
    }
    expect(table.occurrences.some(o => o.mode === 'read' && o.binding?.status === 'bound')).toBe(true);
    expect(table.occurrences.some(o => o.mode === 'write' && o.binding?.status === 'bound')).toBe(true);
  });
  test('matches the existing shadow lint, including its file and line locations', async () => {
    const modules = [source(paths[0]!, 'shared'), source(paths[1]!, 'shared'), source(shadowPath, 'local')];
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    const where = 'test/fixtures/probes/shadow/probe.campaign.json';
    const current = (await KyrLint.campaign(where)).filter(f => f.check === 'shadow');
    const queried = table.shadowFindings(where, 'p');
    expect(queried).toEqual(current);
    expect(queried.map(f => f.message.match(/\(([^)]+:\d+)\)$/)?.[1])).toEqual([
      'test/fixtures/probes/shadow/site.kyr:10',
      'test/fixtures/probes/shadow/site.kyr:10',
      'test/fixtures/probes/shadow/site.kyr:12',
    ]);
  });
  test('detects real-module collisions with the existing checks', () => {
    const rules = source(paths[0]!, 'shared');
    const original = readFileSync(shadowPath, 'utf8');
    const adventure = source(shadowPath, 'local', original.replace('Relation confided(group).',
      'Relation fellow(group). Relation confided(group).'));
    const modules = [rules, adventure], parsed = modules.map(({ file, module }) => ({ file, module }));
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    expect(table.vocabulary()).toEqual(KyrLint.vocabulary(parsed));
    expect(table.vocabulary().some(f => f.message === 'redefines canonical fellow')).toBe(true);
  });
  test('detects a query shadowing a shared relation', () => {
    const rules = source(paths[0]!, 'shared');
    const original = readFileSync(shadowPath, 'utf8');
    const adventure = source(shadowPath, 'local', original.replace('Relation confided(group).',
      'Query fellow() means true. Relation confided(group).'));
    const modules = [rules, adventure], parsed = modules.map(({ file, module }) => ({ file, module }));
    const table = new SymbolTableSpike({ modules, catalog: new Map() });
    expect(table.twins()).toEqual(KyrLint.twins(parsed));
    expect(table.twins().some(f => f.message === 'redefines canonical query fellow')).toBe(true);
  });
  test('reports duplicate call targets as ambiguous instead of selecting the first', () => {
    const original = readFileSync(shadowPath, 'utf8');
    const duplicate = source(shadowPath, 'local', original.replace('Relation confided(group).',
      'Relation confided(group). Relation confided(place).'));
    const table = new SymbolTableSpike({ modules: [duplicate], catalog: new Map() });
    const reference = table.occurrences.find(o => o.name === 'confided' && o.mode === 'read');
    expect(reference?.binding?.status).toBe('ambiguous');
    expect(reference?.binding?.status === 'ambiguous' ? reference.binding.candidates.map(s => s.signature) : [])
      .toEqual(['group', 'place']);
  });
  test('uses the supplied catalog rather than a process-wide vocabulary', () => {
    const adventure = source(shadowPath, 'local');
    const external = { file: 'catalog.kyr', module: 'catalog', scope: 'catalog' as const,
      kind: 'relation' as const, name: 'company', signature: 'group,place',
      start: 0, end: 6, line: 1, column: 1 };
    const bound = new SymbolTableSpike({ modules: [adventure], catalog: new Map([['company', [external]]]) });
    const absent = new SymbolTableSpike({ modules: [adventure], catalog: new Map() });
    expect(bound.occurrences.find(o => o.name === 'company')?.binding).toEqual({ status: 'bound', target: external });
    expect(absent.occurrences.find(o => o.name === 'company')?.binding).toEqual({ status: 'unresolved' });
    const second = { ...external, file: 'other-catalog.kyr', module: 'other-catalog' };
    const ambiguous = new SymbolTableSpike({
      modules: [adventure], catalog: new Map([['company', [external, second]]]),
    });
    expect(ambiguous.occurrences.find(o => o.name === 'company')?.binding).toEqual({
      status: 'ambiguous', candidates: [external, second],
    });
    const local = source(shadowPath, 'local', readFileSync(shadowPath, 'utf8').replace('Relation confided(group).',
      'Relation company(group, place). Relation confided(group).'));
    const localFirst = new SymbolTableSpike({
      modules: [local], catalog: new Map([['company', [external, second]]]),
    });
    const binding = localFirst.occurrences.find(o => o.name === 'company')?.binding;
    expect(binding?.status).toBe('bound');
    expect(binding?.status === 'bound' ? [binding.target.file, binding.target.module] : []).toEqual([
      shadowPath, 'shadow',
    ]);
  });
});
