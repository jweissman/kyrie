import { describe, expect, it } from 'bun:test';
// Operators first: Kyr's entry loaded before it meets the language's parser cycle half-made (OR-542).
import { Operators } from '../../src/campaign/operators';
import { ModuleParser, ModuleWriter, World, WorldReads } from '../../src/lang';
import { LegalQueryPrototype } from '../../scripts/research/legal-query-prototype';

const module = ModuleParser.parse(`Module m "m" {
  Kind thing. Entity bell: thing "bell". Relation rung(thing). Relation unrelated(thing).
  Action ring "Ring" { Requires not rung(bell). On success { Assert rung(bell). } }
}`);

describe('research legal query', () => {
  it('reuses unchanged reads, invalidates a relevant write, and agrees with a fresh grounding', () => {
    const query = new LegalQueryPrototype(module);
    const w0 = new World(module), w1 = w0.apply([{ kind: 'assert', call: ModuleWriter.call('unrelated', 'bell') }]);
    const w2 = w1.apply([{ kind: 'assert', call: ModuleWriter.call('rung', 'bell') }]);
    for (const world of [w0, w1, w2]) {
      expect(query.ask(world)).toEqual(new Operators(module).applicable(world));
    }
    expect([query.hits, query.misses]).toEqual([1, 2]);
    expect(query.ask(w2)).toEqual([]);
  });

  it('isolates world lineages and refuses another module', () => {
    const query = new LegalQueryPrototype(module), first = new World(module);
    const other = new World(module).apply([{ kind: 'assert', call: ModuleWriter.call('rung', 'bell') }]);
    expect(query.ask(first)).toHaveLength(1);
    expect(query.ask(other)).toEqual(new Operators(module).applicable(other));
    expect([query.hits, query.misses]).toEqual([0, 2]);
    expect(() => query.ask(new World(structuredClone(module)))).toThrow('different module');
  });

  it('propagates a reused query’s reads to an enclosing computation', () => {
    const world = new World(module), query = new LegalQueryPrototype(module);
    query.ask(world);
    const outer = WorldReads.of(() => query.ask(world));
    expect(outer.reads).toContain('rung');
    expect(query.hits).toBe(1);
  });

  it('distinguishes divergent forks of one world line', () => {
    const root = new World(module), query = new LegalQueryPrototype(module);
    const rung = root.apply([{ kind: 'assert', call: ModuleWriter.call('rung', 'bell') }]);
    const other = root.apply([{ kind: 'assert', call: ModuleWriter.call('unrelated', 'bell') }]);
    for (const world of [root, rung, other, rung]) {
      expect(query.ask(world)).toEqual(new Operators(module).applicable(world));
    }
  });

  it('keeps actors distinct as their legal actions change', () => {
    const actors = ModuleParser.parse(`Module a "a" {
      Kind thing. Entity reeve: thing "reeve". Entity miller: thing "miller". Relation ready(thing).
      Action ring(actor: thing) "Ring" { Requires ready(actor). On success { Assert ready(actor). } }
    }`);
    const query = new LegalQueryPrototype(actors);
    const first = new World(actors).apply([{ kind: 'assert', call: ModuleWriter.call('ready', 'reeve') }]);
    const second = first.apply([{ kind: 'assert', call: ModuleWriter.call('ready', 'miller') }]);
    for (const [world, actor] of [[first, 'reeve'], [first, 'miller'], [second, 'reeve'], [second, 'miller']] as const) {
      expect(query.ask(world, actor)).toEqual(new Operators(actors).applicable(world, actor));
    }
    expect(query.ask(first, 'reeve')).toHaveLength(1);
    expect(query.ask(first, 'miller')).toHaveLength(0);
    expect(query.ask(second, 'miller')).toHaveLength(1);
  });
});
