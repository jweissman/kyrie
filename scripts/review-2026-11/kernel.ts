#!/usr/bin/env bun
// The architecture review of November 2026: a rule run with the kernel alone, as a boundary prototype. Kyr parsed
// (src/lang/module-parser.ts) and played on facts (src/lang/world.ts), its action grounded and applied here in a few
// lines, with no compiler, no campaign, no canon, no catalog and no Deem-made creature. Today's own "kernel" scale
// (scripts/load-scales.ts) goes through ModuleCompiler and ActionSchemas instead, which import the catalog
// (module-compiler.ts:2-4 → canon/canon.ts) and the creature pipeline (action-schemas.ts:6 → engine-writes →
// creature-facts → canon, content, paintings). Each import is timed as it is first taken.
//   bun scripts/review-2026-11/kernel.ts
const t0 = performance.now();
const { World } = await import('../../src/lang/world');
const t1 = performance.now();
const { ModuleParser } = await import('../../src/lang/module-parser');
const t2 = performance.now();
import type { Change, Module, Operator } from '../../src/lang/module';

const roads = `Module roads "Roads" {
  Kind group. Kind place. Relation at(group, place) exclusive. Relation route(place, place).
  Entity a: group "A". Entity x: place "X". Entity y: place "Y".
  Initially Assert route(x, y). Initially Assert at(a, x).
  Action travel(actor: group, origin: place, destination: place) "Travel to {destination}" {
    Requires at(actor, origin) and route(origin, destination). On success { Assert at(actor, destination). }
  }
  Goal at(a, y).
}`;
// The whole of grounding and applying, for a module whose parameters are entities of a kind.
class Kernel {
  static bind(c: Change, b: Record<string, string>): Change {
    return { ...c, call: { ...c.call, args: c.call.args.map(x => b[x] ?? x) } } as Change;
  }
  static ground(m: Module, a: Operator): Record<string, string>[] {
    return (a.parameters ?? []).reduce<Record<string, string>[]>((all, p) =>
      all.flatMap(b => m.entities.filter(e => e.type === p.type).map(e => ({ ...b, [p.name]: e.id }))), [{}]);
  }
}
const module = ModuleParser.parse(roads), t3 = performance.now();
let world = new World(module).apply(module.initial);
const travel = module.actions.find(a => a.id === 'travel')!;
const open = Kernel.ground(module, travel).filter(b => world.test(travel.requires, b));
world = world.apply(travel.success.map(c => Kernel.bind(c, open[0]!)));
const t4 = performance.now();
console.log(`import src/lang/world.ts ${(t1 - t0).toFixed(0)} ms; src/lang/module-parser.ts ${(t2 - t1).toFixed(0)} ms`
  + ` (Deem's grammar built from source at its import, for parse.ts's ability conditions, is most of it)`);
console.log(`parse ${(t3 - t2).toFixed(1)} ms; ground, test and apply ${(t4 - t3).toFixed(1)} ms`);
console.log(`open: ${JSON.stringify(open)}; goal holds after travel: ${world.test(module.goal)}`);
