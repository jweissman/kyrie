// Synthesis probe (review artifact). Run: bun doc/architecture/next-phase-independent-review/synthesis/prose-repetition.probe.ts
// A crude, bounded measure of repetition in generated prose: every observation text, topic text and rule `says` of
// a generated world (seeds a1, thorn, wren), split into sentences (variables left unrendered). Reports how many
// sentences occur more than once within a world, and how many of a world's sentences also occur verbatim in the other
// worlds. Not a quality score: a pointer to where an editor should read.
import { WorldAssembler } from '../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../src/session/play-session';

const seeds = ['a1', 'thorn', 'wren'], worlds: Map<string, number>[] = [];
for (const seed of seeds) {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
  const m = (await PlaySession.start(w.path, seed, w.source)).campaign.module;
  const texts = [...(m.observations ?? []).map(o => o.text), ...(m.rules ?? []).flatMap(r => r.say ? [r.say] : [])];
  const counts = new Map<string, number>();
  for (const t of texts) for (const s of t.split(/(?<=[.!?]['’"]?)\s+/).map(x => x.trim()).filter(x => x.length > 25)) counts.set(s, (counts.get(s) ?? 0) + 1);
  worlds.push(counts);
  const total = [...counts.values()].reduce((a, b) => a + b, 0), repeated = [...counts.entries()].filter(([, n]) => n > 1);
  console.log(`${seed}: ${texts.length} texts, ${total} sentences, ${counts.size} distinct; ${repeated.length} distinct sentences recur within the world (${repeated.reduce((a, [, n]) => a + n, 0)} occurrences)`);
  console.log('  most repeated:', repeated.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, n]) => `${n}× "${s.slice(0, 90)}"`));
}
for (let i = 0; i < seeds.length; i++) {
  const others = new Set(worlds.filter((_, j) => j !== i).flatMap(m => [...m.keys()]));
  const shared = [...worlds[i]!.keys()].filter(s => others.has(s));
  console.log(`${seeds[i]}: ${shared.length} of ${worlds[i]!.size} distinct sentences (${Math.round(100 * shared.length / worlds[i]!.size)}%) appear verbatim in another seed's world`);
}
