import { describe, expect, it } from 'bun:test';
import world from '../data/generation/scenes/orsino-world.json';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// Orsino's treasure tiers (treasureTier, data/generation/scenes/orsino-world.json#dungeon.treasure) are what a deep
// site's rooms hold, by depth, narrowed by what its purpose says its makers and those after them left: the inventory
// had called them reference only.
describe("a deep site's finds", () => {
  it('are drawn from Orsino\'s treasure tiers', async () => {
    const tiers = new Set(Object.values((world as unknown as { dungeon: { treasure: Record<string, string[]> } })
      .dungeon.treasure).flat());
    expect(Object.keys((world as unknown as { dungeon: { treasure: object } }).dungeon.treasure)).toHaveLength(6);
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source), live = s.campaign.world;
    const finds = s.campaign.module.entities.filter(e => e.type === 'item' && /_find\d+$/.test(e.id))
      .map(e => live.one('itemKind', e.id)!);
    expect(finds.length).toBeGreaterThan(0);
    expect(finds.some(kind => tiers.has(kind))).toBe(true);
  }, 120000);
});
