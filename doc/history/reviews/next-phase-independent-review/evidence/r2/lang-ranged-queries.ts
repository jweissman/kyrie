// Counts shipped queries with a parameter their body cannot bind (answered open by ranging over the parameter's type,
// QueryModes.unbound), and rules whose condition asks one open. Usage: bun lang-ranged-queries.ts
import { Glob } from 'bun';
import { ModuleParser } from '../../../../../src/lang/module-parser';
import { QueryModes } from '../../../../../src/lang/query-modes';
import type { Module, Predicate } from '../../../../../src/lang/module';
const root = new URL('../../../../../', import.meta.url).pathname;
const files = [...new Glob('data/**/*.kyr').scanSync(root), ...new Glob('test/fixtures/**/*.kyr').scanSync(root)];
let parsed = 0; const ranged = new Map<string, string>(); const asked: string[] = [];
const calls = (p: Predicate): { name: string; args: string[] }[] => p.kind === 'call' ? [p] : p.kind === 'not' ? calls(p.value)
  : p.kind === 'and' || p.kind === 'or' ? [...calls(p.left), ...calls(p.right)] : [];
for (const f of files) {
  let m: Module; try { m = ModuleParser.parse(await Bun.file(root + f).text()); parsed++; } catch { continue; }
  for (const q of m.queries) { const u = QueryModes.unbound(m, q); if (u.length) { ranged.set(q.name, `${f}: ${q.name}(${u.join(',')})`); } }
  for (const r of m.rules ?? []) for (const c of calls(r.when)) {
    if (ranged.has(c.name) && c.args.some(a => a.startsWith('?'))) { asked.push(`${f}: Rule ${r.id} asks ${c.name}(${c.args.join(', ')})`); }
  }
}
console.log(`parsed ${parsed}/${files.length} .kyr files; queries with a ranged parameter: ${ranged.size}`);
for (const v of [...ranged.values()].slice(0, 15)) { console.log('  ' + v); }
console.log(`rules asking one with a ?variable in its file: ${asked.length}`);
for (const v of asked.slice(0, 10)) { console.log('  ' + v); }
