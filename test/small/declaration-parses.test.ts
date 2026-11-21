import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ModuleParser } from '../../src/lang/module-parser';
import { DeclarationParses } from '../../src/lang/declaration-parses';

// A text parsed a declaration at a time, each declaration's field kept by its text and the kinds it names, makes the
// module its whole parse makes (AX-04: a new world's declarations, half of them written as a world before had them,
// matched again). Every module text of the shared rules, the origins, the kits and three adventures, split, whole and
// again from the kept fields alone; and a text the split does not bear (a placed declaration, a stray brace) parsed
// whole. A drawn world's own new texts are checked so in test/new-world-warm.
class Texts {
  static all(): { file: string; text: string }[] {
    const root = join(import.meta.dir, '../..'), out: { file: string; text: string }[] = [];
    const walk = (d: string): void => {
      for (const e of readdirSync(join(root, d), { withFileTypes: true })) {
        if (e.isDirectory()) { walk(join(d, e.name)); } else if (e.name.endsWith('.kyr')) {
          const text = readFileSync(join(root, d, e.name), 'utf8');
          if (/^\s*(\/\/[^\n]*\n\s*)*Module\b/.test(text)) { out.push({ file: join(d, e.name), text }); }
        }
      }
    };
    for (const d of ['data/rules', 'data/origins', 'data/kits', 'data/adventures/quittance', 'data/adventures/hessel',
      'data/adventures/the-dorothea']) { walk(d); }
    return out;
  }
  static same(text: string): unknown {
    try { return JSON.parse(JSON.stringify(ModuleParser.whole(text))); } catch (e) { return String(e); }
  }
}

describe('a module parsed a declaration at a time', () => {
  it('is the module its whole parse is, split and again from what was kept', () => {
    const texts = Texts.all();
    expect(texts.length).toBeGreaterThan(30);
    let split = 0;
    const differ: string[] = [];
    for (const { file, text } of texts) {
      const whole = Texts.same(text);
      if (typeof whole === 'string') { continue; }
      const first = ModuleParser.chunked(text), again = ModuleParser.chunked(text);
      if (!first) { continue; }
      split++;
      if (JSON.stringify(first) !== JSON.stringify(whole) || JSON.stringify(again) !== JSON.stringify(whole)) {
        differ.push(file);
      }
    }
    expect(differ).toEqual([]);
    // Most texts split; those that do not are parsed whole.
    expect(split).toBeGreaterThan(texts.length / 2);
  }, 120000);
  it('parses whole what does not split as one module of declarations', () => {
    expect(DeclarationParses.split('Module m "M" {\n  Route r "R" from a to b.\n}')).toBeUndefined();
    expect(DeclarationParses.split('Module m "M" {\n  Relation r(group).\n} }')).toBeUndefined();
    expect(DeclarationParses.split('Module m "M" {\n  Relation r(group).\n  Measure n(group).\n}')?.chunks
      .map(c => c.text)).toEqual(['Relation r(group).', 'Measure n(group).']);
  });
});
