#!/usr/bin/env bun
// The architecture review of November 2026: are generated countries' modules all seeded alike? Two countries beyond
// the first (west and north of it) are drawn as the Frontier draws them, and their region modules loaded as an
// install loads them (ModuleBundle.load). Each module's seed is RandomStreams.key(world seed, 'module', <the Kyr
// module's own id>, request.randomIdentity ?? ''); every drawn country's Kyr module is `Module region …`, and no
// request sets randomIdentity, so the seeds come out equal. Then the people both countries hold by the same local id
// are made as an install makes them (ModuleInstallations.creature, from entry.seed) and their bodies compared.
//   bun scripts/review-2026-11/seeds.ts [seed=a1]
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { ModuleInstallations } from '../../src/campaign/module-installations';
import { WorldAssembler } from '../../src/world/world-assembler';
import type { InstalledModule } from '../../src/campaign/definition';

const seed = process.argv[2] ?? 'a1', base = NodeBundleSource.shared;
const host: InstalledModule = { id: 'region', name: 'host', seed: 'host', installedAt: 0, goal: { kind: 'boolean', value: false },
  actors: [], pressures: [], outcomes: [], exports: { party: 'party' } };
const drafts = [];
for (const [x, y] of [[-1, 0], [0, -1]] as const) {
  const beyond = await WorldAssembler.beyond(seed, base, { x, y, exclude: [], first: 'plains' });
  const request = beyond.requests[0]!;
  const draft = await ModuleBundle.load(request, { seed, installed: [host] }, beyond.source);
  drafts.push({ rid: request.id, name: beyond.region.name, draft });
}
const [a, b] = drafts as [typeof drafts[0], typeof drafts[0]];
console.log(`${a.rid} (${a.name}) seed ${a.draft.seed}`);
console.log(`${b.rid} (${b.name}) seed ${b.draft.seed}`);
console.log(`module seeds equal: ${a.draft.seed === b.draft.seed}`);
class Seeds {
  static local(id: string, rid: string): string { return id.slice(rid.length + 2); }
  static body(c: ReturnType<typeof ModuleInstallations.creature>): string {
    return JSON.stringify({ str: c.base.strength, dex: c.base.dexterity, con: c.base.constitution,
      int: c.base.intelligence, wis: c.base.wisdom, cha: c.base.charisma, hp: c.state.hp });
  }
  static ids(r: Awaited<ReturnType<typeof WorldAssembler.beyond>>): string[] {
    return r.requests.map(q => q.id.replace(/^x(m?\d+)y(m?\d+)/, ''));
  }
}
const local = Seeds.local.bind(Seeds), body = Seeds.body.bind(Seeds);
const theirs = new Map(b.draft.instance.campaign!.creatures.map(c => [local(c.id, b.rid), c]));
let same = 0, compared = 0, alike = 0;
for (const mine of a.draft.instance.campaign!.creatures) {
  const other = theirs.get(local(mine.id, a.rid));
  if (!other) { continue; }
  compared++;
  if (mine.seed!.replace(a.rid, '') === other.seed!.replace(b.rid, '')) { same++; }
  const ca = ModuleInstallations.creature(mine), cb = ModuleInstallations.creature(other);
  const sameContext = mine.context.raceId === other.context.raceId && mine.context.classId === other.context.classId;
  if (sameContext && body(ca) === body(cb)) {
    alike++;
    if (alike <= 5) {
      console.log(`  ${local(mine.id, a.rid)}: ${mine.context.name} (${a.rid}) and ${other.context.name} (${b.rid}),`
        + ` both ${mine.context.raceId} ${mine.context.classId ?? ''}: ${body(ca)}`);
    }
  }
}
const sameKind = a.draft.instance.campaign!.creatures.filter(m => {
  const o = theirs.get(local(m.id, a.rid));
  return o && m.context.raceId === o.context.raceId && m.context.classId === o.context.classId;
}).length;
console.log(`people held by the same local id in both: ${compared}; with the same creature seed: ${same}`);
console.log(`of those of the same people and calling: ${sameKind}; with identical rolled qualities (all six) and hit points: ${alike}`);

// And whether a country is the same whichever way it is reached. The Frontier draws a country beyond a march from what
// the world holds when the company first stands there (Frontier.drawn: the scenarios placed anywhere already, the
// works already named, the paintings already held, the date): drawn after its neighbour, it is drawn excluding what
// the neighbour placed. The country north of the first, drawn first and drawn after the one west of it:
const library = await WorldAssembler.library(base, 'data/scenarios/library.json');
const west = await WorldAssembler.beyond(seed, base, { x: -1, y: 0, exclude: [], first: 'plains' });
const bare = new Set(west.requests.map(r => r.id.replace(/^x(m?\d+)y(m?\d+)/, '').replace(/\d+$/, '')));
const placedWest = library.filter(e => e.manifest.modules.some(m => bare.has(m.id.replace(/[^A-Za-z0-9]/g, ''))))
  .map(e => e.manifest.id);
const ids = Seeds.ids.bind(Seeds);
const first = await WorldAssembler.beyond(seed, base, { x: 0, y: -1, exclude: [], first: 'plains' });
const after = await WorldAssembler.beyond(seed, base, { x: 0, y: -1, exclude: placedWest, first: 'plains' });
console.log(`\nwest of the first placed: ${placedWest.join(', ') || 'nothing from the library'}`);
console.log(`north, drawn first:            ${ids(first).join(' ')}`);
console.log(`north, drawn after the west:   ${ids(after).join(' ')}`);
console.log(`the same country either way: ${JSON.stringify(ids(first)) === JSON.stringify(ids(after))}`);
