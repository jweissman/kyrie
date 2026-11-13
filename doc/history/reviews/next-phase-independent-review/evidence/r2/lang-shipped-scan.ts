// Scans shipped .kyr for patterns the compiler accepts but the runtime mishandles: rule effects naming a ?variable no
// positive part of the condition binds (G1/G2), and comparisons whose ?variable is bound only across an `or` or
// inside arithmetic (G4/G5). Usage: bun lang-shipped-scan.ts
import { Glob } from 'bun';
import { ModuleParser } from '../../../../../src/lang/module-parser';
import type { Module, Predicate, Value } from '../../../../../src/lang/module';
const root = new URL('../../../../../', import.meta.url).pathname;
const files = [...new Glob('data/**/*.kyr').scanSync(root), ...new Glob('test/fixtures/**/*.kyr').scanSync(root)];
const binds = (p: Predicate, pos = true): Set<string> => p.kind === 'call' ? new Set(pos ? p.args.filter(a => a.startsWith('?')) : [])
  : p.kind === 'not' ? new Set() : p.kind === 'and' ? new Set([...binds(p.left), ...binds(p.right)])
  : p.kind === 'or' ? new Set([...binds(p.left)].filter(x => binds(p.right).has(x))) : new Set();
const vals = (v: Value): string[] => v.kind === 'call' ? v.args : v.kind === 'arith' ? [...vals(v.left), ...vals(v.right)] : [];
let n = 0; const out: string[] = [];
for (const f of files) {
  let m: Module; try { m = ModuleParser.parse(await Bun.file(root + f).text()); n++; } catch { continue; }
  for (const r of m.rules ?? []) {
    const b = binds(r.when);
    const loose = new Set(r.effects.flatMap(c => [...c.call.args, ...('value' in c ? vals(c.value) : [])]).filter(a => a.startsWith('?') && !b.has(a)));
    if (loose.size) { out.push(`${f}: Rule ${r.id} writes ${[...loose].join(', ')} that its condition does not surely bind`); }
  }
}
console.log(`parsed ${n}/${files.length}; rules with effect variables not surely bound: ${out.length}`);
for (const o of out) { console.log('  ' + o); }
