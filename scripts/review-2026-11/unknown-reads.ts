#!/usr/bin/env bun
// The architecture review of November 2026: TypeScript reads world facts by relation name (world.related, relatedTo,
// one), and a name the world does not declare reads as no facts, silently (World.related returns RelationViews.none),
// where world.test of the same name throws. This counts, over a start and a few turns with their screens and leaves,
// every relation name read that way which the campaign's module does not declare: renamed, misspelled, or belonging
// to rules this world was not built with.
//   bun scripts/review-2026-11/unknown-reads.ts full|scenario|tiny [turns=5]
import { World } from '../../src/lang/world';
import { ReviewScales } from './scales';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';

type Read = (this: World, ...a: unknown[]) => unknown;
class UnknownReads {
  static readonly unknown = new Map<string, number>();
  static reads = 0;
  // A read by name, noted, then made as it would have been.
  static noted(world: World, read: Read, a: unknown[]): unknown {
    UnknownReads.reads++;
    const relation = a[0] as string;
    if (!world.relates(relation) && !world.module.measures.some(m => m.name === relation)
      && !world.module.queries.some(q => q.name === relation)) {
      UnknownReads.unknown.set(relation, (UnknownReads.unknown.get(relation) ?? 0) + 1);
    }
    return read.apply(world, a);
  }
  static readonly originals = new Map<string, Read>();
  static related(this: World, ...a: unknown[]) { return UnknownReads.noted(this, UnknownReads.originals.get('related')!, a); }
  static relatedTo(this: World, ...a: unknown[]) {
    return UnknownReads.noted(this, UnknownReads.originals.get('relatedTo')!, a);
  }
  static one(this: World, ...a: unknown[]) { return UnknownReads.noted(this, UnknownReads.originals.get('one')!, a); }
  static watch() {
    const proto = World.prototype as unknown as Record<string, Read>;
    for (const name of ['related', 'relatedTo', 'one'] as const) {
      UnknownReads.originals.set(name, proto[name]!);
      proto[name] = UnknownReads[name] as Read;
    }
  }
}
UnknownReads.watch();
const { unknown } = UnknownReads;
const scale = process.argv[2] ?? 'scenario', turns = Number(process.argv[3] ?? 5);
const session = await ReviewScales.start(scale);
for (let i = 0; i <= turns; i++) {
  Narrator.leaf(session.campaign, ScreenModel.build(session.campaign));
  if (i < turns) { await session.perform(ReviewScales.wait(session)); }
}
console.log(`${scale}: ${UnknownReads.reads} reads by name; ${unknown.size} names the world does not declare, read ${
  [...unknown.values()].reduce((a, b) => a + b, 0)} times`);
console.log([...unknown].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', '));
