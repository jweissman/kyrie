// What the Kyr compiler accepts that then misbehaves at run time. Each case is a minimal module; the probe reports
// whether ModuleCompiler.validate accepts it and, if so, what one pass of its rules does (CampaignTick's own
// instances + apply, in authored order, each instance re-tested as CampaignTick.rules does).
// Usage: bun lang-compiler-gaps.ts
import { ModuleParser } from '../../../../../src/lang/module-parser';
import { ModuleCompiler } from '../../../../../src/lang/module-compiler';
import { World } from '../../../../../src/lang/world';
import { ObservationText } from '../../../../../src/lang/observation-text';
import { CampaignTick } from '../../../../../src/campaign/campaign-tick';
import { Endings } from '../../../../../src/lang/endings';

const head = `Kind group. Kind place. Kind thing.
  Relation at(entity, place) exclusive. Relation marked(thing). Relation lit(thing). Relation reached(ending).
  Relation distinct(entity, entity). Kind ending.
  Measure gold(group). Measure count(thing).
  Entity ann: group "Ann". Entity bob: group "Bob". Entity hall: place "the hall". Entity cup: thing "the cup".
  Initially Assert at(ann, hall). Initially Assert at(bob, hall). Initially Set gold(ann) to 7.`;

function pass(world: World): { world: World; said: string[] } {
  const said: string[] = [];
  for (const rule of world.module.rules ?? []) {
    for (const [effects, binding] of CampaignTick.instances(rule, world)) {
      if (Object.keys(binding).length && !world.test(rule.when, binding)) { continue; }
      world = world.apply(effects);
      if (rule.say) { said.push(`${rule.id}: ${ObservationText.render(rule.say, world, true, binding)}`); }
    }
  }
  return { world, said };
}
function run(label: string, body: string, extra?: (w: World) => void) {
  console.log(`\n== ${label}\n${body.trim().split('\n').map(l => '   ' + l.trim()).join('\n')}`);
  let module;
  try { module = ModuleParser.parse(`Module p "P" { ${head}\n${body} }`); new ModuleCompiler().validate(module); }
  catch (e) { console.log(`   REJECTED: ${(e as Error).message.split('\n')[0]}`); return; }
  console.log('   ACCEPTED by ModuleCompiler.validate');
  const before = new World(module).apply(module.initial);
  try {
    const { world, said } = pass(before);
    for (const line of world.changes(before)) { console.log(`   fact ${line}`); }
    for (const s of said) { console.log(`   said ${s}`); }
    extra?.(world);
  } catch (e) { console.log(`   RUNTIME THROW: ${(e as Error).message}`); }
}

run('G1 effect names a ?variable its condition never binds',
  `Rule r1 when at(ann, hall) { Assert marked(?t). }`);
run('G2 effect names a ?variable bound only under not',
  `Rule r2 when not marked(?t) { Assert lit(?t). }`);
run('G3 ?variable bound to a group written where a thing is expected',
  `Rule r3 when at(?g, hall) { Assert marked(?g). Increase count(?g) by 1. }`);
run('G4 compared ?variable bound only on the other side of an or (bound() treats or as and)',
  `Entity cellar: place "the cellar".
   Rule r4 when at(?g, cellar) or gold(?g) > 5 says "{?g} is rich or below." { Assert lit(cup). }`);
run('G5 compared ?variable hidden in arithmetic escapes bound()',
  `Rule r5 when gold(?g) + 0 > 5 { Assert lit(cup). }`);
run('G5b same comparison without arithmetic (control)',
  `Rule r5b when gold(?g) > 5 { Assert lit(cup). }`);
run('G6 measure interpolation with a ?variable in a rule says renders the unbound measure',
  `Rule r6 when at(?g, hall) and gold(?g) > 5 says "{?g} counts {gold(?g)} coins." { Assert lit(cup). }`);
run('G7 measure interpolation with a ?variable the condition never binds',
  `Rule r7 when at(ann, hall) says "Someone counts {gold(?nobody)} coins." { Assert lit(cup). }`);
run('G8 ending epilogue naming what its condition bound: told right as it happens, raw on the closing page',
  `Ending won "Won" when at(?g, hall) and gold(?g) > 5 "{?g} leaves rich.".`,
  w => console.log(`   closing page (Endings.reached): ${JSON.stringify(Endings.reached(w))}`));
run('G9 query body comparing a ?variable nothing binds: always false, accepted',
  `Query rich() means gold(?g) > 5.
   Rule r9 when rich() { Assert lit(cup). }`);
run('G10 distinct over an unbound ?variable: accepted, throws when the world runs',
  `Rule r10 when at(ann, ?p) and distinct(ann, ?other) { Assert lit(cup). }`);
run('G11 Observation text naming a ?variable its condition never binds (Rule says checks this; Observe does not)',
  `Observe o1 at hall when at(ann, hall) "{?who} waits here.".`,
  w => console.log(`   observation renders: ${ObservationText.render(w.module.observations![0]!.text, w)}`));
run('G13 Rule writing a Query name (control)',
  `Query rich(g: group) means gold(g) > 5.
   Rule r13 when at(ann, hall) { Assert rich(ann). }`);
run('G14 authored relation colliding with an Event latch',
  `Relation once_e().
   Event e when at(ann, hall) "It happens.".`);
run('G15 authored relation colliding with Endings\' concluded (silently merged: the author\'s fact ends the book)',
  `Relation concluded().
   Ending fin "Fin" when lit(cup) "The end.".
   Rule r15 when at(ann, hall) and not concluded() { Assert concluded(). }
   Rule r15b when at(ann, hall) { Assert lit(cup). }`);
run('G16 literal braces in authored text',
  `Rule r16 when at(ann, hall) says "A sign: {no entry}." { Assert lit(cup). }`);
