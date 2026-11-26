import { afterEach, describe, expect, it } from 'bun:test';
import { deserialize, serialize } from 'node:v8';
import '../../src/content';
import { LocalKinds } from '../../src/canon/local-catalog';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { CompiledModules } from '../../src/campaign/compiled-modules';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
// The language through its entry, after the runtime that loads its parser (OR-542).
import { DeclarationParses, ModuleParser, ParseCache, type Module } from '../../src/lang';

// Campaign isolation, at the caches (the compilation-context review of 26 November, §1): two campaigns give one local
// kind's name, `token`, two meanings, worth 1 and worth 9, and a text of a third reads a kind `like token`. What the
// text is read into depends on what `token` is, not on its name, so a parse or a compiled module kept while `token`
// was worth 1 is not the one for `token` worth 9: in the process, nor through the parse store that keeps parses
// between processes (a process's memory let go between the readings below, as a new process's would be).
// Known failing (it.failing) while a parse is kept by the names of the kinds its text holds (Vocabularies.seen): the
// review's slice 0, which its slice 1 turns.
const make = (name: string, worth: number) =>
  LocalKinds.item(name, { id: 'token', name, base: { category: 'gear' }, worth } as never);
const alpha = make('alpha', 1), beta = make('beta', 9);
const among = (token: object) => LocalKinds.activate({ items: { token } } as never, {});
const text = 'Module heir "Heir" { Kind made "made" like token. }';
const parsed = () => (LocalKinds.merge(ModuleParser.parse(text, []).catalog).catalog?.items?.made as { value?: number })
  ?.value;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'kind-keys/heir.kyr': 'Module heir "Heir" {\n  Kind made "made" like token.\n}',
  'kind-keys/module.json': JSON.stringify({ version: 1, source: 'heir.kyr', rules: ['world'] }) });
const compiled = async () => ((await ModuleBundle.load({ id: 'heir', bundle: 'kind-keys/module.json' },
  { seed: 'kind-keys' }, source)).instance.module.catalog?.items?.made as { value?: number } | undefined)?.value;
// A store between processes, its entries written and read as the disk's are (ParseStore: v8's serialization).
const disk = () => {
  const kept = new Map<string, Buffer>();
  return { get: (key: string) => kept.has(key) ? deserialize(kept.get(key)!) as Module : undefined,
    set: (key: string, module: Module) => { kept.set(key, serialize(module)); } };
};
// What a new process would not have: the parses and compiled modules kept in memory.
const forget = () => {
  const held = (o: object, name: string) => (o as Record<string, unknown>)[name] as Map<string, unknown>;
  for (const [o, name] of [[ParseCache, 'parsed'], [CompiledModules, 'kept'], [ModuleBundle, 'parses']] as const) {
    held(o, name).clear();
  }
  (ParseCache as unknown as { held: number }).held = 0;
  DeclarationParses.kept.clear();
};
const store = ParseCache.store;
afterEach(() => { ParseCache.store = store; LocalKinds.reset(); });

describe('a text that reads a kind like token', () => {
  it.failing('is parsed by what token is, however its readings alternate', () => {
    const seen = [alpha, beta, alpha].map(token => { among(token); return parsed(); });
    expect(seen).toEqual([1, 9, 1]);
  });
  it.failing('is parsed by what token is through the parse store', () => {
    ParseCache.store = disk(); forget();
    const seen = [alpha, beta, alpha].map(token => { forget(); among(token); return parsed(); });
    expect(seen).toEqual([1, 9, 1]);
  });
  it.failing('is compiled by what token is, however its compilations alternate', async () => {
    const seen: (number | undefined)[] = [];
    for (const token of [alpha, beta, alpha]) { among(token); seen.push(await compiled()); }
    expect(seen).toEqual([1, 9, 1]);
  });
  it.failing('is compiled by what token is through the parse store', async () => {
    ParseCache.store = disk(); forget();
    const seen: (number | undefined)[] = [];
    for (const token of [alpha, beta, alpha]) { forget(); among(token); seen.push(await compiled()); }
    expect(seen).toEqual([1, 9, 1]);
  });
});
