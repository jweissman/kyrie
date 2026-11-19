import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NodeBundleSource } from '../campaign/node-bundle-source';

// Which generator wrote a line of generated Kyr (a drawn world's region: `Person s1_merchant "Mik" at s1_shop {`), so
// that `kyrie inspect --why` can say where the choice was made (settlement-writer's `at ${s.id}_${f.selling ===
// 'shop' ? 'shop' : 'green'}`) and not only where its result was written. Each template literal of src that writes
// Kyr, and each line of a Kyr template of data (.kyrt), is matched against the line from its start: its blanks fill
// with anything, its own words must be there, and it must have twelve letters of its own at least (a template all
// blanks matches everything).
export class WhyWriter {
  private static templates?: { file: string; line: number; re: RegExp }[];
  // The templates that could have written the line, the one whose own words say most of what it matched first: of
  // those that match, "Person ${s.id}_merchant … at ${s.id}_${…}" fills less of it with blanks than "Person ${r.id} …".
  static of(text: string): string[] {
    const line = text.trim();
    const fits = this.index().flatMap(t => {
      const m = t.re.exec(line);
      return m ? [{ at: `${t.file}:${t.line}`, own: 1 - m.slice(1).join('').length / m[0].length }] : [];
    }).sort((a, b) => b.own - a.own);
    return fits.filter(f => f.own === fits[0]!.own).slice(0, 3).map(f => f.at);
  }
  private static index(): { file: string; line: number; re: RegExp }[] {
    if (this.templates) { return this.templates; }
    const root = NodeBundleSource.root, out: { file: string; line: number; re: RegExp }[] = [];
    for (const file of [...new Glob('src/**/*.ts').scanSync(root)].filter(f => !f.startsWith('src/cli/')).sort()) {
      readFileSync(join(root, file), 'utf8').split('\n').forEach((l, i) => {
        const start = l.indexOf('`');
        if (start < 0 || !/`\s*[A-Z][a-z]+ \$\{/.test(l)) { return; }
        const re = this.pattern(l.slice(start + 1));
        if (re) { out.push({ file, line: i + 1, re }); }
      });
    }
    for (const file of [...new Glob('data/**/*.kyrt').scanSync(root)].sort()) {
      readFileSync(join(root, file), 'utf8').split('\n').forEach((l, i) => {
        const re = /^\s*[A-Z][a-z]+ /.test(l) ? this.kyrt(l) : undefined;
        if (re) { out.push({ file, line: i + 1, re }); }
      });
    }
    return this.templates = out;
  }
  // A line of a Kyr template (data/generation: {t}, {town}, "{{t}_merchant}"), as a pattern; a template with no
  // blank is no template, and is found where it is written.
  private static kyrt(line: string): RegExp | undefined {
    const parts = line.trim().split(/\{\{[^}\s]*\}[^}\s]*\}|\{[a-z][\w.]*\}/);
    return parts.length > 1 ? this.joined(parts) : undefined;
  }
  private static joined(parts: string[]): RegExp | undefined {
    if (parts.join('').replace(/[^A-Za-z]/g, '').length < 12) { return undefined; }
    const escaped = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`^${escaped[0]!.trimStart()}${escaped.slice(1).map(p => `(.*?)${p}`).join('')}`);
  }
  // A template's text up to its closing backtick, as a pattern: its words as they are, each ${…} anything.
  static pattern(template: string): RegExp | undefined {
    const parts: string[] = [];
    let literal = '', i = 0;
    for (; i < template.length && template[i] !== '`'; i++) {
      if (template[i] !== '$' || template[i + 1] !== '{') { literal += template[i]; continue; }
      parts.push(literal); literal = '';
      for (let depth = 0; i < template.length; i++) {
        if (template[i] === '{') { depth++; } else if (template[i] === '}' && --depth === 0) { break; }
      }
    }
    parts.push(literal);
    return this.joined(parts);
  }
}
