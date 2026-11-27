import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../../src/cli/kyr-lint';
import { ModuleParser, SymbolTable, VocabularyContext, type SymbolSource } from '../../src/lang/index';

const parsed = (file: string, text: string): SymbolSource => ({
  file, module: ModuleParser.parseWithin(VocabularyContext.none.fork(), text),
});
const module = (id: string, files: SymbolSource[]) => ({ id, files });
const table = (shared: SymbolSource[], own: { id: string; files: SymbolSource[] }[]) =>
  SymbolTable.of(VocabularyContext.none.fork(), { shared, modules: own });
const legacyTwins = (parsed: { file: string; module: SymbolSource['module'] }[]) => {
  const rules = parsed.filter(p => p.file.startsWith('data/rules/')).map(p => p.module);
  const queries = new Set(rules.flatMap(m => m.queries.map(q => q.name)));
  const functions = new Set([...queries, ...rules.flatMap(m => [...m.relations, ...m.measures].map(r => r.name))]);
  const actions = new Set(rules.flatMap(m => m.actions.map(a => a.id)));
  return parsed.filter(p => !p.file.startsWith('data/rules/')).flatMap(({ file, module: m }) => [
    ...m.queries.filter(q => functions.has(q.name)).map(q => `query ${q.name}`),
    ...[...m.relations, ...m.measures].filter(r => queries.has(r.name)).map(r => r.name),
    ...m.actions.filter(a => actions.has(a.id)).map(a => `action ${a.id}`)]
    .map(name => ({ level: 'error' as const, check: 'redefinition', where: file, message: `redefines canonical ${name}` })));
};

describe('the installation symbol table', () => {
  it('binds a reference to a declaration in another module', () => {
    const rules = parsed('rules/core.kyr', 'Module rules "Rules" { Relation known(group). }');
    const own = parsed('adventures/one.kyr', 'Module one "One" { Query check() means known(). }');
    const symbols = table([rules], [module('one', [own])]);

    expect(symbols.resolve('one', 'known', 'function')).toMatchObject({
      status: 'bound', to: { name: 'known', namespace: 'relation', unit: 'rules' },
    });
    expect(symbols.references('one').find(r => r.name === 'known')?.binding).toMatchObject({
      status: 'bound', to: { file: 'rules/core.kyr', name: 'known' },
    });
  });

  it('prefers a module declaration and reports its collision with shared rules', () => {
    const rules = parsed('rules/core.kyr', 'Module rules "Rules" { Relation known(group). }');
    const own = parsed('adventures/one.kyr', 'Module one "One" { Relation known(place). Query check() means known(). }');
    const symbols = table([rules], [module('one', [own])]);

    expect(symbols.resolve('one', 'known', 'function')).toMatchObject({
      status: 'bound', to: { unit: 'one', namespace: 'relation' },
    });
    expect(symbols.shadowing('one', ['relation'], ['relation']).map(s => s.own.name)).toEqual(['known']);
  });

  it('reports an unresolved reference at its declaration position', () => {
    const own = parsed('adventures/one.kyr', 'Module one "One" {\n  Query check() means missing().\n}');
    const reference = table([], [module('one', [own])]).unresolved('one').find(r => r.name === 'missing');

    expect(reference).toMatchObject({
      file: 'adventures/one.kyr', binding: { status: 'unresolved' },
      span: { field: 'query', line: 2, column: 3 },
    });
  });

  it('isolates declarations between installations', () => {
    const own = parsed('adventures/one.kyr', 'Module one "One" { Query check() means known(). }');
    const rules = parsed('rules/core.kyr', 'Module rules "Rules" { Relation known(group). }');
    const installed = table([rules], [module('one', [own])]);
    const isolated = table([], [module('one', [own])]);

    expect(installed.resolve('one', 'known', 'function').status).toBe('bound');
    expect(isolated.resolve('one', 'known', 'function')).toEqual({ status: 'unresolved' });
  });

  it('keeps the existing twins lint findings exactly', () => {
    const parsed = [
      { file: 'data/rules/core.kyr', module: parsedModule('rules', 'Relation known(group). Query wanted() means true.') },
      { file: 'data/adventures/one/module.kyr',
        module: parsedModule('one', 'Query known() means true. Relation wanted(group).') },
    ];

    expect(KyrLint.twins(parsed)).toEqual(legacyTwins(parsed));
  });
});

function parsedModule(id: string, declarations: string): SymbolSource['module'] {
  return ModuleParser.parseWithin(VocabularyContext.none.fork(), `Module ${id} "${id}" { ${declarations} }`);
}
