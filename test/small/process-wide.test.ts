import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// What is still installed for the whole process, not for a campaign (the installed context, OR-520): a static that
// installs, activates or resets state every campaign then shares. The rules' ports are a campaign's installation now
// (src/ports/installed.ts); these remain, each to be scoped or kept as parse-time, and the list may only shrink.
const root = join(import.meta.dir, '../..');
const kept = [
  'src/setting-port.ts SettingPort.install',
];
class ProcessWide {
  // A static install, activate or reset, over lines or on one; and a body that sets or calls into its own state.
  private static readonly statics = new RegExp(['^ {2}static (install|activate|reset)\\([^)]*\\)[^{]*\\{([\\s\\S]*?)^ {2}\\}$',
    '^ {2}static (install|activate|reset)\\([^)]*\\)[^{]*\\{(.*)\\}$'].join('|'), 'gm');
  private static readonly changes = /this\.\w+(\??\.\w+\()?\s*(=|\()|this\.\w+\??\.(install|set|clear|delete)\(/;
  // Each static install, activate or reset whose body changes the class's own state.
  static found(): string[] {
    const out: string[] = [];
    for (const file of this.files(join(root, 'src'))) {
      const text = readFileSync(file, 'utf8'), rel = relative(root, file);
      for (const m of text.matchAll(/^export class (\w+)[^{]*\{([\s\S]*?)^\}/gm)) {
        for (const s of m[2]!.matchAll(this.statics)) {
          if (this.changes.test(s[2] ?? s[4] ?? '')) { out.push(`${rel} ${m[1]}.${s[1] ?? s[3]}`); }
        }
      }
    }
    return out.sort();
  }
  private static files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? this.files(join(dir, d.name))
      : d.name.endsWith('.ts') ? [join(dir, d.name)] : []);
  }
}

describe('what is installed for the whole process', () => {
  it('is no more than it was: the rules\' ports a campaign\'s own', () => {
    const found = ProcessWide.found();
    expect(found.filter(f => !kept.includes(f))).toEqual([]);
    expect(kept.filter(k => !found.includes(k))).toEqual([]);
  });
});
