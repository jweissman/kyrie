import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Costs } from '../src/costs';

// compile-once-plan.md step 1: a module's own files, compiled (read among their kinds, joined, shadowed), are kept by
// their texts and the shared rules' edition (CompiledModules). A start that takes them as kept is the start that
// compiles them afresh, its whole checkpoint alike; its catalog is still campaign-owned.
describe('a module compiled before', () => {
  const site = (more: string) => `Module keptcompile "Two files" {
  Relation weighed(group).
  Place field "a field" is wilderness.
  Place barley "the barley" is room within field at 0, 0.
  Company party "You" of 1 at barley.
  Item ox "a little ox of dreg" is dreg_kept_ox at barley.${more}
}`;
  const made = (dir: string, more = '') => {
    writeFileSync(join(dir, 'kinds.kyr'), 'Module keptcompile "Two files" {\n'
      + '  Kind dreg_kept_ox "a little ox of dreg, on a cord" is treasure worth 2 weighing 1.\n}');
    writeFileSync(join(dir, 'site.kyr'), site(more));
    writeFileSync(join(dir, 'module.json'), JSON.stringify({ version: 1, source: ['kinds.kyr', 'site.kyr'],
      rules: ['world'], globals: ['party'], exports: { party: 'party' } }));
    writeFileSync(join(dir, 'probe.campaign.json'), JSON.stringify({ version: 1, name: 'Probe: kept compile',
      modules: [{ id: 'p', bundle: 'module.json' }], party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }));
    return join(dir, 'probe.campaign.json');
  };
  // Each from a source of its own, so that neither is the other's campaign forked (Campaign.loads).
  const start = async (path: string) => {
    const mark = Costs.mark(), session = await PlaySession.start(path, 'kept', new NodeBundleSource());
    return { checkpoint: JSON.stringify(session.checkpoint()), kept: Costs.since(mark)['compiled kept']?.n ?? 0,
      catalog: session.campaign.catalog };
  };
  it('is installed as it is compiled afresh, its kinds declared again', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-compiled-'));
    try {
      // Afresh: a text no start has compiled (its comment its own), then the same again, kept.
      const path = made(dir, `\n  // ${dir}`);
      const fresh = await start(path);
      expect(fresh.checkpoint).toContain('dreg_kept_ox');
      const kept = await start(path);
      // At least this module kept (on CI a shared piece compiled by the first start is kept by the second as well).
      expect(kept.kept).toBeGreaterThan(fresh.kept);
      expect(kept.catalog.find('dreg_kept_ox')?.name).toBe('a little ox of dreg, on a cord');
      expect(kept.checkpoint).toBe(fresh.checkpoint);
      // Its name the shared rules' too (weighed) is its own as it was compiled: lint's word kept with it.
      expect(kept.checkpoint).toContain('own_weighed');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 60000);
});
