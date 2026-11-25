import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

// A town's particular questions wait on its people having said what the matter is (toldMatter, OR-423), and a
// generated town's keeper, trader and priest are given that question (TownMatters). An authored module that stands in
// for such a town, exporting its keeper, priest or trader to the goings-on set there, must give each of them the
// question too: Wending Cross (Gosse's Company, played alone) had none, and Mother Ivy, Mistress Thackeray and Cobbet
// could never be asked about the players on the green.
const manifests = (dir: string): string[] => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? manifests(p) : f === 'module.json' ? [p] : [];
});
describe('a town stood in for by an authored module', () => {
  it('lets each of its keeper, priest and trader say what the matter is', () => {
    const missing: string[] = [];
    let roles = 0;
    for (const file of manifests('data')) {
      type Manifest = { source?: string | string[]; exports?: Record<string, string> };
      const m = JSON.parse(readFileSync(file, 'utf8')) as Manifest;
      if (!m.source || !m.exports) { continue; }
      const text = [m.source].flat().map(f => readFileSync(join(dirname(file), f), 'utf8')).join('\n');
      for (const role of ['keeper', 'priest', 'trader']) {
        const who = m.exports[role];
        if (!who) { continue; }
        roles++;
        if (!new RegExp(`Topic \\S+ with ${who} [^\\n]*\\{[^}]*Assert toldMatter\\(${who}, actor\\)`).test(text)) {
          missing.push(`${file}: ${role} ${who}`);
        }
      }
    }
    expect(roles).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
