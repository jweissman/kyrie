import { describe, expect, it } from 'bun:test';
import { BgImport } from '../scripts/bg-import';

// Every painting in assets/bg as sources.json says it, by its file and digest (test/small/bg-sources holds the naming
// and the matching on made-up inputs). It reads the paintings' bytes, so it is the images lane's (test/lanes.json):
// CI's images job, on a full checkout, with KYRIE_IMAGES=1; a builder's worktree has no assets/ (tools/worktree.sh).
// Where this fails, a painting was added, moved or painted over: `bun scripts/bg-import.ts` brings it in.
describe.skipIf(!process.env.KYRIE_IMAGES)('the owner\'s scene paintings, on disk', () => {
  it('knows every painting in assets/bg as it is', () => {
    const { fresh, gone } = BgImport.match(BgImport.read());
    expect({ fresh, gone }).toEqual({ fresh: [], gone: [] });
  });
});
