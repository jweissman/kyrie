#!/usr/bin/env bun
// The architecture review of November 2026: the shared rules every install is composed with (ModuleBundle.world, the
// sixteen data/rules modules joined), measured: their size, a deep copy of them (ModuleBundle.loading copies them for
// each install, ModuleAssembly.compose copies their actions again as schemas, ModuleNamespace copies each action
// once more), and their compilation (ModuleAssembly.compose instantiates rules and situation together for each).
//   bun scripts/review-2026-11/rules-size.ts
import { readFileSync } from 'node:fs';
import { serialize } from 'node:v8';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { ModuleAssembly } from '../../src/campaign/module-assembly';
import type { Module } from '../../src/lang/module';

class Timing {
  static median(xs: number[]): number { return xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)]!; }
  static time(f: () => unknown, n = 15): number {
    return Timing.median(Array.from({ length: n }, () => {
      const t = performance.now(); f(); return performance.now() - t;
    }));
  }
}
const files = ModuleBundle.world.map(n => ({ path: `data/rules/${n}.kyr`, text: readFileSync(`data/rules/${n}.kyr`, 'utf8') }));
const rules = (ModuleBundle as unknown as { shared(f: typeof files): Module }).shared(files);
const tiny = ModuleParser.parse('Module t "T" { Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard. }');
console.log(`rules: ${files.length} files, ${(files.reduce((n, f) => n + f.text.length, 0) / 1024).toFixed(0)} KB of Kyr; `
  + `${rules.actions.length} actions, ${rules.relations.length} relations, ${rules.entities.length} entities, `
  + `${rules.initial.length} initial facts, ${(rules.rules ?? []).length} rules; `
  + `v8-serialized ${(serialize(rules).length / 2 ** 20).toFixed(2)} MB (actions ${(serialize(rules.actions).length / 2 ** 20).toFixed(2)} MB)`);
console.log(`structuredClone(rules):         ${Timing.time(() => structuredClone(rules)).toFixed(1)} ms`);
console.log(`structuredClone(rules.actions): ${Timing.time(() => structuredClone(rules.actions)).toFixed(1)} ms`);
// The rules alone do not compile: they name the catalog's things (probing.kyr's needs(prodding, pole)), which only
// composing with a situation declares (Cast.itemKinds); so they are measured composed with a one-place situation.
const copy = Timing.time(() => structuredClone(rules));
const manifest = { name: '', creatures: [], actors: { order: [] }, initial: [], outcomes: [] };
const composed = Timing.time(() => ModuleAssembly.compose(structuredClone(tiny), structuredClone(rules), manifest, 's'), 7);
console.log(`ModuleAssembly.compose(a one-place situation, rules): ${(composed - copy).toFixed(1)} ms`
  + ' (what each install pays for the rules before its own content, the copy aside)');
