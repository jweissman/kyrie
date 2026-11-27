import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The page reads a field, never words (AR-05, MT-18's remainder): every place web/reader decides behaviour or styling
// from a label, a note or prose (a regex over its words, a startsWith on it), or from the spelling of an id that
// stands for a kind (`travel:`, `exit:`, `#talk`), is counted, so that the counts only fall. A rewording in the
// engine had silently broken what the page read back from the words: "Noted: " and "Aim: " on its notes, "seen
// through", "reaches level", a roll's sum, a panorama's bearings, "Ready for level" (all now typed: Exchange.noted,
// ExchangeLine.ended/levelled/roll/sight, Exchange.struck, MemberRow.toward). 46 word reads and 32 id spellings at the
// census of 21 November, 20 and 32 after it. Lower these as each moves into a field the engine sets; what is left of
// the words includes a few that only set type (a sentence's first, a stop added), which may stay.
const field = '(label|text|note|notes|said|name|title|about|alone|aside|says|words|response|line|stage|progress|told'
  + '|seen|place)';
const words = [new RegExp(`\\.(test|exec)\\(\\s*[^)]*\\b${field}\\b`),
  new RegExp(`\\.${field}\\??\\)?\\s*\\??\\.(startsWith|endsWith|includes|match|search|indexOf)\\(`),
  /\.(test|exec)\(\s*n\s*\)/];
const ids = [/\.(id|command|choice|act|does)\??\.(startsWith|endsWith|includes)\(/,
  /\/\^?[a-z_]+[:#(_][^/\n]*\/[gimsuy]*\.(test|exec)\([^)]*\b(id|command|choice|act|does)\b/];
class Census {
  static of(): { words: string[]; ids: string[] } {
    const root = join(import.meta.dir, '../..'), out = { words: [] as string[], ids: [] as string[] };
    for (const f of [...new Glob('web/reader/**/*.{ts,tsx}').scanSync(root)].sort()) {
      readFileSync(join(root, f), 'utf8').split('\n').forEach((line, i) => {
        if (line.trim().startsWith('//')) { return; }
        if (words.some(r => r.test(line))) { out.words.push(`${f}:${i + 1}`); } else if (ids.some(r => r.test(line))) {
          out.ids.push(`${f}:${i + 1}`);
        }
      });
    }
    return out;
  }
}

describe('the page\'s reads of words', () => {
  it('are no more than they were', () => {
    const { words: w, ids: d } = Census.of();
    expect(w.length).toBeLessThanOrEqual(20);
    expect(d.length).toBeLessThanOrEqual(32);
    expect(w.length + d.length).toBeGreaterThan(0);
  });
  it('read no note, moment, roll, panorama or level from its words', () => {
    const root = join(import.meta.dir, '../..');
    const read = ['news.tsx', '../../src/frame/talk-lines.ts', 'character-page.tsx', 'stage/moments.tsx', 'stage/check.tsx',
      'stage/panorama.tsx', 'stage/talk-stage.tsx', 'stage/told.tsx', 'stage/glance.tsx']
      .map(f => readFileSync(join(root, 'web/reader', f), 'utf8')).join('\n');
    for (const gone of ['Words.noted', 'Words.aimed', 'Words.label', 'Moments.ending', 'Moments.levelled',
      'Check.read', 'Told.harm', 'Ready for level', ' of [\\d,]+ experience', 'Panorama.sight']) {
      expect(read).not.toContain(gone);
    }
  });
});
