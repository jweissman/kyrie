import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// One command, one coordinator (MT-24, the architectural review's Finding C: "a caller invokes Campaign.executeAsync
// directly and obtains behaviour different from the canonical player path"): in the engine's own source, a campaign's
// command is done only by the session (PlaySession.perform), whose one rollback boundary covers everything that comes
// of it (test/command-faults). Specs and scripts may drive a campaign directly; the product may not.
const files = (dir: string): string[] => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
});
const allowed = new Set(['src/session/play-session.ts', 'src/campaign/campaign.ts']);

describe('a campaign command is done only by the session', () => {
  it('has no other caller of Campaign.execute or executeAsync in src or web', () => {
    const callers = [...files('src'), ...files('web')].filter(f => !allowed.has(f))
      .filter(f => /\.\s*execute(Async)?\(/.test(readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '')));
    expect(callers).toEqual([]);
  });
});
