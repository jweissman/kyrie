import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// An author's own adventure, linted where the author keeps it. Found by an architecture review: run from anywhere
// but the game's own directory, lint could not find the shared rules; and an error in any campaign but the game's
// own left it saying 0, so it could not stand as a check before play; and a hazard's effect was checked only when it
// struck.
class Author {
  static readonly kyrie = resolve(import.meta.dir, '../bin/kyrie');
  static lint(dir: string) {
    return spawnSync(this.kyrie, ['lint', 'mine/probe.campaign.json'], { cwd: dir, encoding: 'utf8' });
  }
}

describe('an author\'s own adventure', () => {
  it('is linted from where the author keeps it, and an error in it fails the lint', () => {
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-author-'));
    try {
      cpSync(resolve(import.meta.dir, 'fixtures/probes/local-kind'), join(dir, 'mine'), { recursive: true });
      const clean = Author.lint(dir);
      expect([clean.status, clean.stdout]).toEqual([0, expect.stringContaining('mine/probe.campaign.json')]);
      const site = join(dir, 'mine/site.kyr'), text = readFileSync(site, 'utf8');
      writeFileSync(site, text.replace(/\n}\s*$/, '\n  Rule glints when glinting(ox) { Assert at(ox, barley). }\n}\n'));
      const broken = Author.lint(dir);
      expect([broken.status, broken.stdout]).toEqual([1, expect.stringContaining('Unknown function or arity: glinting(ox)')]);
      // A hazard that would fail only when it struck fails the lint: no such condition, no such damage.
      writeFileSync(site, text.replace(/\n}\s*$/, '\n  Hazard snare "a snare" means "Apply nonexistent_condition to ally for 1 hour.".'
        + '\n  Hazard burn "a burn" means "Deal (1d4) fyre damage to ally.".\n}\n'));
      const struck = Author.lint(dir);
      expect(struck.status).toBe(1);
      expect(struck.stdout).toContain('Unknown status nonexistent_condition');
      expect(struck.stdout).toContain('Unknown damage type fyre');
    } finally { rmSync(dir, { recursive: true, force: true }); }
    // Three lints, each a process of its own: half a minute alone, and four times that among the suite's workers.
  }, 300000);
});
