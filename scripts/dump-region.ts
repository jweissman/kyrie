#!/usr/bin/env bun
// The Kyr a generated country is written as, for the entities whose ids begin with a prefix: to see what a
// template or a work plan came to for one seed (the lines are the author's, filled), before reading it in play.
//   bun scripts/dump-region.ts <seed> <id-prefix>        e.g.  bun scripts/dump-region.ts kahitude e1
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

const [seed = 'kahitude', prefix = 'e1'] = process.argv.slice(2);
const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
const files = (world.source as unknown as { files: Map<string, string> }).files;
for (const [name, text] of files) {
  if (!name.endsWith('.kyr')) { continue; }
  const lines = text.split('\n').filter(l => new RegExp(`\\b${prefix}_`).test(l));
  if (lines.length) { console.log(`## ${name.split('/').slice(-2).join('/')}`); console.log(lines.join('\n')); }
}
