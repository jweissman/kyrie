#!/usr/bin/env bun
// The architecture review of November 2026: what asserting into an exclusive relation costs as the relation grows.
// World.change (src/lang/world.ts) copies every fact of an exclusive relation into an array and scans it on each
// assert, to retract the one with the same leading arguments; so filling one (a world's initial `at`, thousands of
// facts) is quadratic. N things each put at a place, N doubling, one apply each.
//   bun scripts/review-2026-11/exclusive.ts
import { World } from '../../src/lang/world';
import type { Change, Module } from '../../src/lang/module';

class Exclusive {
  static module(n: number): Module {
    return { id: 'm', name: 'm', description: '', kinds: ['thing', 'place'],
      entities: [...Array.from({ length: n }, (_, i) => ({ id: `t${i}`, type: 'thing', name: `t${i}` })),
        { id: 'p', type: 'place', name: 'p' }],
      relations: [{ name: 'at', types: ['thing', 'place'], exclusive: true }, { name: 'near', types: ['thing', 'place'] }],
      measures: [], queries: [], initial: [], actions: [], goal: { kind: 'boolean', value: false },
      budget: { kind: 'number', value: 1 } } as unknown as Module;
  }
  static facts(name: string, n: number): Change[] {
    return Array.from({ length: n }, (_, i) => ({ kind: 'assert', call: { kind: 'call', name, args: [`t${i}`, 'p'] } }) as Change);
  }
}
console.log('| facts | exclusive `at` ms | plain relation ms |');
console.log('|---:|---:|---:|');
for (const n of [1000, 2000, 4000, 8000, 16000]) {
  const m = Exclusive.module(n), w = new World(m);
  let t = performance.now(); w.apply(Exclusive.facts('at', n)); const exclusive = performance.now() - t;
  t = performance.now(); w.apply(Exclusive.facts('near', n)); const plain = performance.now() - t;
  console.log(`| ${n} | ${exclusive.toFixed(0)} | ${plain.toFixed(0)} |`);
}
