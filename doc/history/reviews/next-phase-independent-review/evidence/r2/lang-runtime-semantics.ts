// Run-time semantics of Kyr worlds: query parameter types, measures past nothing (apply vs admits), dice in
// arithmetic, and the idle-rule cache across a grown entity list. Usage: bun lang-runtime-semantics.ts
import { ModuleParser } from '../../../../../src/lang/module-parser';
import { ModuleCompiler } from '../../../../../src/lang/module-compiler';
import { World } from '../../../../../src/lang/world';
import { CampaignTick } from '../../../../../src/campaign/campaign-tick';
import type { Change, Predicate } from '../../../../../src/lang/module';

const P = (s: string) => ModuleParser.predicate(s);
const C = (s: string): Change => ModuleParser.parse(`Module c "C" { Kind group. Measure gold(group). Initially ${s}. }`).initial[0]!;
const make = (body: string) => {
  const m = ModuleParser.parse(`Module p "P" { ${body} }`); new ModuleCompiler().validate(m);
  return new World(m).apply(m.initial);
};
const answers = (w: World, p: Predicate, v: string) => [...w.solve(p, {})].map(b => b[v]).sort().join(',') || '(none)';

console.log('== R1 a query parameter\'s type is enforced only when its body cannot bind it');
{
  const w = make(`Kind thing. Kind place. Relation lit(entity). Relation at(entity, place).
    Entity cup: thing "cup". Entity lamp: thing "lamp". Entity hall: place "hall".
    Initially Assert lit(lamp). Initially Assert lit(hall). Initially Assert at(cup, hall). Initially Assert at(lamp, hall).
    Query bright(t: thing) means lit(t).
    Query dark(t: thing) means not lit(t).`);
  console.log(`   Query bright(t: thing) means lit(t).   facts lit(lamp), lit(hall: place)`);
  console.log(`   bright(?t)             -> ${answers(w, P('bright(?t)'), '?t')}   (hall is a place, not a thing)`);
  console.log(`   test bright(hall)      -> ${w.test(P('bright(hall)'))}`);
  console.log(`   Query dark(t: thing) means not lit(t).`);
  console.log(`   dark(?t)               -> ${answers(w, P('dark(?t)'), '?t')}   (ranged over things only)`);
  console.log(`   dark(?x) and at(?x, hall) vs at(?x, hall) and dark(?x): ${answers(w, P('dark(?x) and at(?x, hall)'), '?x')} / ${answers(w, P('at(?x, hall) and dark(?x)'), '?x')}`);
  const w2 = make(`Kind thing. Kind place. Relation lit(entity). Relation at(entity, place).
    Entity cup: thing "cup". Entity hall: place "hall". Entity yard: place "yard".
    Initially Assert at(cup, hall). Initially Assert at(yard, hall).
    Query dark(t: thing) means not lit(t).`);
  console.log(`   with at(yard: place, hall): dark(?x) -> ${answers(w2, P('dark(?x)'), '?x')};  at(?x, hall) and dark(?x) -> ${answers(w2, P('at(?x, hall) and dark(?x)'), '?x')}`);
  console.log('   (adding a conjunct yields an answer the query alone denies: yard is no thing)');
}

console.log('\n== R2 a count taken past nothing: a rule clamps it, an action\'s admits refuses it');
{
  const w = make(`Kind group. Measure gold(group). Entity ann: group "Ann". Initially Set gold(ann) to 3.`);
  for (const s of ['Decrease gold(ann) by 5', 'Increase gold(ann) by 0 - 5', 'Set gold(ann) to 0 - 5', 'Set gold(ann) to 1 - 5 + 4']) {
    const c = C(s); let applied: string;
    try { applied = String(w.apply([c]).number({ kind: 'call', name: 'gold', args: ['ann'] })); } catch (e) { applied = `throws ${(e as Error).message}`; }
    console.log(`   ${s.padEnd(30)} apply -> gold ${applied.padEnd(4)} admits -> ${w.admits([c])}`);
  }
  // Two changes in one action: the second reads what the first did. Order-dependence of the clamp.
  const a = [C('Decrease gold(ann) by 5'), C('Increase gold(ann) by 5')], b = [C('Increase gold(ann) by 5'), C('Decrease gold(ann) by 5')];
  console.log(`   [-5, +5] apply -> ${w.apply(a).number({ kind: 'call', name: 'gold', args: ['ann'] })}; [+5, -5] apply -> ${w.apply(b).number({ kind: 'call', name: 'gold', args: ['ann'] })}  (net change 0 both ways)`);
}

console.log('\n== R3 dice in arithmetic');
{
  const w = make(`Kind thing. Kind clock. Measure dice(entity). Measure watch(clock). Measure count(thing).
    Entity clock: clock "clock". Entity cup: thing "cup". Entity jar: thing "jar".
    Initially Set dice(clock) to 40. Initially Set watch(clock) to 3.`);
  const v = (s: string) => w.number((P(`${s} > 0`) as Extract<Predicate, { kind: 'compare' }>).left);
  console.log(`   dice(cup)=${v('dice(cup)')} dice(jar)=${v('dice(jar)')} dice(cup)+dice(cup)=${v('dice(cup) + dice(cup)')}  (one die per thing per watch)`);
  const c = C('Decrease gold(ann) by 1');
  const roll: Change = { kind: 'increase', call: { kind: 'call', name: 'count', args: ['cup'] }, value: { kind: 'call', name: 'dice', args: ['cup'] } };
  console.log(`   Increase count(cup) by dice(cup): apply -> ${w.apply([roll]).number({ kind: 'call', name: 'count', args: ['cup'] })}`);
  const spend: Change = { kind: 'decrease', call: { kind: 'call', name: 'count', args: ['cup'] }, value: { kind: 'call', name: 'dice', args: ['cup'] } };
  const w1 = w.apply([{ kind: 'set', call: { kind: 'call', name: 'count', args: ['cup'] }, value: { kind: 'number', value: 5 } }]);
  console.log(`   count(cup)=5; Decrease count(cup) by dice(cup): admits -> ${w1.admits([spend])} (admits reads the die as a stored measure, 0), apply -> ${w1.apply([spend]).number({ kind: 'call', name: 'count', args: ['cup'] })}`);
  void c;
}

console.log('\n== R4 the idle-rule cache does not see entities added to the world (withModule keeps the line)');
{
  const text = (extra: string) => `Module p "P" { Kind thing. Relation marked(thing). Relation lit(thing).
    Query unmarked(t: thing) means not marked(t).
    Rule light when unmarked(?t) and not lit(?t) { Assert lit(?t). } ${extra} }`;
  const m1 = ModuleParser.parse(text('')), w1 = new World(m1).apply(m1.initial);
  const rule = m1.rules![0]!;
  console.log(`   before: instances = ${CampaignTick.instances(rule, w1).length} (no things yet; the rule is now remembered idle)`);
  const m2 = { ...m1, entities: [...m1.entities, { id: 'cup', type: 'thing', name: 'cup' }] };
  const w2 = w1.withModule(m2);
  console.log(`   a thing cup joins (as an installation/frontier adds entities): test unmarked(cup) and not lit(cup) = ${w2.test(P('unmarked(cup) and not lit(cup)'))}`);
  console.log(`   same rule object: instances = ${CampaignTick.instances(rule, w2).length};  fresh rule object: ${CampaignTick.instances(structuredClone(rule), w2).length}`);
}
