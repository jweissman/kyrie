// Differential test of Kyr query answering: for random small modules, every closed answer World.test(q(c1,c2))
// over the typed domain is compared with the open solve modes q(?a,?b), q(c,?b), q(?a,c), q(?a,?a), and with
// conjunctions in both orders. Usage: bun lang-query-diff.ts [trials] [seed] [typed]
// With 'typed', facts mention only entities of the parameters' type, so type leaks cannot cause a mismatch.
import { ModuleParser } from '../../../../../src/lang/module-parser';
import { World } from '../../../../../src/lang/world';
import { Candidates } from '../../../../../src/lang/candidates';
import type { Call, Predicate } from '../../../../../src/lang/module';

let seed = Number(process.argv[3] ?? 1);
const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 2 ** 32; };
const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;
const things = ['a', 'b', 'c'], typedOnly = process.argv[4] === 'typed', all = typedOnly ? things : [...things, 'h'];
const call = (name: string, ...args: string[]): Call => ({ kind: 'call', name, args });

function atom(vars: string[], depth: number, nested: boolean): string {
  const t = () => pick([...vars, ...vars, '?z', 'a']);
  const r = rnd();
  if (r < 0.3) { return `r(${t()}, ${t()})`; }
  if (r < 0.5) { return `s(${t()})`; }
  if (r < 0.62) { return `m(${t()}) > ${pick([0, 1])}`; }
  if (r < 0.7 && nested) { return `p(${t()})`; }
  if (r < 0.75) { return `distinct(${pick(vars)}, ${t()})`; }
  return body(vars, depth + 1, nested);
}
function body(vars: string[], depth: number, nested: boolean): string {
  if (depth > 2) { return `s(${pick(vars)})`; }
  const r = rnd();
  if (r < 0.25) { return `not ${atom(vars, depth, nested)}`; }
  if (r < 0.65) { return `(${atom(vars, depth, nested)} and ${atom(vars, depth, nested)})`; }
  if (r < 0.85) { return `(${atom(vars, depth, nested)} or ${atom(vars, depth, nested)})`; }
  return atom(vars, depth, nested);
}
const trials = Number(process.argv[2] ?? 3000);
const mismatches: string[] = [];
let errors = 0;
for (let n = 0; n < trials; n++) {
  const pBody = body(['x'], 1, false), qBody = body(['x', 'y'], 0, true);
  const facts: string[] = [];
  for (const x of all) { for (const y of all) { if (rnd() < 0.2) { facts.push(`Initially Assert r(${x}, ${y}).`); } } }
  for (const x of all) { if (rnd() < 0.4) { facts.push(`Initially Assert s(${x}).`); } }
  for (const x of all) { if (rnd() < 0.4) { facts.push(`Initially Set m(${x}) to ${pick([1, 2])}.`); } }
  const text = `Module d "D" { Kind thing. Kind place.
    Relation r(entity, entity). Relation s(entity). Relation distinct(entity, entity). Measure m(entity).
    Entity a: thing "A". Entity b: thing "B". Entity c: thing "C". Entity h: place "H".
    Query p(x: thing) means ${pBody}.
    Query q(x: thing, y: thing) means ${qBody}.
    ${facts.join(' ')} }`;
  let module;
  try { module = ModuleParser.parse(text); } catch (e) { errors++; continue; }
  const world = new World(module).apply(module.initial);
  const closed = new Set<string>();
  try {
    for (const x of things) { for (const y of things) { if (world.test(call('q', x, y))) { closed.add(`${x},${y}`); } } }
  } catch (e) { errors++; continue; }
  const report = (mode: string, got: Set<string>, want: Set<string>) => {
    const g = [...got].sort().join(' '), w = [...want].sort().join(' ');
    if (g !== w) { mismatches.push(`${mode}: open=[${g}] closed=[${w}]\n  p(x) means ${pBody}\n  q(x,y) means ${qBody}\n  ${facts.join(' ')}`); return true; }
    return false;
  };
  const solve = (p: Predicate) => [...world.solve(p, {})];
  try {
    if (report('q(?a,?b)', new Set(solve(call('q', '?a', '?b')).map(b => `${b['?a']},${b['?b']}`)), closed)) { continue; }
    if (report('q(?a,?a)', new Set(solve(call('q', '?a', '?a')).map(b => `${b['?a']},${b['?a']}`)),
      new Set([...closed].filter(k => k.split(',')[0] === k.split(',')[1])))) { continue; }
    let bad = false;
    for (const c of things) {
      if (report(`q(${c},?b)`, new Set(solve(call('q', c, '?b')).map(b => `${c},${b['?b']}`)),
        new Set([...closed].filter(k => k.startsWith(`${c},`))))) { bad = true; break; }
      if (report(`q(?a,${c})`, new Set(solve(call('q', '?a', c)).map(b => `${b['?a']},${c}`)),
        new Set([...closed].filter(k => k.endsWith(`,${c}`))))) { bad = true; break; }
    }
    if (bad) { continue; }
    // Candidates must propose a superset of the true answers (an unbound slot proposes anything).
    for (const asked of [call('q', '?a', '?b'), call('q', '?a', '?a')]) {
      const proposed = [...Candidates.of(world, asked, {})];
      const covers = (x: string, y: string) => proposed.some(b => (b['?a'] === undefined || b['?a'] === x)
        && (asked.args[1] === '?a' ? (b['?a'] === undefined || b['?a'] === y) : (b['?b'] === undefined || b['?b'] === y)));
      const missed = [...closed].filter(k => { const [x, y] = k.split(','); return (asked.args[1] !== '?a' || x === y) && !covers(x!, y!); });
      if (missed.length) { mismatches.push(`Candidates ${World.format(asked)} missed [${missed.join(' ')}]\n  p(x) means ${pBody}\n  q(x,y) means ${qBody}\n  ${facts.join(' ')}`); bad = true; break; }
    }
    if (bad) { continue; }
    // A conjunction with a typed generator, in both orders, against the closed enumeration.
    const gen = ModuleParser.predicate('s(?a)');
    const want = new Set([...closed].filter(k => world.test(call('s', k.split(',')[0]!))));
    const and1: Predicate = { kind: 'and', left: gen, right: call('q', '?a', '?b') };
    const and2: Predicate = { kind: 'and', left: call('q', '?a', '?b'), right: gen };
    if (report('s(?a) and q(?a,?b)', new Set(solve(and1).map(b => `${b['?a']},${b['?b']}`)), want)) { continue; }
    if (report('q(?a,?b) and s(?a)', new Set(solve(and2).map(b => `${b['?a']},${b['?b']}`)), want)) { continue; }
  } catch (e) { mismatches.push(`THROW ${(e as Error).message}\n  q(x,y) means ${qBody}`); }
}
console.log(`trials=${trials} seed=${process.argv[3] ?? 1} parse/eval errors=${errors} mismatches=${mismatches.length}`);
const byMode = new Map<string, number>();
for (const m of mismatches) { const k = m.split(':')[0]!.replace(/[abc](?=[,)])/g, 'c'); byMode.set(k, (byMode.get(k) ?? 0) + 1); }
console.log([...byMode].map(([k, v]) => `  ${k}: ${v}`).join('\n'));
// Shortest few, for minimisation.
for (const m of mismatches.sort((x, y) => x.length - y.length).slice(0, 8)) { console.log('---\n' + m); }
