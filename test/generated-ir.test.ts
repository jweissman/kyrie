import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleSource } from '../src/lang/module-source';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { RuntimeCapabilities } from '../src/campaign/runtime-capabilities';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Module } from '../src/lang/module';

// The settlement writer's Observe, and the Topic each town's keeper is asked of a land beyond by (by bytes the largest
// of a drawn country's constructs), declared as values (ModuleSource; AX-04, doc/architecture/mission-22/
// generated-ir.md), held to the text they stand for by a differential harness: over the six countries, a1 and iscoed,
// each world begun twice in one process, once with the values written as their Kyr and parsed as before, once lowered
// into their files' modules, and the two the same module and the same game. A malformed value is refused by the
// validator that refuses the text.
const seeds = ['kite', 'thorn', 'wren', 'kahitude', 'mere', 'ember', 'a1', 'iscoed'];
const party = { origin: 'wanderer', party: [{ name: 'W', raceId: 'human', classId: 'warrior' }] };
async function begun(seed: string, asText: boolean) {
  ModuleSource.asText = asText;
  try { return await DrawnWorld.start(seed, party, NodeBundleSource.shared); } finally { ModuleSource.asText = false; }
}
describe('a drawn country\'s declarations made as values', () => {
  it('makes the module and the game the text makes, in every country of the corpus', async () => {
    const differ: string[] = [];
    let moved = 0, topics = 0;
    for (const seed of seeds) {
      const text = await begun(seed, true), ir = await begun(seed, false);
      const [a, b] = [text.campaign.module, ir.campaign.module];
      if (JSON.stringify(a) !== JSON.stringify(b)) { differ.push(`${seed}: module`); }
      if (Bun.hash(text.canonical()) !== Bun.hash(ir.canonical())) { differ.push(`${seed}: game`); }
      const own = /_(day|night|tap|life|shop_scene|shrine_view_seen)$/;
      moved += (b.observations ?? []).filter(o => own.test(o.id)).length;
      topics += b.actions.filter(x => /_beyond_told_/.test(x.id)).length;
    }
    expect(differ).toEqual([]);
    expect(moved).toBeGreaterThan(seeds.length * 6);
    expect(topics).toBeGreaterThan(seeds.length * 20);
  }, 900000);
  it('refuses a malformed value as the text is refused, naming what it is', () => {
    const kyr = (when: string) => `Module t "t" { Place yard "the yard" is room at 0, 0 outdoors.
  Observe o at yard when ${when} "".
  Goal false. }`;
    const check = (m: Module) => new ModuleCompiler(RuntimeCapabilities.signatures, false).validate(m);
    const said = (f: () => void) => { try { f(); return 'accepted'; } catch (e) { return (e as Error).message; } };
    const fromText = said(() => check(ModuleParser.parse(kyr('nosuch(yard)'))));
    const declared = { id: 'o', place: 'yard', when: ModuleWriter.call('nosuch', 'yard'), text: 'It is here.' };
    const fromValue = said(() => check(ModuleSource.lowered(ModuleParser.parse(kyr('true')), { file: 't.kyr',
      declared: [{ observation: declared, kyr: '', provenance: { generator: 'test', construct: 'Observe' } }] })));
    expect(fromValue).not.toBe('accepted');
    expect(fromValue).toBe(fromText);
  });
});
