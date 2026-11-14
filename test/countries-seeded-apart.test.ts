import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { WorldAssembler } from '../src/world/world-assembler';
import type { InstalledModule } from '../src/campaign/definition';

// Two countries of one world beyond its first are drawn on seeds of their own (the architecture review's AX-02):
// every drawn country's Kyr module is `Module region`, and a module was seeded by its own id, so the people two
// countries held under one local id rolled one body (10 of the 17 of one people and calling). Fixed-stat creatures
// (ghouls) are alike by design.
describe('countries beyond the first', () => {
  it('are seeded apart, and their people of one kind are not rolled alike', async () => {
    const base = NodeBundleSource.shared;
    const host: InstalledModule = { id: 'region', name: 'host', seed: 'host', installedAt: 0, actors: [], pressures: [],
      outcomes: [], goal: { kind: 'boolean', value: false }, exports: { party: 'party' } };
    const drafts = await Promise.all(([[-1, 0], [0, -1]] as const).map(async ([x, y]) => {
      const beyond = await WorldAssembler.beyond('a1', base, { x, y, exclude: [], first: 'plains' });
      return { rid: beyond.requests[0]!.id, draft: await ModuleBundle.load(beyond.requests[0]!, { seed: 'a1',
        installed: [host] }, beyond.source) };
    }));
    const [a, b] = drafts as [typeof drafts[0], typeof drafts[0]];
    expect(a.draft.seed).not.toBe(b.draft.seed);
    const local = (id: string, rid: string) => id.slice(rid.length + 2);
    const theirs = new Map(b.draft.instance.campaign!.creatures.map(c => [local(c.id, b.rid), c]));
    const pairs = a.draft.instance.campaign!.creatures.map(c => [c, theirs.get(local(c.id, a.rid))] as const)
      .filter(([m, o]) => o && m.context.raceId === o.context.raceId && m.context.classId === o.context.classId
        && m.context.classId);
    expect(pairs.length).toBeGreaterThan(3);
    expect(pairs.every(([m, o]) => m.seed !== o!.seed)).toBe(true);
  }, 120_000);
});
