import { Campaign } from '../src/campaign/campaign';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// How campaign costs grow with places, items and company size, and with the scenarios a generated region holds.
// Each synthetic world is a chain of rooms with items lying in them; eager grounding is computed for comparison only.
// Usage: bun bin/scale-bench.ts
class Scale {
  static async rules(): Promise<Record<string, string>> {
    return Object.fromEntries(await Promise.all(ModuleBundle.world.map(async name => [
      `data/rules/${name}.kyr`, await Bun.file(`data/rules/${name}.kyr`).text()])));
  }
  static site(places: number, items: number, company: number): string {
    const rooms = Array.from({ length: places }, (_, i) => `  Place r${i} "Room ${i}" is room within keep at ${i}, 0.`);
    const ways = Array.from({ length: places - 1 }, (_, i) => `  Passage w${i} "Door ${i}" is door between r${i} and r${i + 1}.`);
    const loot = Array.from({ length: items }, (_, i) => `  Item i${i} "a dagger" is dagger at r${i % places}.`);
    return [`Module keep "Keep" {`, `  Place keep "The keep" is site.`, ...rooms, ...ways, ...loot,
      `  Company party "Party" of ${company} at r0.`, `  Goal false.`, `}`].join('\n');
  }
  static async run(places: number, items: number, company: number, rules: Record<string, string>) {
    const source = new MemoryBundleSource({ ...rules,
      'campaign.json': JSON.stringify({ version: 1, name: 'Scale', modules: [{ id: 'keep', bundle: 'module.json' }] }),
      'module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
      'site.kyr': this.site(places, items, company) });
    let t = performance.now();
    const c = await Campaign.load('campaign.json', `scale-${places}-${items}-${company}`, source);
    const load = performance.now() - t;
    let eager: number | string;
    try { eager = ActionSchemas.ground(c.module, c.actors).length; } catch { eager = 'refuses (>20k for one schema)'; }
    t = performance.now(); const choices = PlayerView.choices(c).length; const list = performance.now() - t;
    t = performance.now(); c.execute(PlayerView.resolve(c, 'wait')); const tick = performance.now() - t;
    const save = JSON.stringify(c.save()).length;
    return { places, items, company, eager, choices, loadMs: Math.round(load), listMs: Math.round(list),
      tickMs: Math.round(tick), saveKb: Math.round(save / 1024) };
  }
  // One generated region (seed thorn, upland) with 0–4 scenarios situated in it.
  static async world(scenarios: number) {
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { region: { terrain: 'mountain' }, scenarios });
    let t = performance.now();
    const c = await Campaign.load(world.path, `world-${scenarios}`, world.source);
    const load = performance.now() - t;
    t = performance.now(); const choices = PlayerView.choices(c).length; const list = performance.now() - t;
    t = performance.now(); c.execute(PlayerView.resolve(c, 'wait')); const tick = performance.now() - t;
    return { scenarios: world.report.placements.length, modules: c.installations.length,
      entities: c.module.entities.length, schemas: c.module.actions.length, choices, loadMs: Math.round(load),
      listMs: Math.round(list), tickMs: Math.round(tick), saveKb: Math.round(JSON.stringify(c.save()).length / 1024) };
  }
}
const rules = await Scale.rules();
const rows = [];
for (const [places, items, company] of [[5, 5, 2], [10, 20, 3], [20, 40, 3], [40, 80, 3], [40, 80, 6], [80, 160, 6]]) {
  rows.push(await Scale.run(places!, items!, company!, rules));
}
console.table(rows);
const worlds = [];
for (const n of [0, 1, 2, 3, 4]) { worlds.push(await Scale.world(n)); }
console.table(worlds);
