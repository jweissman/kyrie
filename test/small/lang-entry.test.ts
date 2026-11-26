import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// Kyr's one public entry (src/lang/index.ts; platform-separation.md, stage 1): code outside the language imports it
// there, so that the language's own files can move behind it into a package of their own. The deep imports into
// src/lang/ that stood on 24 November are counted here and only fall; each moved to the entry lowers the count, written
// back here. The parse store, node's file system, is the runtime's adapter, not the language's surface.
// 1250 → 1252 on 25 November: the knowledge projector imports ModuleWriter and Kyr's types directly, because Kyr's own
// entry, loaded first by it, met the language's inner cycle (module-parser and its parsers) half-made (OR-542).
// 1252 → 1251 on 25 November: test/small/idle-held and kept-holds-no-world read the language through its entry, but
// for its parser, loaded first (OR-542).
// 1251 → 1250 on 25 November: what lies in wait at a way's mouth moved into PassageModel.lurking, read there by the
// page's ways and the journey alike, and Passages' imports for it gone.
// 1250 → 1249 on 25 November: the world's rules read Reads, and what is computed, through the entry (CampaignTick).
// 1249 → 1247 on 26 November: the map's and the journeys' reads of what the company knows moved into KnownCountry
// (src/ui/known-country.ts), which reads the language through its entry (OR-741).
// 1247 → 1244 on 26 November: the narrator's and the perception's reads of what the company perceives moved into
// CompanySenses (src/presentation/company-senses.ts), which reads the language through its entry (OR-741).
// 1244 → 1242 on 27 November: the campaign, handbook and region readers take VocabularyContext from Kyr's entry.
const kept = 1242;
class Deep {
  static count(): number {
    const roots = ['src/**/*.ts', 'web/**/*.{ts,tsx}', 'scripts/**/*.ts', 'test/**/*.ts', 'bin/**/*.ts'];
    let n = 0;
    for (const f of roots.flatMap(g => [...new Glob(g).scanSync('.')])) {
      if (f.startsWith('src/lang/')) { continue; }
      n += [...readFileSync(f, 'utf8').matchAll(/from '[^']*\/lang\/(?!index')[\w-]+'/g)].length;
    }
    return n;
  }
}
describe("Kyr's public entry", () => {
  const now = Deep.count();
  it('gains no deep import into the language', () => {
    expect(now).toBeLessThanOrEqual(kept);
  });
  it('keeps its count as it falls', () => {
    expect(kept).toBeLessThanOrEqual(now);
  });
});
