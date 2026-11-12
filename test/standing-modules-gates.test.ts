import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import countries from '../data/adventures/countries.json';

// The three standing modules (the Numbered House, the Bound Howe, the Silent Lord) stand in kahitude, the reference
// country, and every way into every country the world offers must still load beside them: no kind or id of theirs may
// be declared differently by an adventure (writ_kind, veil_kind and the rest clashed until each was given its module's
// name).
describe('every gate of a world where the three modules stand', () => {
  it('loads the way into each province without error', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {});
        const placed = new Set(w.report.region.provinces!.map(p => p.country));
    const ids = (countries.countries as { id: string; province?: boolean }[])
      .filter(c => c.province && placed.has(c.id)).map(c => c.id);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    const failed: string[] = [];
    for (const id of ids) {
      // Each gate in a game of its own: a world grown by every country before it gets slower with each.
      const t0 = Date.now(), s = await PlaySession.start(w.path, 'kahitude', w.source), frontier = new Frontier('kahitude', NodeBundleSource.shared);
      try { await GeneratedWorld.travel(s, `gate_${id}`); await frontier.expand(s.campaign); }
      catch (e) { failed.push(`${id}: ${(e as Error).message.slice(0, 200)}`); }
      process.stderr.write(`gate ${id} ${Date.now() - t0}ms\n`);
    }
    expect(failed).toEqual([]);
  }, 3000000);
});
