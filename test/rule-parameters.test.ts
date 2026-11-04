import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleBundle } from '../src/campaign/module-bundle';

// The rules every world shares name their actions' parameters as no adventure names a thing: a parameter that shadows
// an entity stops the adventure loading (the making rules' "made" and Quittance's berth, whose state is "made"). Each
// authored file that reads on its own is read; one that is part of a larger module only is passed over.
describe("the shared rules' parameters", () => {
  it('shadow no entity of any adventure, kit, origin or situation', () => {
    const params = new Map<string, string>();
    for (const name of ModuleBundle.ruleNames) {
      for (const a of ModuleParser.parse(readFileSync(`data/rules/${name}.kyr`, 'utf8')).actions) {
        for (const p of a.parameters ?? []) { params.set(p.name, `${name}: ${a.id}`); }
      }
    }
    const shadowed: string[] = [];
    let read = 0;
    for (const f of new Glob('data/{adventures,kits,origins,situations}/**/*.kyr').scanSync('.')) {
      let entities: { id: string }[];
      try { entities = ModuleParser.parse(readFileSync(f, 'utf8')).entities; } catch { continue; }
      read++;
      shadowed.push(...entities.filter(e => params.has(e.id)).map(e => `${f}: ${e.id} (${params.get(e.id)})`));
    }
    expect(read).toBeGreaterThan(300);
    expect(shadowed).toEqual([]);
  }, 120000);
});
