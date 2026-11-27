import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../../src/cli/kyr-lint';
import { ModuleCompiler, ModuleParser, parseAbility, SymbolTable, VerbIndex, VocabularyContext,
  type SymbolSource } from '../../src/lang/index';

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

  it('reports an unresolved reference at its identifier', () => {
    const own = parsed('adventures/one.kyr', 'Module one "One" {\n  Query check() means missing().\n}');
    const reference = table([], [module('one', [own])]).unresolved('one').find(r => r.name === 'missing');

    expect(reference).toMatchObject({
      file: 'adventures/one.kyr', binding: { status: 'unresolved' },
      span: { field: 'query', line: 2, column: 23 },
    });

  });

  it('keeps exact relation parameter positions through whole, chunked and cached parses', () => {
    const text = 'Module one "One" {\n  Relation known(first: group,\n    missing, last: group).\n}';
    const modules = [ModuleParser.whole(text), ModuleParser.chunked(text)!,
      ModuleParser.parse(text), ModuleParser.parse(text)];
    for (const parsedModule of modules) {
      const source = { file: 'one.kyr', module: parsedModule };
      const refs = table([], [module('one', [source])]).references('one').filter(r => r.role === 'type');
      expect(refs.map(r => [r.name, r.span?.line, r.span?.column, text.slice(r.span?.at, r.span?.end)])).toEqual([
        ['group', 2, 25, 'group'], ['missing', 3, 5, 'missing'], ['group', 3, 20, 'group'],
      ]);
    }
  });

  it('rejects invalid verb slots and incompatible lowerings', () => {
    const prefix = 'Module one "One" { Kind member. Kind ability. Relation learned(member, ability). ';
    const cases = [
      ['Verb teach(spell: ability) "Teach {missing}" lowers to Assert learned(spell, spell).', 'Invalid phrase slots'],
      ['Verb teach(spell: ability) "Teach {spell} {spell}" lowers to Assert learned(spell, spell).', 'Invalid phrase slots'],
      ['Verb teach(spell: ability) "Teach {spell}" lowers to Assert learned(spell, spell).', 'Invalid argument spell'],
      ['Verb teach(spell: ability) "Teach {spell}s" lowers to Assert learned(spell, spell).', 'Invalid phrase slots'],
      ['Verb teach(spell: ability) "Teach {spell}" lowers to Assert learned(?missing, spell).', 'unbound lowering'],
    ];
    for (const [body, message] of cases) {
      const parsedModule = ModuleParser.parse(`${prefix}${body} }`);
      expect(() => new ModuleCompiler().validate(parsedModule)).toThrow(message);
    }
  });

  it('keeps separate call and argument positions, including repeated calls', () => {
    const text = 'Module one "One" {\n  Query check() means known(a, a) and known(a, a).\n}';
    const modules = [ModuleParser.whole(text), ModuleParser.chunked(text)!,
      ModuleParser.parse(text), ModuleParser.parse(text)];
    for (const parsedModule of modules) {
      const source = { file: 'one.kyr', module: parsedModule };
      const refs = table([], [module('one', [source])]).references('one');
      expect(refs.map(r => [r.name, r.span?.line, r.span?.column, text.slice(r.span?.at, r.span?.end)])).toEqual([
        ['known', 2, 23, 'known'], ['a', 2, 29, 'a'], ['a', 2, 32, 'a'],
        ['known', 2, 39, 'known'], ['a', 2, 45, 'a'], ['a', 2, 48, 'a'],
      ]);
    }
  });

  it('rejects invalid relation uses at the identifier that caused the error', () => {
    const cases = [
      ['Kind group.\n  Relation known(group, missing).', 'Line 3, col 25: Unknown kind missing'],
      ['Kind group.\n  Relation known(group, group).\n  Query check() means known().',
        'Line 4, col 23: Unknown function or arity'],
      ['Kind group.\n  Kind place.\n  Entity p: place "P".\n  Relation known(group).\n  Query check() means known(p).',
        'Line 6, col 29: Invalid argument p'],
    ];
    for (const [body, message] of cases) {
      const text = `Module one "One" {\n  ${body}\n}`;
      for (const module of [ModuleParser.whole(text), ModuleParser.chunked(text)!, ModuleParser.parse(text)]) {
        expect(() => new ModuleCompiler().validate(module)).toThrow(message);
      }
    }
  });

  it('records a verb declaration and its lowering references', () => {
    const text = `Module one "One" {
      Kind member. Kind ability. Relation learned(member, ability).
      Verb teach(spell: ability, target: member) "Teach {spell} to {target}" lowers to Assert learned(target, spell).
    }`;
    const modules = [ModuleParser.whole(text), ModuleParser.chunked(text)!, ModuleParser.parse(text)];
    for (const parsedModule of modules) {
      expect(() => new ModuleCompiler().validate(parsedModule)).not.toThrow();
      expect(parsedModule.verbs).toEqual([{ name: 'teach',
        parameters: [{ name: 'spell', type: 'ability' }, { name: 'target', type: 'member' }],
        phrase: 'Teach {spell} to {target}',
        lowering: { kind: 'assert', call: { kind: 'call', name: 'learned', args: ['target', 'spell'] } } }]);
      const source = { file: 'one.kyr', module: parsedModule };
      const refs = table([], [module('one', [source])]).references('one').filter(r => r.within === 'verb:teach');
      expect(refs.find(r => r.name === 'learned')?.binding).toMatchObject({
        status: 'bound', to: { name: 'learned', namespace: 'relation' },
      });

      expect(refs.filter(r => r.name === 'target' || r.name === 'spell')
        .every(r => r.binding.status === 'lexical')).toBe(true);
    }
  });

  it('isolates declarations between installations', () => {
    const own = parsed('adventures/one.kyr', 'Module one "One" { Query check() means known(). }');
    const rules = parsed('rules/core.kyr', 'Module rules "Rules" { Relation known(group). }');
    const installed = table([rules], [module('one', [own])]);
    const isolated = table([], [module('one', [own])]);

    expect(installed.resolve('one', 'known', 'function').status).toBe('bound');
    expect(isolated.resolve('one', 'known', 'function')).toEqual({ status: 'unresolved' });
  });

  it('binds an imported relation to the specified installed declaration, through a re-export', () => {
    const source = parsed('source.kyr', 'Module source "Source" { Relation known(group). }');
    const relay = parsed('relay.kyr', 'Module relay "Relay" { Relation news(group). }');
    const user = parsed('user.kyr', 'Module user "User" { Relation tidings(group). Query check() means tidings(?x). }');
    const other = parsed('other.kyr', 'Module other "Other" { Relation known(group). }');
    const shared = parsed('rules.kyr', 'Module rules "Rules" { Kind group. }');
    const symbols = SymbolTable.of(VocabularyContext.none.fork(), { shared: [shared], modules: [
      { id: 'user', files: [user], imports: { tidings: { unit: 'relay', namespace: 'relation', name: 'news' } } },
      { id: 'relay', files: [relay], imports: { news: { unit: 'source', namespace: 'relation', name: 'known' } } },
      module('source', [source]), module('other', [other]),
    ] });
    const binding = symbols.references('user').find(r => r.name === 'tidings')?.binding;
    expect(binding).toMatchObject({ status: 'bound', to: { id: 'source:relation:known', file: 'source.kyr' } });
  });

  it('rejects mismatched and cyclic imports instead of binding a local stand-in', () => {
    const source = parsed('source.kyr', 'Module source "Source" { Relation known(group) exclusive. }');
    const own = parsed('own.kyr', 'Module own "Own" { Relation news(group). }');
    const entry = (id: string, file: SymbolSource, target: string, local: string) => ({
      id, files: [file], imports: { [local]: { unit: target, namespace: 'relation' as const,
        name: local === 'news' ? 'known' : 'news' } },
    });

    expect(() => SymbolTable.of(VocabularyContext.none.fork(), { shared: [],
      modules: [module('source', [source]), entry('own', own, 'source', 'news')] })).toThrow('Incompatible import');
    expect(() => SymbolTable.of(VocabularyContext.none.fork(), { shared: [], modules: [
      entry('source', source, 'own', 'known'), entry('own', own, 'source', 'news'),
    ] })).toThrow('Cyclic import');
  });

  it('rejects an import whose equally spelled kinds are distinct declarations', () => {
    const source = parsed('source.kyr', 'Module source "Source" { Kind mark. Relation known(mark). }');
    const own = parsed('own.kyr', 'Module own "Own" { Kind mark. Relation news(mark). }');
    expect(() => SymbolTable.of(VocabularyContext.none.fork(), { shared: [], modules: [
      module('source', [source]), { id: 'own', files: [own],
        imports: { news: { unit: 'source', namespace: 'relation', name: 'known' } } },
    ] })).toThrow('Incompatible import');
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

it('binds a verb lowering to the shared relation and its kind identities', () => {
  const shared = parsed('rules.kyr', 'Module rules "Rules" { Kind member. Kind ability. Relation learned(member, ability). }');
  const own = parsed('one.kyr', `Module one "One" {
    Verb teach(spell: ability, target: member) "Teach {spell} to {target}" lowers to Assert learned(target, spell).
  }`);
  const symbols = table([shared], [module('one', [own])]);
  const operands = new Map([
    ['rules:kind:ability', { kind: 'identifier' as const }],
    ['rules:kind:member', { kind: 'choice' as const, values: ['ally', 'self'] }],
  ]);
  const verbs = VerbIndex.of(symbols, ['one'], operands);
  expect(verbs.match('Teach fire_ward to ally')).toMatchObject({
    relation: { id: 'rules:relation:learned' },
    change: { kind: 'assert', call: { name: 'learned', args: ['ally', 'fire_ward'] } },
  });
  expect(() => verbs.match('Teach fire_ward to nobody')).toThrow('No declared verb matches');
});

it('rejects overlapping phrases and same-spelled kinds with different identities', () => {
  const shared = parsed('rules.kyr', 'Module rules "Rules" { Kind member. Kind ability. Relation learned(member, ability). }');
  const verb = 'Verb teach(spell: ability, target: member) "Teach {spell} to {target}" '
    + 'lowers to Assert learned(target, spell).';
  const overlapping = verb.replace('Verb teach(', 'Verb instruct(');
  const distinct = overlapping.replace('} to {', '} beside {');
  const operands = new Map([
    ['rules:kind:ability', { kind: 'identifier' as const }],
    ['rules:kind:member', { kind: 'choice' as const, values: ['ally', 'self'] }],
    ['one:kind:member', { kind: 'choice' as const, values: ['ally', 'self'] }],
  ]);
  const index = (body: string) => VerbIndex.of(table([shared], [module('one', [
    parsed('one.kyr', `Module one "One" { ${body} }`),
  ])]), ['one'], operands);
  expect(() => index(`${verb} ${overlapping}`)).toThrow('Ambiguous verb phrase');
  expect(index(`${verb} ${distinct}`).match('Teach fire_ward beside self').change.call.args)
    .toEqual(['self', 'fire_ward']);
  expect(() => index(`Kind member. ${verb}`)).toThrow('Incompatible lowering argument target');
});

it('passes generic ability calls to the supplied vocabulary, retaining conditions and saves', () => {
  const resolve = (text: string) => {
    expect(text).toBe('Instruct fire_ward to ally');
    return { kind: 'learn' as const, ability: 'fire_ward', target: 'ally' as const };
  };
  const ability = parseAbility('lesson', 'Lesson',
    'If (true), Instruct fire_ward to ally unless wisdom save against 12.', resolve);
  expect(ability.effects).toEqual([{ kind: 'learn', ability: 'fire_ward', target: 'ally', when: 'true',
    save: { stat: 'wisdom', difficulty: { kind: 'literal', value: 12 } } }]);
  expect(() => parseAbility('lesson', 'Lesson', 'Instruct fire_ward to ally.')).toThrow('No vocabulary');
  expect(() => parseAbility('lesson', 'Lesson', '\n  Instruct fire_ward to ally.',
    () => { throw new Error('No matching verb'); })).toThrow('Line 2, col 3: No matching verb');
});

it('validates hazard verbs again for each vocabulary edition, even on a kept parse', () => {
  const text = 'Module m "M" { Hazard lesson "Lesson" means "Instruct fire_ward to ally.". }';
  const lesson = () => ({ kind: 'learn' as const, ability: 'fire_ward', target: 'ally' as const });
  const accepts = VocabularyContext.none.withVerbs(lesson, 'accepts');
  const refuses = VocabularyContext.none.withVerbs(() => { throw new Error('No such verb'); }, 'refuses');
  expect(ModuleParser.parseWithin(accepts, text).entities[0]?.effect).toBe('Instruct fire_ward to ally.');
  expect(ModuleParser.parseWithin(accepts.fork(), text).entities[0]?.effect).toBe('Instruct fire_ward to ally.');
  expect(() => ModuleParser.parseWithin(refuses, text)).toThrow('No such verb');
  expect(() => ModuleParser.parseWithin(VocabularyContext.none, text)).toThrow('No vocabulary');
  expect(() => VocabularyContext.none.withVerbs(lesson, '')).toThrow('nonempty edition');
});
